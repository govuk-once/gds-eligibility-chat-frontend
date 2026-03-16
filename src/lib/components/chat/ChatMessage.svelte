<script lang="ts">
	import type { Message } from '$lib/types';
	import StreamingText from '$lib/components/chat/StreamingText.svelte';
	import { authState } from '$lib/auth-journey.svelte';

	let { message, isLast, loading, onUpdate } = $props<{
		message: Message;
		isLast: boolean;
		loading: boolean;
		onUpdate?: () => void;
	}>();

	function openOverlay(e: MouseEvent) {
		e.preventDefault();
		authState.activeApplicationFormId = message.id;
		authState.applicationFormTitle = (message.markdown || message.text || '').replace(
			' application form',
			''
		);
		authState.showApplicationFormOverlay = true;
	}
</script>

<div class="message {message.role}">
	<div class="message-content">
		{#if message.reply_type === 'application_form'}
			{#if message.form_submitted}
				<p>{message.markdown || message.text}</p>
			{:else}
				<p>
					<button class="link-button" onclick={openOverlay}
						>{message.markdown || message.text}</button
					>
				</p>
			{/if}
		{:else if message.role === 'assistant' && isLast && !loading && message.markdown}
			<StreamingText messageId={message.id} content={message.markdown} stream={true} {onUpdate} />
		{:else if message.html}
			{@html message.html}
		{:else if message.text}
			{message.text}
		{/if}
	</div>
</div>

<style>
	:global(.message a),
	.link-button {
		color: black;
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		text-align: left;
		text-decoration: underline;
		cursor: pointer;
		display: inline;
	}

	:global(.message p) {
		margin: 0;
		padding: 0 1em;
	}

	:global(.message :is(ol, ul)) {
		list-style-position: inside;
		padding: 0 1em;
	}

	:global(.message ol li + li) {
		margin-top: 0.5em;
	}

	:global(.message li) {
		padding-right: 1em;
	}

	:global(.message :is(h1, h2, h3, h4, h5, h6)) {
		font-size: inherit;
		margin: 1em 0;
		padding: 0 1em;
	}

	:global(.message hr) {
		margin: 1em;
		border: none;
		border-top: 1px solid #ddd;
	}

	:global(.message-content > :first-child) {
		margin-top: 0;
	}

	:global(.message.assistant p + p) {
		margin-top: 1.5em;
	}

	.message {
		font-size: 1em;
		overflow-wrap: break-word;
		word-break: break-word;
	}
	.message.user {
		display: flex;
		align-items: center;
		gap: 0.5em;
		padding: 0.75em 1em;
		border-radius: 10.86px;
		margin: 0 1em 0 4.5em;
		text-align: left;
		background-color: #d9d9d9;
		align-self: flex-end;
		max-width: 100%;
	}

	.message.assistant,
	.message.error {
		font-size: inherit;
		padding-left: 0;
		border-radius: 0;
		background-color: transparent;
		text-align: left;
		align-self: stretch;
	}

	.message.error {
		color: #c00;
	}
</style>
