<script lang="ts">
	import Header from '$lib/child-benefit/components/Header.svelte';
	import Footer from '$lib/child-benefit/components/Footer.svelte';
	import ChatInputBox from '$lib/child-benefit/components/ChatInputBox.svelte';
	import ChatMessage from '$lib/child-benefit/components/ChatMessage.svelte';
	import { chatState, sendMessage, autoScroll } from '$lib/child-benefit/chat.svelte';
	import { device, initDeviceListeners } from '$lib/device.svelte';
	import { virtualViewportSizer } from '$lib/utils/virtualViewportSizer.svelte';

	let chatInputBoxComponent: ReturnType<typeof ChatInputBox>;

	initDeviceListeners();

	async function handleSend() {
		await sendMessage();
		if (chatInputBoxComponent && !device.isMobile) {
			setTimeout(() => {
				chatInputBoxComponent.focusInput();
			}, 0);
		}
	}
</script>

<div class="page-container" use:virtualViewportSizer={true}>
	<Header />
	<div class="chat-container">
		<div class="chat-window" use:autoScroll>
			{#each chatState.messages as m (m.id)}
				<ChatMessage message={m} />
			{/each}

			{#if chatState.loading}
				<ChatMessage
					message={{ id: 'loading-indicator', role: 'assistant', text: 'Thinking...' }}
				/>
			{/if}
		</div>

		<ChatInputBox
			bind:this={chatInputBoxComponent}
			bind:value={chatState.input}
			loading={chatState.loading}
			placeholder="Ask me anything"
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
		margin: 0 auto;
		padding: 0 2em;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
	}

	.chat-container {
		width: 100%;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
		flex: 1;
		min-height: 0;
	}

	.chat-window {
		margin-top: 1.5em;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 1.5em;
		flex: 1;
		min-height: 0;
	}

	.keyboard-collapsed-footer {
		height: 1em;
		text-align: center;
		flex-shrink: 0;
	}
</style>
