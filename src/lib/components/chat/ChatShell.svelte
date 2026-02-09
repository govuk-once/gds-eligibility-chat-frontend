<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import ChatInputBox from '$lib/components/chat/ChatInputBox.svelte';
	import ChatMessage from '$lib/components/chat/ChatMessage.svelte';
	import ChatGradient from '$lib/components/chat/ChatGradient.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { chatState, sendMessage } from '$lib/chat.svelte';
	import { autoScroll } from '$lib/utils/autoScroll.svelte';

	const { footerClass = '', afterSend: afterSendCallback = null } = $props<{
		footerClass?: string;
		afterSend?: (input?: ChatInputBox) => void;
	}>();

	let chatWindowEl: HTMLDivElement;
	let chatInputBoxComponent: ChatInputBox;
	let thinkingText = $state('Thinking');

	$effect(() => {
		if (!chatState.loading) return;

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

<Header />

<div class="chat-container">
	<div class="chat-top-spacer"></div>

	<div
		class="chat-window"
		use:autoScroll
		bind:this={chatWindowEl}
		class:hide-scrollbar={footerClass === 'keyboard-collapsed-footer'}
	>
		{#each chatState.messages as m, i (m.id)}
			<ChatMessage
				message={m}
				isLast={i === chatState.messages.length - 1}
				loading={chatState.loading}
				onUpdate={handleStreamUpdate}
			/>
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

	<ChatInputBox
		bind:this={chatInputBoxComponent}
		bind:value={chatState.input}
		loading={chatState.loading}
		onSend={handleSend}
	/>
</div>

<Footer class={footerClass} />

<style>
	.chat-container {
		width: 100%;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		/* gap: 1rem; */
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
</style>
