<script lang="ts">
	import type { Message, Action } from '$lib/types';
	import { chatState, sendPayload } from '$lib/chat.svelte';
	import Button from '$lib/components/buttons/Button.svelte';
	import DoubleButton from '$lib/components/buttons/DoubleButton.svelte';
	import ActionsLayout from '$lib/components/actions/ActionsLayout.svelte';
	import ChecklistButton from '$lib/components/buttons/ChecklistButton.svelte';
	import SignIn from '$lib/components/sign-in/SignIn.svelte';

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

	async function handleYesClick() {
		// Add user message immediately
		chatState.messages = [
			...chatState.messages,
			{
				id: crypto.randomUUID(),
				role: 'user',
				text: 'Yes'
			}
		];

		// Show thinking animation
		chatState.loading = true;

		// Wait 1 second
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Add assistant message
		chatState.messages = [
			...chatState.messages,
			{
				id: crypto.randomUUID(),
				role: 'assistant',
				html: '<p>OK let me know your <b>username</b> and <b>password</b>.</p>'
			}
		];

		// Hide thinking animation and show sign in form
		chatState.loading = false;
		chatState.showSignInForm = true;
	}
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
		{#if !chatState.showSignInForm}
			{#if !chatState.loading}
				<DoubleButton yesLabel="Yes" onYesClick={handleYesClick} noLabel="No" onNoClick={() => sendPayload('no')} />
			{/if}
		{:else}
			<SignIn />
		{/if}
	{/if}
</ActionsLayout>
