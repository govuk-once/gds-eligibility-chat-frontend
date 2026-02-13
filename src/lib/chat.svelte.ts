import type { Message, Action } from '$lib/types';
import { markdownToHtml } from '$lib/utils/markdown-to-html';
import { parseUserAgentMultipleChoice } from '$lib/utils/parse-user-agent-multiple-choice';
import {
	extractFinalModelResponse,
	type ElicitationResponse
} from './utils/extract-final-model-response';
import { isUserInputVaulted } from '$lib/utils/is-user-input-vaulted';

export const chatState = $state({
	messages: [
		{
			id: crypto.randomUUID(),
			role: 'assistant',
			html: '<p><b>Hi!</b> How can I help you today?</p>'
		}
	] as Message[],
	input: '',
	loading: false,
	sessionId: undefined as string | undefined,
	activeActions: [] as Action[],
	pendingActionPayload: undefined as string | undefined
});

async function postMessageAndHandleResponse(message: string, isFirstMessage: boolean) {
	chatState.loading = true;
	const assistantMessageId = crypto.randomUUID();
	chatState.messages = [
		...chatState.messages,
		{ id: assistantMessageId, role: 'assistant', html: '', streaming: true }
	];

	let currentSessionId = chatState.sessionId;
	if (isFirstMessage && !currentSessionId) {
		currentSessionId = crypto.randomUUID();
		chatState.sessionId = currentSessionId;
	}
	try {
		const res = await fetch('/api/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				message: message,
				sessionId: currentSessionId,
				is_first_message: isFirstMessage
			})
		});

		if (!res.ok) {
			const errorText = await res.text();
			throw new Error(`API request failed with status ${res.status}: ${errorText}`);
		}

		const resData = await res.json();
		const finalResponse: ElicitationResponse = extractFinalModelResponse(resData);

		const fullResponseMarkdown =
			finalResponse.source === 'user_agent' && finalResponse.reply_type === 'choice_multiple'
				? parseUserAgentMultipleChoice(finalResponse)
				: finalResponse.content;
		const actions = finalResponse.actions;
		const source = finalResponse.source;
		const reply_type = finalResponse.reply_type;

		const safeHtml = await markdownToHtml(fullResponseMarkdown);

		const assistantMessage = chatState.messages.find((m) => m.id === assistantMessageId);
		if (assistantMessage) {
			assistantMessage.markdown = fullResponseMarkdown;
			assistantMessage.source = source || 'user_agent';
			assistantMessage.reply_type = reply_type || 'free_text';
			if (safeHtml) {
				assistantMessage.html = safeHtml;
			} else {
				assistantMessage.html = 'Received a non-text response from the agent.';
			}
			if (actions && actions.length > 0) {
				assistantMessage.actions = actions;
				chatState.activeActions = actions;
			} else {
				chatState.activeActions = [];
			}
		}
	} catch (error) {
		console.error('Fetch Error:', error);
		const errorMessage = error instanceof Error ? error.message : String(error);

		// Remove the placeholder message
		chatState.messages = chatState.messages.filter((m) => m.id !== assistantMessageId);

		chatState.messages = [
			...chatState.messages,
			{
				id: crypto.randomUUID(),
				role: 'error',
				text: `A network error occurred: ${errorMessage}`
			}
		];
	} finally {
		chatState.loading = false;
	}
}
export async function finishedStreaming(messageId: string, finalMarkdown: string) {
	const message = chatState.messages.find((m) => m.id === messageId);
	if (message) {
		message.streaming = false;
		// Update message.html with the final processed content from streaming
		const finalHtml = await markdownToHtml(finalMarkdown);
		message.html = finalHtml;
	}
}

function disablePreviousMessageActions() {
	if (chatState.messages.length > 0) {
		const lastMessage = chatState.messages.at(-1);
		if (lastMessage && lastMessage.role === 'assistant' && lastMessage.actions) {
			lastMessage.actions = [];
			chatState.activeActions = [];
			chatState.pendingActionPayload = undefined;
		}
	}
}

function shouldVault(): boolean {
	const lastMessage = chatState.messages.at(-1);
	return isUserInputVaulted(lastMessage);
}

export async function sendPayload(payload: string) {
	if (chatState.loading) {
		return;
	}
	disablePreviousMessageActions();
	chatState.messages = [
		...chatState.messages,
		{
			id: crypto.randomUUID(),
			role: 'user',
			text: payload,
			vault: shouldVault()
		}
	];

	await postMessageAndHandleResponse(payload, false);
}

export async function sendMessage() {
	const payloadToSend = chatState.pendingActionPayload || chatState.input.trim();

	if (!payloadToSend || chatState.loading) {
		return;
	}

	disablePreviousMessageActions();
	chatState.messages = [
		...chatState.messages,
		{
			id: crypto.randomUUID(),
			role: 'user',
			text: payloadToSend,
			vault: shouldVault()
		}
	];
	chatState.input = '';
	chatState.pendingActionPayload = undefined;

	const isFirstMessage = !chatState.sessionId;

	await postMessageAndHandleResponse(payloadToSend, isFirstMessage);
}
