<script lang="ts">
	let messages = $state<{ id: string; role: 'user' | 'assistant' | 'error'; text: string }[]>([]);
	let input = $state('');
	let loading = $state(false);
	let chatWindow: HTMLDivElement;

	// Auto-scroll to the bottom of the chat window when new messages are added
	$effect(() => {
		if (chatWindow && messages.length) {
			chatWindow.scrollTop = chatWindow.scrollHeight;
		}
	});

	async function sendMessage() {
		if (!input.trim() || loading) return;

		messages.push({ id: crypto.randomUUID(), role: 'user', text: input });
		const currentInput = input;
		input = '';
		loading = true;

		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: currentInput })
			});

			if (!res.ok) {
				throw new Error('API request failed');
			}

			const data = await res.json();
			messages.push({ id: crypto.randomUUID(), role: 'assistant', text: data.reply });
		} catch (error) {
			console.log(error);
			messages.push({
				id: crypto.randomUUID(),
				role: 'error',
				text: 'Sorry, something went wrong. Please try again.'
			});
		} finally {
			loading = false;
		}
	}
</script>

<div class="chat-container">
	<h1>Chat</h1>

	<div class="chat-window" bind:this={chatWindow}>
		{#each messages as m (m.id)}
			<div class="message {m.role}">
				<strong>{m.role}:</strong>
				{m.text}
			</div>
		{/each}

		{#if loading}
			<div class="message assistant"><strong>assistant:</strong> Thinking...</div>
		{/if}
	</div>

	<form class="chat-input" on:submit|preventDefault={sendMessage}>
		<label for="chat-input" class="visually-hidden">Type a message</label>
		<input id="chat-input" bind:value={input} placeholder="Type a message…" />
		<button type="submit" disabled={loading}>Send</button>
	</form>
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
		width: 90vw;
		margin: 2rem auto; /* top/bottom margin + auto horizontal centering */
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.chat-window {
		border: 1px solid #ccc;
		padding: 1rem;
		height: 300px;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.message {
		padding: 0.5rem;
		border-radius: 0.25rem;
	}

	.message.user {
		text-align: right;
		background-color: #f0f0f0;
		align-self: flex-end;
	}

	.message.assistant {
		text-align: left;
		background-color: #e0e0e0;
		align-self: flex-start;
	}

	.message.error {
		text-align: left;
		background-color: #fdd;
		color: #c00;
		align-self: stretch;
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
		padding: 0.5rem 1rem;
		font-size: 1rem;
		cursor: pointer;
		border: 1px solid #ccc;
		border-radius: 0.25rem;
		background-color: #f0f0f0;
	}

	.chat-input button:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}
</style>
