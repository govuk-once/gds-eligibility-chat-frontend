<script lang="ts">
	import type { Message, Action } from '$lib/types';
	import { sendPayload } from '$lib/chat.svelte'; // Import sendPayload
	import Button from '$lib/components/buttons/Button.svelte';
	import RadioButton from '$lib/components/buttons/RadioButton.svelte';
	import ChecklistButton from '$lib/components/buttons/ChecklistButton.svelte';
	import ActionsLayout from '$lib/components/actions/ActionsLayout.svelte';

	let { message, displayedActions } = $props<{
		message: Message;
		displayedActions: Action[];
	}>();

	$effect(() => {
		if (
			!message.reply_type && // Only for generic case
			displayedActions.length === 1 &&
			displayedActions[0].payload
		) {
			sendPayload(displayedActions[0].payload);
		}
	});
</script>

{#if message.reply_type === 'choice_single' || message.reply_type === 'yes_no'}
	{#if displayedActions.length === message.actions?.length}
		<ActionsLayout>
			<RadioButton actions={displayedActions} />
		</ActionsLayout>
	{/if}
{:else if message.reply_type === 'choice_multiple'}
	{#if displayedActions.length === message.actions?.length}
		<ActionsLayout>
			<ChecklistButton actions={displayedActions} />
		</ActionsLayout>
	{/if}
{:else}
	<ActionsLayout>
		{#each displayedActions as action (action.label)}
			<Button onclick={sendPayload} label={action.label} payload={action.payload} />
		{/each}
	</ActionsLayout>
{/if}
