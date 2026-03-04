import type { Message } from '$lib/types';
import { markdownToHtml } from '$lib/utils/markdown-to-html';
import { extractFinalModelResponse } from '$lib/utils/extract-final-model-response';

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
				is_first_message: isFirstMessage,
				config: {
					isProactive: false,
					isChildBenefit: true
				}
			})
		});

		if (!res.ok) {
			const errorText = await res.text();
			throw new Error(`API request failed with status ${res.status}: ${errorText}`);
		}

		const resData = await res.json();
		const eventArray = resData.response;
		let fullResponseMarkdown = '';

		if (Array.isArray(eventArray)) {
			for (const event of eventArray) {
				if (
					event.content?.role === 'model' &&
					event.content.parts &&
					Array.isArray(event.content.parts)
				) {
					for (const part of event.content.parts) {
						if (part.text) {
							fullResponseMarkdown += part.text;
						}
					}
				}
			}
		}

		if (!fullResponseMarkdown) {
			// Fallback to extractFinalModelResponse if standard parsing fails (e.g. if it DID use a function call)
			const finalResponse = extractFinalModelResponse(resData, false);
			fullResponseMarkdown = finalResponse.content;
		}

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

export function autoScroll(node: HTMLElement) {
	$effect(() => {
		const lastMessage = chatState.messages.at(-1);

		if (lastMessage) {
			// Depend on all properties that can affect the final height
			void lastMessage.html;
			void lastMessage.streaming;
			void lastMessage.actions?.length;

			// Also depend on the total number of messages
			void chatState.messages.length;

			// Using requestAnimationFrame can be smoother for scrolling
			// as it waits for the next browser repaint.
			requestAnimationFrame(() => {
				node.scrollTop = node.scrollHeight;
			});
		}
	});
}
