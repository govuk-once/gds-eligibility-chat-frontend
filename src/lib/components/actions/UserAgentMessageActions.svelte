<script lang="ts">
	import type { Message, Action } from '$lib/types';
	import { sendPayload } from '$lib/chat.svelte';
	import Button from '$lib/components/buttons/Button.svelte';
	import DoubleButton from '$lib/components/buttons/DoubleButton.svelte';
	import ActionsLayout from '$lib/components/actions/ActionsLayout.svelte';

	let { message, displayedActions } = $props<{
		message: Message;
		displayedActions: Action[];
	}>();

	$effect(() => {
		if (
			message.reply_type === 'choice_single' &&
			displayedActions.length === 1 &&
			displayedActions[0].payload
		) {
			sendPayload(displayedActions[0].payload);
		}
	});
</script>

<ActionsLayout>
	{#if message.reply_type === 'choice_single'}
		{#each displayedActions as action (action.label)}
			<Button
				onclick={(payload) => sendPayload(payload as string)}
				label={action.label}
				payload={action.payload}
			/>
		{/each}
	{:else if message.reply_type === 'yes_no'}
		{#if displayedActions.length === 2}
			<DoubleButton
				yesLabel={displayedActions[0].label}
				onYesClick={() => sendPayload(displayedActions[0].payload)}
				noLabel={displayedActions[1].label}
				onNoClick={() => sendPayload(displayedActions[1].payload)}
			/>
		{/if}
	{/if}
</ActionsLayout>
