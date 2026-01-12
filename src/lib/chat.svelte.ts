// src/lib/chat.svelte.ts
import type { Message } from '$lib/types';
import { markdownToHtml } from '$lib/utils/markdown-to-html';
import { extractFinalModelResponse } from './utils/extract-final-model-response';

export const chatState = $state({
	messages: [
		{
			id: crypto.randomUUID(),
			role: 'assistant',
			html: '<b>Hi!</b> How can I help you today?'
		}
	] as Message[],
	input: '',
	loading: false,
	sessionId: undefined as string | undefined
});

export async function sendMessage() {
	if (!chatState.input.trim() || chatState.loading) {
		return;
	}

	const currentInput = chatState.input;
	chatState.messages.push({ id: crypto.randomUUID(), role: 'user', text: currentInput });
	chatState.input = '';
	chatState.loading = true;

	const assistantMessageId = crypto.randomUUID();
	chatState.messages.push({ id: assistantMessageId, role: 'assistant', html: '' });

	const isFirstMessage = !chatState.sessionId;
	let currentSessionId = chatState.sessionId;
	if (isFirstMessage) {
		currentSessionId = crypto.randomUUID();
		chatState.sessionId = currentSessionId;
	}

	try {
		const res = await fetch('/api/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				message: currentInput,
				sessionId: currentSessionId,
				is_first_message: isFirstMessage
			})
		});

		if (!res.ok) {
			const errorText = await res.text();
			throw new Error(`API request failed with status ${res.status}: ${errorText}`);
		}

		const resData = await res.json();
		let fullResponseMarkdown = extractFinalModelResponse(resData)

		const safeHtml = await markdownToHtml(fullResponseMarkdown);

		const assistantMessage = chatState.messages.find((m) => m.id === assistantMessageId);
		if (assistantMessage) {
			if (safeHtml) {
				assistantMessage.html = safeHtml;
			} else {
				assistantMessage.html = 'Received a non-text response from the agent.';
			}
		}
	} catch (error) {
		console.error('Fetch Error:', error);
		const errorMessage = error instanceof Error ? error.message : String(error);

		chatState.messages = chatState.messages.filter((m) => m.id !== assistantMessageId);

		chatState.messages.push({
			id: crypto.randomUUID(),
			role: 'error',
			text: `A network error occurred: ${errorMessage}`
		});
	} finally {
		chatState.loading = false;
	}
}
