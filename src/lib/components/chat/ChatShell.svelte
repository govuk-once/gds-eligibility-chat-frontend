<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import ChatInputBox from '$lib/components/chat/ChatInputBox.svelte';
	import ChatMessage from '$lib/components/chat/ChatMessage.svelte';
	import ChatGradient from '$lib/components/chat/ChatGradient.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { chatState, sendMessage } from '$lib/chat.svelte';
	import ChatInputActions from '$lib/components/chat/ChatInputActions.svelte';
	import { autoScroll } from '$lib/utils/autoScroll.svelte';

	const {
		footerClass: footerClassProp = '',
		afterSend: afterSendCallback = null,
		isFrameOn = false
	} = $props<{
		footerClass?: string;
		afterSend?: (input?: ChatInputBox) => void;
		isFrameOn?: boolean;
	}>();

	const footerClass = $derived(footerClassProp || (isFrameOn ? 'frame-footer' : ''));

	const hasActiveActionsAndNotStreaming = $derived(
		chatState.activeActions.length > 0 &&
			chatState.messages.at(-1) &&
			!chatState.messages.at(-1)?.streaming
	);

	let chatWindowEl: HTMLDivElement;
	let chatInputBoxComponent: ChatInputBox;
	let thinkingText = $state('Thinking');

	let placeholderText = $derived(
		chatState.activeActions.length > 0 && hasActiveActionsAndNotStreaming
			? 'Or something else ...'
			: ''
	);

	$effect(() => {
		if (!chatState.loading) return;
		// debugger; // use to analyse during 'thinking' state

		const interval = setInterval(() => {
			thinkingText += '.';
			if (thinkingText.length > 'Thinking...'.length) {
				thinkingText = 'Thinking';
			}
		}, 350);

		return () => {
			clearInterval(interval);
			thinkingText = 'Thinking';
		};
	});

	async function handleSend() {
		await sendMessage();
		afterSendCallback?.(chatInputBoxComponent);
	}

	function handleStreamUpdate() {
		requestAnimationFrame(() => {
			chatWindowEl.scrollTop = chatWindowEl.scrollHeight;
		});
	}
</script>

<Header showVault={!chatState.config.isProactive} {isFrameOn} />

<div class="chat-container">
	<div class="chat-top-spacer"></div>

	<div
		class="chat-window"
		use:autoScroll
		bind:this={chatWindowEl}
		class:hide-scrollbar={footerClass === 'keyboard-collapsed-footer'}
	>
		{#each chatState.messages as m, i (m.id)}
			{#if !(chatState.loading && i === chatState.messages.length - 1)}
				<ChatMessage
					message={m}
					isLast={i === chatState.messages.length - 1}
					loading={chatState.loading}
					onUpdate={handleStreamUpdate}
				/>
			{/if}
		{/each}

		{#if chatState.loading}
			<ChatMessage
				message={{
					id: 'loading-indicator',
					role: 'assistant',
					html: `<p>${thinkingText}</p>`
				}}
				isLast
				loading
			/>
		{/if}
		<ChatGradient />
	</div>

	<div class="chat-wrapper" class:expanded={hasActiveActionsAndNotStreaming}>
		{#if hasActiveActionsAndNotStreaming}
			<div class="extra-gap"></div>
			<div class="extra-gap"></div>
			<ChatInputActions
				message={chatState.messages.at(-1)!}
				displayedActions={chatState.activeActions}
			/>
			<div class="extra-gap"></div>
		{/if}

		<ChatInputBox
			bind:this={chatInputBoxComponent}
			bind:value={chatState.input}
			loading={chatState.loading}
			onSend={handleSend}
			placeholder={placeholderText}
			{hasActiveActionsAndNotStreaming}
		/>
	</div>
</div>

<Footer class={footerClass} {isFrameOn} />

<style>
	.chat-container {
		width: 100%;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
		flex: 1;
		min-height: 0;
	}

	.chat-top-spacer {
		height: 1.5em;
		flex-shrink: 0;
	}

	.chat-window {
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 1.5em; /* gap between items in chat window */
		flex: 1; /* Grow to fill available space */
		min-height: 0; /* Prevent flexbox overflow */
	}

	/* Hide scrollbar but allow scrolling */
	.chat-window.hide-scrollbar {
		scrollbar-width: none; /* Firefox */
		-ms-overflow-style: none; /* IE 10+ */
	}

	.chat-window.hide-scrollbar::-webkit-scrollbar {
		display: none; /* Chrome, Safari, Edge */
	}

	.extra-gap {
		height: 0.5em;
	}

	.chat-wrapper {
		box-sizing: border-box;
		border: 1px solid black;
		border-radius: 1.5em;
		overflow: hidden;
		position: relative;
		padding-top: 1em;
	}

	.chat-wrapper.expanded {
		padding-top: 0;
		padding-bottom: 1em;
	}
</style>
