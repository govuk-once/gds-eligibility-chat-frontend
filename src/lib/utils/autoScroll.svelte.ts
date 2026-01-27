import { chatState } from '$lib/chat.svelte';

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
