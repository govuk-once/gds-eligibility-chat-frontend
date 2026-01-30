<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ChatInputBox from '$lib/components/ChatInputBox.svelte';
	import ChatMessage from '$lib/components/ChatMessage.svelte';
	import { chatState, sendMessage } from '$lib/chat.svelte';
	import { autoScroll } from '$lib/utils/autoScroll.svelte';
	import { device, initDeviceListeners } from '$lib/device.svelte';
	import { virtualViewportSizer } from '$lib/utils/virtualViewportSizer.svelte';
	import { tick } from 'svelte';

	let chatInputBoxComponent: ChatInputBox;
	let chatWindowEl: HTMLDivElement;

	initDeviceListeners();

	let thinkingText = $state('Thinking');

	$effect(() => {
		if (chatState.loading) {
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
		}
	});

	async function handleSend() {
		await sendMessage();
		if (chatInputBoxComponent && !device.isMobile) {
			await tick();
			chatInputBoxComponent.focusInput();
		}
	}
	function handleStreamUpdate() {
		if (chatWindowEl) {
			// Wait for the next frame to allow the DOM to update
			// before we measure the new scrollHeight.
			requestAnimationFrame(() => {
				chatWindowEl.scrollTop = chatWindowEl.scrollHeight;
			});
		}
	}
</script>

<div class="page-container" use:virtualViewportSizer>
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
						html: '<p>' + thinkingText + '</p>'
					}}
					isLast={true}
					loading={chatState.loading}
				/>
			{/if}
		</div>

		<ChatInputBox
			bind:this={chatInputBoxComponent}
			bind:value={chatState.input}
			loading={chatState.loading}
			placeholder=""
			onSend={handleSend}
		/>
	</div>
	{#if !device.isMobile}
		<Footer />
	{/if}
	{#if device.isMobile && device.isKeyboardCollapsed}
		<footer class="keyboard-collapsed-footer"></footer>
	{/if}
</div>

<style>
	.page-container {
		max-width: 800px;
		width: 100%;
		margin: 0 auto; /* Horizontal centering */
		padding: 0 1em;
		background-color: #F5F5F5;
		box-sizing: border-box; /* Include padding in the width calculation */
		display: flex;
		flex-direction: column;
	}

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
		background-color: #F5F5F5;
	}

	.keyboard-collapsed-footer {
		height: 1em;
		text-align: center;
		flex-shrink: 0;
	}
</style>
