<script lang="ts">
	import ChatInputBox from '$lib/ChatInputBox.svelte';

	let messages = $state<{ id: string; role: 'user' | 'assistant' | 'error'; text: string }[]>([]);
	let input = $state('');
	let loading = $state(false);
	let chatInputBoxComponent: ChatInputBox;
	let isMobileDevice = false; // New variable to track device type

	// Effect to detect mobile device based on pointer capability
	$effect(() => {
		if (typeof window !== 'undefined') {
			const mediaQuery = window.matchMedia('(pointer: coarse)');
			isMobileDevice = mediaQuery.matches;

			// Listen for changes (though unlikely to change during session)
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
		};

		handleResize();

		viewport.addEventListener('resize', handleResize);

		// Cleanup function to remove the listener when the component is destroyed
		return () => {
			viewport.removeEventListener('resize', handleResize);
		};
	}

	function autoScroll(node: HTMLElement) {
		$effect(() => {
			if (messages.length) {
				node.scrollTop = node.scrollHeight;
			}
		});
	}

	async function sendMessage() {
		if (!input.trim() || loading) {
			return;
		}

		const currentInput = input;
		messages.push({ id: crypto.randomUUID(), role: 'user', text: currentInput });
		input = '';

		loading = true;

		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: currentInput })
			});

			if (!res.ok) {
				throw new Error(`API request failed with status ${res.status}`);
			}

			const resData = await res.json();
			messages.push({ id: crypto.randomUUID(), role: 'assistant', text: resData.reply });
		} catch (error) {
			console.error('Fetch Error:', error);
			const errorMessage = error instanceof Error ? error.message : String(error);
			messages.push({
				id: crypto.randomUUID(),
				role: 'error',
				text: `A network error occurred: ${errorMessage}`
			});
		} finally {
			loading = false;
			// Only refocus if not on a mobile device
			if (chatInputBoxComponent && !isMobileDevice) {
				// Add small delay to ensure DOM has updated after `loading = false`
				// and input is ready to receive focus.
				setTimeout(() => {
					chatInputBoxComponent.focusInput();
				}, 0);
			}
		}
	}
</script>

<div class="chat-container" {@attach virtualViewportSizer}>
	<div class="chat-window" {@attach autoScroll}>
		{#each messages as m (m.id)}
			<div class="message {m.role}">
				{m.text}
			</div>
		{/each}

		{#if loading}
			<div class="message assistant"><strong>assistant:</strong> Thinking...</div>
		{/if}
	</div>

	<ChatInputBox
		bind:this={chatInputBoxComponent}
		bind:value={input}
		{loading}
		placeholder="What are you looking for?"
		onSend={sendMessage}
	/>
</div>

<style>
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
		max-width: 800px;
		width: 100%; /* Take full width to be centered by margin */
		margin: 0 auto; /* Horizontal centering */
		padding: 1rem;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
		/* Height is controlled by JavaScript */
	}

	.chat-window {
		border: 1px solid #ccc;
		padding: 1rem;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1; /* Grow to fill available space */
		min-height: 0; /* Prevent flexbox overflow */
	}

	.message {
		/* Base styling for all messages, will be overridden for assistant/error */
		overflow-wrap: break-word;
		word-break: break-word; /* For older browser compatibility and stronger breaking */
	}

	.message.user {
		padding: 0.5rem;
		border-radius: 0.25rem;
		text-align: left;
		background-color: #f0f0f0;
		align-self: flex-end; /* Chat bubble effect */
		max-width: 80%; /* Optional: limit width for bubble effect */
	}

	.message.assistant,
	.message.error {
		padding: 0.5rem 0.5rem;
		border-radius: 0;
		background-color: transparent;
		text-align: left;
		align-self: stretch;
	}

	.message.error {
		color: #c00;
	}
</style>
