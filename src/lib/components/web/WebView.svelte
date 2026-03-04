<script lang="ts">
	import ChatShell from '$lib/components/chat/ChatShell.svelte';
	import FrameToggler from '$lib/components/buttons/FrameToggler.svelte';
	import { virtualViewportSizer } from '$lib/utils/virtualViewportSizer.svelte';
	import { tick } from 'svelte';
	import ChatInputBox from '$lib/components/chat/ChatInputBox.svelte';

	let frameOn = $state(false);
	function toggleFrame() {
		frameOn = !frameOn;
	}

	async function afterSend(input?: ChatInputBox) {
		await tick();
		input?.focusInput();
	}
</script>

<div class="page-container" class:frame-on-background={frameOn}>
	<div class="app-container" use:virtualViewportSizer={!frameOn} class:frame-on-container={frameOn}>
		<ChatShell {afterSend} isFrameOn={frameOn} />
		<FrameToggler on={frameOn} toggle={toggleFrame} />
	</div>
</div>

<style>
	.page-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		width: 100vw;
		background-color: transparent;
		transition: background-color 1.5s ease;
	}

	.page-container.frame-on-background {
		background-color: black;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.app-container.frame-on-container {
		width: 25.125em;
		height: 55em;
		max-width: none; /* Override max-width when frame is on */
		margin: auto; /* Center horizontally and vertically within the flex container */
		overflow: hidden; /* Ensure content respects fixed height */
		border-radius: 3.75em;
	}

	.app-container {
		max-width: 800px;
		width: 100%;
		height: 100%;
		margin: 0 auto; /* Horizontal centering */
		padding: 0 1em;
		background-color: #f5f5f5;
		box-sizing: border-box; /* Include padding in the width calculation */
		display: flex;
		flex-direction: column;
	}
</style>
