<script lang="ts">
	import type { Message, Action } from '$lib/types';
	import { sendPayload } from '$lib/chat.svelte';
	import Button from '$lib/Button.svelte';

	let { message, displayedActions } = $props<{
		message: Message;
		displayedActions: Action[];
		onUpdate?: () => void;
	}>();
</script>

<div class="actions">
	{#each displayedActions as action (action.label)}
		<Button onclick={() => sendPayload(action.payload)} label={action.label} />
	{/each}
</div>

<style>
	.actions {
		margin-top: 1em;
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}
</style>
