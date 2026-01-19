import { chatState } from '$lib/chat.svelte';

export function autoScroll(node: HTMLElement) {
	$effect(() => {
		const lastMessage = chatState.messages.at(-1);

		if (lastMessage) {
			// Depend on all properties that can affect the final height
			const _html = lastMessage.html;
			const _streaming = lastMessage.streaming;
			const _actions = lastMessage.actions?.length;

			// Also depend on the total number of messages
			const _messageCount = chatState.messages.length;

			// Using requestAnimationFrame can be smoother for scrolling
			// as it waits for the next browser repaint.
			requestAnimationFrame(() => {
				node.scrollTop = node.scrollHeight;
			});
		}
	});
}
