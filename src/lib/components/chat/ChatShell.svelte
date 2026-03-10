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

	const lastMessage = $derived(chatState.messages.at(-1));

	const messageWithActions = $derived.by(() => {
		const lastSignIn = [...chatState.messages].reverse().find((m) => m.reply_type === 'sign_in');

		if (chatState.showSignInForm) {
			return lastSignIn;
		}

		// If we're loading and the last assistant message was sign_in, we're likely in transition
		if (
			chatState.loading &&
			lastSignIn &&
			lastSignIn === chatState.messages.findLast((m) => m.role === 'assistant')
		) {
			return lastSignIn;
		}

		return lastMessage;
	});

	const hasActiveActionsAndNotStreaming = $derived(
		!chatState.loading &&
			(chatState.activeActions.length > 0 ||
				messageWithActions?.reply_type === 'sign_in' ||
				chatState.showSignInForm) &&
			messageWithActions &&
			!messageWithActions.streaming
	);

	const isInputHidden = $derived(
		!chatState.loading &&
			messageWithActions?.reply_type === 'sign_in' &&
			!chatState.showSignInForm &&
			!messageWithActions.streaming
	);

	const GRADIENT_RGB = '245, 245, 245';
	const GRADIENT_MAX_OPACITY = 0.3;

	let chatWindowEl: HTMLDivElement;
	let chatInputBoxComponent: ChatInputBox;
	let thinkingText = $state('Thinking');

	let wrapperHeight = $state(0);
	let footerHeight = $state(0);
	let gradientHeight = $state(0);

	let placeholderText = $derived(
		hasActiveActionsAndNotStreaming
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

	// State to track if at the bottom BEFORE a height change
	let wasAtBottom = true;

	$effect.pre(() => {
		// Track dependencies that cause layout shifts
		void wrapperHeight;
		void footerHeight;
		void gradientHeight;
		void hasActiveActionsAndNotStreaming;

		if (chatWindowEl) {
			// Capture scroll state before the DOM updates with new heights
			wasAtBottom =
				chatWindowEl.scrollHeight - chatWindowEl.scrollTop - chatWindowEl.clientHeight < 50;
		}
	});

	// Auto-scroll after heights have applied to the DOM
	$effect(() => {
		// Track same dependencies
		void wrapperHeight;
		void footerHeight;
		void gradientHeight;
		void hasActiveActionsAndNotStreaming;

		if (chatWindowEl && (wasAtBottom || chatState.loading)) {
			// Use requestAnimationFrame to ensure the browser has processed the layout shift
			requestAnimationFrame(() => {
				chatWindowEl.scrollTop = chatWindowEl.scrollHeight;
			});
		}
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

<Header showIcons={!chatState.config.isProactive} {isFrameOn} />

<div class="chat-container">
	<div class="chat-main-area">
		<div class="chat-window" use:autoScroll bind:this={chatWindowEl}>
			<div class="chat-messages-container">
				<div class="chat-top-spacer"></div>

				{#each chatState.messages as m, i (m.id)}
					{#if !(chatState.loading && i === chatState.messages.length - 1 && m.role === 'assistant')}
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
			</div>

			<div
				class="bottom-spacer"
				style:height="{wrapperHeight + footerHeight + gradientHeight}px"
			></div>
		</div>

		<div class="footer-layer" bind:clientHeight={footerHeight}>
			<Footer class={footerClass} {isFrameOn} />
		</div>

		<div
			class="wrapper-layer"
			style:bottom="{footerHeight}px"
			bind:clientHeight={wrapperHeight}
		>
			<div
				class="bottom-background-gradient"
				style:height="{footerHeight + wrapperHeight}px"
				style:bottom="-{footerHeight}px"
				style:background-color="rgba({GRADIENT_RGB}, {GRADIENT_MAX_OPACITY})"
			></div>

			<div class="gradient-layer-container">
				<div bind:clientHeight={gradientHeight}>
					<ChatGradient
						position="static"
						rgb={GRADIENT_RGB}
						maxOpacity={GRADIENT_MAX_OPACITY}
					/>
				</div>
			</div>

			<div
				class="blur-layer"
				style:height="{footerHeight + wrapperHeight + gradientHeight}px"
				style:bottom="-{footerHeight}px"
			></div>

			<div
				class="chat-wrapper"
				class:expanded={hasActiveActionsAndNotStreaming}
				class:no-bottom-padding={isInputHidden}
			>
				{#if hasActiveActionsAndNotStreaming && messageWithActions}
					<div class="extra-gap"></div>
					<div class="extra-gap"></div>
					<ChatInputActions
						message={messageWithActions}
						displayedActions={chatState.activeActions}
					/>
					<div class="extra-gap"></div>
				{/if}

				{#if !isInputHidden}
					<ChatInputBox
						bind:this={chatInputBoxComponent}
						bind:value={chatState.input}
						loading={chatState.loading}
						onSend={handleSend}
						placeholder={placeholderText}
						{hasActiveActionsAndNotStreaming}
					/>
				{/if}
			</div>
		</div>
	</div>
</div>

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

	.chat-main-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		position: relative;
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
		flex: 1; /* Grow to fill available space */
		min-height: 0; /* Prevent flexbox overflow */
		z-index: 20;

		/* Hide scrollbar but allow scrolling */
		scrollbar-width: none; /* Firefox */
		-ms-overflow-style: none; /* IE 10+ */
	}

	.chat-window::-webkit-scrollbar {
		display: none; /* Chrome, Safari, Edge */
	}

	.chat-messages-container {
		display: flex;
		flex-direction: column;
		gap: 1.5em; /* gap between items in chat window */
		position: relative;
	}

	.extra-gap {
		height: 0.5em;
	}

	.bottom-spacer {
		flex-shrink: 0;
	}

	.footer-layer {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 10;
	}

	.wrapper-layer {
		position: absolute;
		left: 0;
		right: 0;
		z-index: 30;
	}

	.bottom-background-gradient {
		position: absolute;
		left: 0;
		right: 0;
		z-index: 3;
		pointer-events: none;
	}

	.gradient-layer-container {
		position: absolute;
		bottom: 100%;
		width: 100%;
		pointer-events: none;
		z-index: 3;
	}

	.blur-layer {
		position: absolute;
		left: 0;
		right: 0;
		z-index: 2;
		pointer-events: none;
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		mask-image: linear-gradient(to bottom, transparent, black);
		-webkit-mask-image: linear-gradient(to bottom, transparent, black);
	}

	.chat-wrapper {
		box-sizing: border-box;
		border: 1px solid black;
		background-color: white;
		border-radius: 1.5em;
		overflow: hidden;
		position: relative;
		padding-top: 1em;
		z-index: 4;
	}

	.chat-wrapper.expanded {
		padding-top: 0;
		padding-bottom: 1em;
	}

	.chat-wrapper.expanded.no-bottom-padding {
		padding-bottom: 0;
	}
</style>
