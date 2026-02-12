<script lang="ts">
	import type { Action } from '$lib/types';
	import { chatState } from '$lib/chat.svelte';

	let { actions } = $props<{
		actions: Action[];
	}>();

	let selectedPayloads: string[] = $state([]);

	$effect(() => {
		chatState.pendingActionPayload =
			selectedPayloads.length > 0 ? selectedPayloads.join(', ') : undefined;
	});
</script>

<div class="checklist-component">
	<div class="heading-text"><b>Please select all that apply:</b></div>
	<div class="checklist-group">
		{#each actions as action (action.payload)}
			<div>
				<label class="checklist-label">
					{action.label}
					<input type="checkbox" bind:group={selectedPayloads} value={action.payload} />
					<span class="checklist-custom"></span>
				</label>
			</div>
		{/each}
	</div>
</div>

<style>
	.checklist-group {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}

	.checklist-group > div {
		height: 2.75em; 
		display: flex; /* To vertically center the label content */
		align-items: center; /* Vertically center the label */
		border: 1px solid #aaaaaa;
		border-radius: 0.5em;
		background-color: white;
	}

	.checklist-label {
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;
		font-size: 1em;
		width: 100%; 
		height: 100%; 
		padding-right: 0.75em;
		padding-left: 1.25em;
	}

	.checklist-label input[type='checkbox'] {
		display: none; /* Hide the default checkbox */
	}

	.checklist-custom {
		height: 1.25em;
		width: 1.25em;
		background-color: white;
		border-radius: 0.25em;
		display: inline-block;
		position: relative;
		border: 2px solid black;
		flex-shrink: 0;
	}

	.checklist-label input[type='checkbox']:checked + .checklist-custom {
		background-color: white;
		border-color: #333;
	}

	.checklist-custom::after {
		content: '';
		position: absolute;
		display: none;
		left: 50%;
		top: 40%;
		width: 0.4em;
		height: 0.8em;
		border: solid black;
		border-width: 0 0.2em 0.2em 0;
		transform: translate(-50%, -50%) rotate(45deg);
	}

	.checklist-label input[type='checkbox']:checked + .checklist-custom::after {
		display: block;
	}

	.heading-text {
		padding-bottom: 1em;
	}
</style>
