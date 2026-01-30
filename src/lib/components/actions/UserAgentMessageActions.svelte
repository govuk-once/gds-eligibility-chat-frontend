<script lang="ts">
	import type { Message, Action } from '$lib/types';
	import Button from '$lib/components/buttons/Button.svelte';
	import DoubleButton from '$lib/components/buttons/DoubleButton.svelte';
	import { sendPayload } from '$lib/chat.svelte';
	import ActionsLayout from '$lib/components/actions/ActionsLayout.svelte';

	export let message: Message;
	export let displayedActions: Action[];
</script>

<ActionsLayout>
	{#if message.reply_type === 'choice_single'}
		{#each displayedActions as action (action.label)}
			<Button onclick={() => sendPayload(action.payload)} label={action.label} />
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
