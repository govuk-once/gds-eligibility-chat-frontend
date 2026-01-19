<script lang="ts">
	import type { Message, Action } from '$lib/types';
	import { sendPayload } from '$lib/chat.svelte';
	import Button from '$lib/Button.svelte';
	import DoubleButton from '$lib/DoubleButton.svelte';

	let { message, displayedActions } = $props<{
		message: Message;
		displayedActions: Action[];
		onUpdate?: () => void;
	}>();
</script>

<div class="actions">
	{#if message.reply_type === 'choice_single'}
		{#each displayedActions as action (action.label)}
			<Button onclick={() => sendPayload(action.payload)} label={action.label} />
		{/each}
	{:else if message.reply_type === 'yes_no'}
		{#if displayedActions.length === 2}
			<DoubleButton
				onYesClick={() => sendPayload(displayedActions[0].payload)}
				yesLabel={displayedActions[0].label}
				onNoClick={() => sendPayload(displayedActions[1].payload)}
				noLabel={displayedActions[1].label}
			/>
		{/if}
	{/if}
</div>


<style>
	.actions {
		margin-top: 1em;
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}
</style>
