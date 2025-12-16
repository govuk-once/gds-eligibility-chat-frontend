import { chatState } from '$lib/chat.svelte';

export function autoScroll(node: HTMLElement) {
	$effect(() => {
		if (chatState.messages.length) {
			node.scrollTop = node.scrollHeight;
		}
	});
}
