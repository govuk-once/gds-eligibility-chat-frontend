<script lang="ts">
	let {
		value = $bindable(),
		loading = false,
		placeholder = '',
		onSend = () => {} // Callback prop
	} = $props();

	let inputElement: HTMLInputElement;
	export function focusInput() {
		inputElement.focus();
	}

	function handleSend() {
		onSend(); // Call the prop directly
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault(); // Prevent form submission if it's in a form
			handleSend();
		}
	}
</script>

<div class="chat-input-box">
	<label for="chat-input-box-input" class="visually-hidden">Type a message</label>
	<input
		id="chat-input-box-input"
		bind:this={inputElement}
		bind:value
		{placeholder}
		onkeydown={handleKeyDown}
		disabled={loading}
	/>
	<button type="button" onclick={handleSend} disabled={loading} aria-label="Send message"></button>
</div>

<style>
	.chat-input-box {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.chat-input-box input {
		flex: 1;
		padding: 0.5rem;
		font-size: 1rem;
		border: 1px solid #ccc;
		border-radius: 0.25rem;
		font-family: inherit; /* Inherit font from parent */
	}

	.chat-input-box button {
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
		flex-shrink: 0; /* Prevent the button from shrinking */
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
