<script lang="ts">
	import type { Message, Action } from '$lib/types';
	import { sendPayload } from '$lib/chat.svelte';
	import Button from '$lib/components/buttons/Button.svelte';
	import RadioButton from '$lib/components/buttons/RadioButton.svelte';
	import ChecklistButton from '$lib/components/buttons/ChecklistButton.svelte';
	import ActionsLayout from '$lib/components/actions/ActionsLayout.svelte';

	export let message: Message;
	export let displayedActions: Action[];
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
			<Button onclick={() => sendPayload(action.payload)} label={action.label} />
		{/each}
	</ActionsLayout>
{/if}
