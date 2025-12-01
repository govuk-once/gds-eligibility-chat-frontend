<script lang="ts">


	let messages = $state<{ id: string; role: 'user' | 'assistant' | 'error'; text: string }[]>([]);
	let input = $state('');
	let loading = $state(false);

	// Attachment to handle resizing when the virtual keyboard appears on mobile
	function virtualViewportSizer(node: HTMLDivElement) {
		// Ensure this only runs on the client where window and visualViewport are available
		if (typeof window === 'undefined' || !window.visualViewport) return;

		const viewport = window.visualViewport;

		const handleResize = () => {
			node.style.height = `${viewport.height}px`;
		};

		// Set the initial size
		handleResize();

		// Add event listener for changes
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

	<div class="chat-input">
		<label for="chat-input" class="visually-hidden">Type a message</label>
		<input
			id="chat-input"
			bind:value={input}
			placeholder="What are you looking for?"
			onkeydown={(e) => e.key === 'Enter' && sendMessage()}
		/>
		<button type="button" onclick={sendMessage} disabled={loading} aria-label="Send message"></button>
	</div>
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
		/* Height is now controlled by JavaScript */
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

	.chat-input {
		display: flex;
		gap: 0.5rem;
	}

	.chat-input input {
		flex: 1;
		padding: 0.5rem;
		font-size: 1rem;
		border: 1px solid #ccc;
		border-radius: 0.25rem;
	}

	.chat-input button {
		width: 40px;
		height: 40px;
		padding: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 1rem;
		cursor: pointer;
		border: none;
		border-radius: 50%;
		background-color: black;
		color: white; /* For potential icon */
	}

	.chat-input button:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}
</style>
