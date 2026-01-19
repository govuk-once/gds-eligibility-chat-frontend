<script lang="ts">
	import type { Message, Action } from '$lib/types';
	import { sendPayload } from '$lib/chat.svelte';
	import StreamingText from './StreamingText.svelte';
	import { getRandomDelay } from '$lib/utils/random-delay';

	let { message, isLast, loading, onUpdate } = $props<{
		message: Message;
		isLast: boolean;
		loading: boolean;
		onUpdate?: () => void;
	}>();

	let displayedActions = $state<Action[]>([]);
	const timeouts = new Set<NodeJS.Timeout>();

	$effect.pre(() => {
		// This cleanup function runs before the main effect,
		// and whenever the component is unmounted.
		return () => {
			for (const handle of timeouts) {
				clearTimeout(handle);
			}
			timeouts.clear();
		};
	});

	$effect(() => {
		// When the message prop itself changes, this effect re-runs.
		// The cleanup function from $effect.pre ensures we start fresh.
		const _ = message.id; // Establish dependency on the message ID
		displayedActions = [];

		// Schedule the animations for the new message
		if (!message.streaming && message.actions) {
			let cumulativeDelay = 0;
			message.actions.forEach((action: Action, index: number) => {
				cumulativeDelay += getRandomDelay(100, 250);
				const handle = setTimeout(() => {
					displayedActions.push(action);
					timeouts.delete(handle);
					// If this is the last action, call the update callback
					if (index === message.actions!.length - 1) {
						if (onUpdate) {
							onUpdate();
						}
					}
				}, cumulativeDelay);
				timeouts.add(handle);
			});
		}
	});
</script>

<div class="message {message.role}">
	{#if message.html}
		{#if message.role === 'assistant' && isLast && !loading && message.markdown}
			<StreamingText
				messageId={message.id}
				content={message.markdown}
				stream={true}
				{onUpdate}
			/>
		{:else}
			<!-- we have sanitised message.html with DOMPurify -->
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html message.html}
		{/if}
	{:else}
		{message.text}
	{/if}

	{#if displayedActions.length > 0}
		<div class="actions">
			{#each displayedActions as action (action.label)}
				<button onclick={() => sendPayload(action.payload)}>
					{action.label}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	:global(.message p) {
		margin: 0;
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
		padding: 0.69em 1.5em;
		border-radius: 10.86px;
		text-align: left;
		background-color: #d9d9d9;
		align-self: flex-end;
		max-width: 75%;
	}

	.message.assistant,
	.message.error {
		padding: 0;
		border-radius: 0;
		background-color: transparent;
		text-align: left;
		align-self: stretch;
	}

	.message.error {
		color: #c00;
	}

	.actions {
		margin-top: 1em;
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}

	.actions button {
		background-color: black;
		color: white;
		border: none;
		padding: 0.75em 1em;
		border-radius: 5px;
		cursor: pointer;
		text-align: center;
	}
</style>
