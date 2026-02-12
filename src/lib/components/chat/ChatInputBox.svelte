<script lang="ts">
	import { chatState } from '$lib/chat.svelte';

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

<div
	class="chat-input-wrapper"
	class:no-bottom-padding={chatState.activeActions.length > 0 && chatState.messages.at(-1)}
>
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
	</div>
	<button
		type="button"
		class="send-button"
		onclick={handleSend}
		disabled={loading || (!value && !chatState.pendingActionPayload)}
		aria-label="Send message"><b>Send</b></button
	>
</div>

<style>
	.chat-input-wrapper {
		padding: 0 1em 1.5em 1em;
		background-color: #f5f5f5;
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.chat-input-wrapper.no-bottom-padding {
		padding-bottom: 0;
	}

	.chat-input-box {
		position: relative;
		flex: 1;
		display: flex;
		align-items: center;
		min-height: 2.75em;
		padding: 0 1em 0 1em;
		border: 1px solid #aaaaaa;
		background-color: white;
		border-radius: 22px;
		box-sizing: border-box;
		/* max-width: 100%; */
		max-width: calc(100% - 4.5em);
	}

	.chat-input-box textarea {
		flex: 1;
		padding: 0;
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
		max-width: 100%;
	}

	.chat-input-box textarea:focus {
		outline: none;
	}

	.send-button {
		width: 4em;
		height: 2.75em;
		padding: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 1rem;
		cursor: pointer;
		border: none;
		border-radius: 1em;
		background-color: black;
		color: white; /* For potential icon */
		flex-shrink: 0;
	}

	.send-button:disabled {
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
