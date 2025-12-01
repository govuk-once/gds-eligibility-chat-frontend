<script lang="ts">
	let messages: { id: string; role: 'user' | 'assistant'; text: string }[] = [];
	let input = '';

	async function sendMessage() {
		if (!input.trim()) return;

		messages = [...messages, { id: crypto.randomUUID(), role: 'user', text: input }];

		const res = await fetch('/api/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ message: input })
		});
		const data = await res.json();

		messages = [...messages, { id: crypto.randomUUID(), role: 'assistant', text: data.reply }];

		input = '';
	}
</script>

<!-- Container -->
<div class="chat-container">
	<h1>Chat</h1>

	<div class="chat-window">
		{#each messages as m (m.id)}
			<div class="message {m.role}">
				<strong>{m.role}:</strong>
				{m.text}
			</div>
		{/each}
	</div>

	<div class="chat-input">
		<input bind:value={input} placeholder="Type a message…" />
		<button on:click={sendMessage}>Send</button>
	</div>
</div>

<style>
	/* Center container and set width */
	.chat-container {
		width: 50vw; /* 50% of viewport width */
		margin: 2rem auto; /* top/bottom margin + auto horizontal centering */
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* Chat window */
	.chat-window {
		border: 1px solid #ccc;
		padding: 1rem;
		min-height: 300px;
		overflow-y: auto;
	}

	.message.user {
		text-align: right;
	}

	.message.assistant {
		text-align: left;
	}

	/* Input section */
	.chat-input {
		display: flex;
		gap: 0.5rem;
	}

	.chat-input input {
		flex: 1;
		padding: 0.5rem;
		font-size: 1rem;
	}

	.chat-input button {
		padding: 0.5rem 1rem;
		font-size: 1rem;
		cursor: pointer;
	}
</style>
