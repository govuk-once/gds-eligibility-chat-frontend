<script lang="ts">
	import Header from '$lib/Header.svelte';
	import Footer from '$lib/Footer.svelte';
	import ChatInputBox from '$lib/ChatInputBox.svelte';
	import ChatMessage from '$lib/ChatMessage.svelte';
	import { chatState, sendMessage } from '$lib/chat.svelte';
	import { autoScroll } from '$lib/utils/autoScroll.svelte';
	import { device, initDeviceListeners } from '$lib/device.svelte';
	import { onMount, onDestroy } from 'svelte';

	let chatInputBoxComponent: ChatInputBox;
	let chatWindowEl: HTMLDivElement;

	initDeviceListeners();

	let thinkingText = $state('Thinking');
	let interval: NodeJS.Timeout;

	onMount(() => {
		interval = setInterval(() => {
			thinkingText += '.';
			if (thinkingText.length > 'Thinking...'.length) {
				thinkingText = 'Thinking';
			}
		}, 350);
	});

	onDestroy(() => {
		clearInterval(interval);
	});

	// Attachment to handle resizing when the virtual keyboard appears on mobile
	function virtualViewportSizer(node: HTMLDivElement) {
		if (typeof window === 'undefined' || !window.visualViewport) return;

		const viewport = window.visualViewport;

		const handleResize = () => {
			node.style.height = `${viewport.height}px`;
		};

		handleResize();

		viewport.addEventListener('resize', handleResize);

		// Cleanup function to remove the listener when the component is destroyed
		return () => {
			viewport.removeEventListener('resize', handleResize);
		};
	}

	async function handleSend() {
		await sendMessage();
		if (chatInputBoxComponent && !device.isMobile) {
			setTimeout(() => {
				chatInputBoxComponent.focusInput();
			}, 0);
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

<div class="page-container" {@attach virtualViewportSizer}>
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
					message={{ id: 'loading-indicator', role: 'assistant', text: thinkingText }}
					isLast={true}
					loading={chatState.loading}
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
		margin: 0 auto; /* Horizontal centering */
		padding: 0 2em; /* Add 2em "margins" on each side visually */
		box-sizing: border-box; /* Include padding in the width calculation */
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
		flex: 1; /* Grow to fill available space */
		min-height: 0; /* Prevent flexbox overflow */
	}

	.keyboard-collapsed-footer {
		height: 1em;
		text-align: center;
		flex-shrink: 0;
	}
</style>

