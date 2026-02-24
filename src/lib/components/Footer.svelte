<script lang="ts">
	import { chatState } from '$lib/chat.svelte';
	import { device } from '$lib/device.svelte';

	let { class: className = '', isFrameOn = false } = $props<{
		class?: string;
		isFrameOn?: boolean;
	}>();

	const isProactiveWebNoFrame = $derived(chatState.proactive && !device.isMobile && !isFrameOn);
</script>

<footer class={className} class:proactive-footer={isProactiveWebNoFrame}></footer>

<style>
	footer {
		height: 6.625em;
		background-color: #f5f5f5;
	}

	footer.proactive-footer {
		height: 3.5em;
	}

	.keyboard-collapsed-footer {
		height: 1em;
		text-align: center;
		flex-shrink: 0;
	}

	.mobile-footer {
		height: 0em;
	}
</style>
