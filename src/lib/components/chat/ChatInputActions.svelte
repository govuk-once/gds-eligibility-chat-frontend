<script lang="ts">
	import type { Message, Action } from '$lib/types';
	import UserAgentMessageActions from '$lib/components/actions/UserAgentMessageActions.svelte';
	import BenefitAgentMessageActions from '$lib/components/actions/BenefitAgentMessageActions.svelte';
	import DefaultMessageActions from '$lib/components/actions/DefaultMessageActions.svelte';

	let { message, displayedActions } = $props<{
		message: Message;
		displayedActions: Action[];
	}>();
</script>

{#if displayedActions.length > 0}
	<div class="chat-input-actions">
		{#if message.source === 'user_agent'}
			<UserAgentMessageActions {message} {displayedActions} />
		{:else if message.source === 'benefit_agent'}
			<BenefitAgentMessageActions {message} {displayedActions} />
		{:else}
			<DefaultMessageActions {displayedActions} />
		{/if}
	</div>
{/if}

<style>
	.chat-input-actions {
		padding: 0em 1em 0.5em;
		background-color: var(--color-background-1);
		border-top: 1px solid var(--color-border-1);
	}
</style>
