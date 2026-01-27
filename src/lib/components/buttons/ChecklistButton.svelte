<script lang="ts">
	import type { Action } from '$lib/types';
	import { sendPayload } from '$lib/chat.svelte';
	import SubmitButton from '$lib/components/buttons/SubmitButton.svelte';

	let { actions } = $props<{
		actions: Action[];
	}>();

	let selectedPayloads: string[] = $state([]);

	function handleSubmit() {
		if (selectedPayloads.length > 0) {
			sendPayload(selectedPayloads.join(', '));
		}
	}
</script>

<div class="checklist-component">
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

	<SubmitButton onclick={handleSubmit} disabled={selectedPayloads.length === 0} />
</div>

<style>
	.checklist-component {
		margin-top: 0.5em;
		padding-left: 1em;
		padding-right: 1em;
		padding-top: 1em;
		padding-bottom: 1em;
		border: 1px black solid;
		border-radius: 1em;
	}

	.checklist-group {
		display: flex;
		flex-direction: column;
		gap: 0.5em; /* Keep the gap between items */
		margin-bottom: 0.5em;
		margin-top: 0.5em;
	}

	.checklist-group > div {
		/* Target the div wrapping each label */
		height: 2.75em; /* Standardized height */
		display: flex; /* To vertically center the label content */
		align-items: center; /* Vertically center the label */
		border: 1px solid #aaaaaa;
		border-radius: 0.5em;
	}

	.checklist-label {
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;
		font-size: 1em;
		width: 100%; /* Ensure label takes full width within its div */
		height: 100%; /* Take full height of its parent div */
		padding-right: 0.75em;
		padding-left: 1.25em;
	}

	.checklist-label input[type='checkbox'] {
		display: none; /* Hide the default checkbox */
	}

	.checklist-custom {
		height: 1.25em;
		width: 1.25em;
		background-color: transparent;
		border-radius: 0.25em;
		display: inline-block;
		position: relative;
		border: 2px solid black;
		flex-shrink: 0;
	}

	.checklist-label input[type='checkbox']:checked + .checklist-custom {
		background-color: transparent;
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
</style>
