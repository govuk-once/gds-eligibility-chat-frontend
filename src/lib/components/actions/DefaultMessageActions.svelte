<script lang="ts">
	import type { Action } from '$lib/types';
	import { sendPayload } from '$lib/chat.svelte';
	import Button from '$lib/components/buttons/Button.svelte';
	import ActionsLayout from '$lib/components/actions/ActionsLayout.svelte';

	export let displayedActions: Action[];
</script>

<ActionsLayout>
	{#each displayedActions as action (action.label)}
		<Button onclick={() => sendPayload(action.payload)} label={action.label} />
	{/each}
</ActionsLayout>
