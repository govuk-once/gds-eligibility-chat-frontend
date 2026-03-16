<script lang="ts">
	import { fade } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import { sendPayload, chatState } from '$lib/chat.svelte';
	import { authState } from '$lib/auth-journey.svelte';

	let { headerHeight = 0, footerHeight = 0 } = $props<{
		headerHeight?: number;
		footerHeight?: number;
	}>();

	function handleSubmit() {
		const content = authState.applicationFormTitle;
		
		// Find the specific application form message and mark it as submitted
		const index = chatState.messages.findIndex(m => m.id === authState.activeApplicationFormId);
		if (index !== -1) {
			chatState.messages[index].form_submitted = true;
		}

		sendPayload(`Application for ${content} submitted`);
		authState.showApplicationFormOverlay = false;
	}
</script>

<div class="overlay" transition:fade={{ duration: 500, easing: cubicInOut }}>
	<div class="sticky-header">
		<div class="header-spacer" style:height="{headerHeight}px"></div>
		<div class="extra-gap"></div>
	</div>
	<div class="scroll-container">
		<div class="image-container">
			<img src="/images/form.png" alt="application form" />
			<button class="button-box" onclick={handleSubmit} aria-label="Submit application"></button>
		</div>
		<div class="bottom-spacer" style:height="{footerHeight}px"></div>
	</div>
</div>

<style>
	.overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #f5f5f5;
		overflow-y: auto;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.overlay::-webkit-scrollbar {
		display: none;
	}

	.sticky-header {
		position: sticky;
		top: 0;
		z-index: 10;
		background-color: #f5f5f5;
		width: 100%;
	}

	.scroll-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
	}

	.header-spacer {
		width: 100%;
		flex-shrink: 0;
	}

	.extra-gap {
		border-bottom: 0.25em solid black;
		height: 0.75em;
		flex-shrink: 0;
		box-sizing: border-box;
		margin-left: 1em;
		margin-right: 1em;
	}

	.image-container {
		position: relative;
		margin: 0 1em;
		width: calc(100% - 2em);
	}

	img {
		display: block;
		width: 100%;
		height: auto;
	}

	.button-box {
		position: absolute;
		bottom: 1.2%;
		left: 50%;
		transform: translateX(-50%);
		height: 1.35%;
		width: 90%;
		/* background-color: red; */
		z-index: 5;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0;
	}

	.bottom-spacer {
		width: 100%;
		flex-shrink: 0;
	}
</style>
