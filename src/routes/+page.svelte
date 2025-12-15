<script lang="ts">
	import Header from '$lib/Header.svelte';
	import Footer from '$lib/Footer.svelte';
	import ChatInputBox from '$lib/ChatInputBox.svelte';
	import ChatMessage from '$lib/ChatMessage.svelte';
	import { chatState, sendMessage } from '$lib/chat.svelte';
	import { autoScroll } from '$lib/utils/autoScroll.svelte';

	let chatInputBoxComponent: ChatInputBox;
	let isMobileDevice = $state(false);
	let isKeyboardCollapsed = $state(true);

	// Effect to detect mobile device based on pointer capability
	$effect(() => {
		if (typeof window !== 'undefined') {
			const mediaQuery = window.matchMedia('(pointer: coarse)');
			isMobileDevice = mediaQuery.matches;

			const handleChange = (e: MediaQueryListEvent) => {
				isMobileDevice = e.matches;
			};
			mediaQuery.addEventListener('change', handleChange);
			return () => mediaQuery.removeEventListener('change', handleChange);
		}
	});

	// Attachment to handle resizing when the virtual keyboard appears on mobile
	function virtualViewportSizer(node: HTMLDivElement) {
		if (typeof window === 'undefined' || !window.visualViewport) return;

		const viewport = window.visualViewport;

		const handleResize = () => {
			node.style.height = `${viewport.height}px`;

			const keyboardThreshold = 150;
			isKeyboardCollapsed = !(window.innerHeight - viewport.height > keyboardThreshold);
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
		if (chatInputBoxComponent && !isMobileDevice) {
			setTimeout(() => {
				chatInputBoxComponent.focusInput();
			}, 0);
		}
	}
</script>

<div class="page-container" {@attach virtualViewportSizer}>
	<Header />
	<div class="chat-container">
		<div class="chat-window" {@attach autoScroll}>
			{#each chatState.messages as m (m.id)}
				<ChatMessage message={m} />
			{/each}

			{#if chatState.loading}
				<ChatMessage message={{ id: 'loading-indicator', role: 'assistant', text: 'Thinking...' }} />
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
	{#if !isMobileDevice}
		<Footer />
	{/if}
	{#if isMobileDevice && isKeyboardCollapsed}
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
	/* A visually hidden class for accessible labels */
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		border: 0;
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
