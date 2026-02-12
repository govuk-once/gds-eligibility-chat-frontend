<script lang="ts">
	import type { Action } from '$lib/types';
	import { sendPayload } from '$lib/chat.svelte'; // Import sendPayload
	import Button from '$lib/components/buttons/Button.svelte';
	import ActionsLayout from '$lib/components/actions/ActionsLayout.svelte';

	let { displayedActions } = $props<{
		displayedActions: Action[];
	}>();

	$effect(() => {
		if (displayedActions.length === 1 && displayedActions[0].payload) {
			sendPayload(displayedActions[0].payload);
		}
	});
</script>

<ActionsLayout>
	{#each displayedActions as action (action.label)}
		<Button onclick={sendPayload} label={action.label} payload={action.payload} />
	{/each}
</ActionsLayout>
