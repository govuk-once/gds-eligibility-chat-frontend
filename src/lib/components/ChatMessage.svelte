<script lang="ts">
	import type { Message, Action } from '$lib/types';
	import { sendPayload } from '$lib/chat.svelte';
	import StreamingText from '$lib/components/StreamingText.svelte';
	import { getRandomDelay } from '$lib/utils/random-delay';
	import UserAgentMessageInput from '$lib/components/UserAgentMessageInput.svelte';
	import BenefitAgentMessageInput from '$lib/components/BenefitAgentMessageInput.svelte';
	import Button from '$lib/components/Button.svelte';
	import { SvelteSet } from 'svelte/reactivity'

	let { message, isLast, loading, onUpdate } = $props<{
		message: Message;
		isLast: boolean;
		loading: boolean;
		onUpdate?: () => void;
	}>();

	let displayedActions = $state<Action[]>([]);
	const timeouts = new SvelteSet<NodeJS.Timeout>();

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
		void message.id; // Establish dependency on the message ID
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

<div class="message {message.role} {message.vault ? 'vault' : ''}">
	<div class="message-content">
		{#if message.html}
			{#if message.role === 'assistant' && isLast && !loading && message.markdown}
				<StreamingText messageId={message.id} content={message.markdown} stream={true} {onUpdate} />
			{:else}
				<!-- we have sanitised message.html with DOMPurify -->
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html message.html}
			{/if}
		{:else}
			{message.text}
		{/if}
	</div>

	{#if message.vault}
		<div class="shield-icon">
			<img
				src="/icons/shield-check.svg"
				alt="vaulted response"
				aria-hidden="true"
				class="privacy-icon"
			/>
		</div>
	{/if}

	{#if displayedActions.length > 0}
		{#if message.source === 'user_agent'}
			<UserAgentMessageInput {message} {displayedActions} />
		{:else if message.source === 'benefit_agent'}
			<BenefitAgentMessageInput {message} {displayedActions} />
		{:else}
			<div class="actions">
				{#each displayedActions as action (action.label)}
					<Button onclick={() => sendPayload(action.payload)} label={action.label} />
				{/each}
			</div>
		{/if}
	{/if}
</div>

<style>
	:global(.message p) {
		margin: 0;
		padding-left: 1em;
		padding-right: 1em;
	}

	:global(.message ol ul h1 h2 h3 h4 h5 h6) {
		padding-left: 1em;
		padding-right: 1em;
	}

	:global(.message li) {
		padding-right: 1em;
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
		padding: 0.75em 1em;
		border-radius: 10.86px;
		margin-right: 1em;
		margin-left: 4.5em;
		text-align: left;
		background-color: #d9d9d9;
		align-self: flex-end;
		max-width: 100%;
		display: flex;
		gap: 0.5em;
		align-items: center;
	}

	.message.user.vault {
		padding: 0.75em 1em 0.75em 1.5em;
		gap: 0.5em;
	}

	.message.assistant,
	.message.error {
		padding-left: 0;
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
	.shield-icon {
		display: flex;
		align-items: flex-end; /* bottom */
		justify-content: flex-end; /* right */
		align-self: flex-end;
	}

	.privacy-icon {
		width: 1em;
		height: 1em;
		padding-bottom: 0.1em;
	}
</style>
