<script lang="ts">
	let {
		value = $bindable(),
		loading = false,
		placeholder = '',
		onSend = () => {} // Callback prop
	} = $props();

	let inputElement: HTMLTextAreaElement;
	export function focusInput() {
		inputElement.focus();
	}

	function handleSend() {
		onSend(); // Call the prop directly
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	}
</script>

<div class="chat-input-wrapper">
	<div class="chat-input-box">
		<label for="chat-input-box-input" class="visually-hidden">Type a message</label>
		<textarea
			id="chat-input-box-input"
			bind:this={inputElement}
			bind:value
			{placeholder}
			onkeydown={handleKeyDown}
			disabled={loading}
			rows="1"
		></textarea>
		<button type="button" onclick={handleSend} disabled={loading} aria-label="Send message"
		></button>
	</div>
</div>

<style>
	.chat-input-wrapper {
		margin: 1.5em 2em;
		height: 2.75em;
	}

	.chat-input-box {
		position: relative;
		display: flex;
		gap: 0.5rem;
		align-items: center;
		min-height: 2.75em;
		padding: 0 2.75em 0 1.5em;
		border: 1px solid #aaaaaa;
		border-radius: 22px;
	}

	.chat-input-box textarea {
		flex: 1;
		padding: 0;
		margin-right: 0.75em;
		font-size: 1rem;
		border: none;
		border-top: 0.75em solid transparent;
		border-bottom: 0.75em solid transparent;
		border-radius: 0.25rem;
		font-family: inherit;
		resize: none;
		field-sizing: content;
		max-height: 4em;
		overflow-y: auto;
		background-clip: padding-box;
	}

	.chat-input-box textarea:focus {
		outline: none;
	}

	.chat-input-box button {
		position: absolute;
		right: 0.5rem;
		bottom: 0.375rem;
		width: 2em;
		height: 2em;
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
		flex-shrink: 0;
	}

	.chat-input-box button:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	/* This class should be defined in a global stylesheet for reusability,
	   but is included here for simplicity. */
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
</style>
