<script lang="ts">
	import type { Message, Action } from '$lib/types';
	import { sendPayload } from '$lib/chat.svelte';
	import Button from '$lib/Button.svelte';
	import RadioButton from './RadioButton.svelte';
	import ChecklistButton from './ChecklistButton.svelte';

	let { message, displayedActions } = $props<{
		message: Message;
		displayedActions: Action[];
		onUpdate?: () => void;
	}>();
</script>

{#if message.reply_type === 'choice_single' || message.reply_type === 'yes_no'}
	{#if displayedActions.length === message.actions?.length}
		<RadioButton actions={displayedActions} />
	{/if}
{:else if message.reply_type === 'choice_multiple'}
	{#if displayedActions.length === message.actions?.length}
		<ChecklistButton actions={displayedActions} />
	{/if}
{:else}
	<div class="actions">
		{#each displayedActions as action (action.label)}
			<Button onclick={() => sendPayload(action.payload)} label={action.label} />
		{/each}
	</div>
{/if}

<style>
	.actions {
		margin-top: 1em;
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}
</style>
