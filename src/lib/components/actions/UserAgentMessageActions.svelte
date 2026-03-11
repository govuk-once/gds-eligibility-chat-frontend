<script lang="ts">
	import type { Message, Action } from '$lib/types';
	import { chatState, sendPayload } from '$lib/chat.svelte';
	import { authState } from '$lib/auth-journey.svelte';
	import Button from '$lib/components/buttons/Button.svelte';
	import DoubleButton from '$lib/components/buttons/DoubleButton.svelte';
	import ActionsLayout from '$lib/components/actions/ActionsLayout.svelte';
	import ChecklistButton from '$lib/components/buttons/ChecklistButton.svelte';
	import SignIn from '$lib/components/sign-in/SignIn.svelte';
	import RadioButton from '$lib/components/buttons/RadioButton.svelte';

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

	const signInActions: Action[] = [
		{ label: 'Yes', payload: 'Yes' },
		{ label: 'No', payload: 'no' }
	];
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
	{:else if message.reply_type === 'choice_multiple'}
		{#if displayedActions.length === message.actions?.length}
			<ActionsLayout>
				<ChecklistButton actions={displayedActions} />
			</ActionsLayout>
		{/if}
	{:else if message.reply_type === 'sign_in'}
		{#if !authState.showSignInForm}
			{#if !chatState.loading}
				<RadioButton actions={signInActions} />
			{/if}
		{:else}
			<SignIn />
		{/if}
	{/if}
</ActionsLayout>
