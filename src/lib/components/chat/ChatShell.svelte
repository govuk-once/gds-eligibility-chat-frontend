<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import ChatInputBox from '$lib/components/chat/ChatInputBox.svelte';
	import ChatMessage from '$lib/components/chat/ChatMessage.svelte';
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
	<div class="chat-window" use:autoScroll bind:this={chatWindowEl}>
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

	.chat-window {
		padding-top: 1.5em;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 1.5em; /* gap between items in chat window */
		flex: 1; /* Grow to fill available space */
		min-height: 0; /* Prevent flexbox overflow */
		background-color: #f5f5f5;
	}
</style>
