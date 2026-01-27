<script lang="ts">
	import type { Action } from '$lib/types';
	import { sendPayload } from '$lib/chat.svelte';
	import SubmitButton from '$lib/components/SubmitButton.svelte';

	let { actions } = $props<{
		actions: Action[];
	}>();

	let selectedValue: string | undefined = $state(undefined);

	function handleSubmit() {
		if (selectedValue) {
			sendPayload(selectedValue);
		}
	}
</script>

<div class="radio-component">
	<div class="radio-group">
		{#each actions as action (action.payload)}
			<div>
				<label class="radio-label">
					<input
						type="radio"
						name="dynamic-radio-group"
						bind:group={selectedValue}
						value={action.payload}
					/>
					<span class="radio-custom"></span>
					{action.label}
				</label>
			</div>
		{/each}
	</div>

	<SubmitButton onclick={handleSubmit} disabled={!selectedValue} />
</div>

<style>
	.radio-component {
		margin-top: 0.5em;
		padding-left: 1em;
		padding-right: 1em;
		padding-top: 1em;
		padding-bottom: 1em;
		border: 1px black solid;
		border-radius: 1em;
	}
	.radio-group {
		display: flex;
		flex-direction: column;
		gap: 0.5em; /* Keep the gap between items */
		margin-top: 0.5em;
		margin-bottom: 0.5em;
	}

	.radio-group > div {
		/* Target the div wrapping each label */
		height: 2.75em; /* Standardized height */
		display: flex; /* To vertically center the label content */
		align-items: center; /* Vertically center the label */
		border: 1px solid #aaaaaa;
		border-radius: 0.5em;
	}

	.radio-label {
		display: flex;
		align-items: center;
		cursor: pointer;
		font-size: 1em;
		padding-left: 1.75em;
		gap: 0.75em;
		width: 100%; /* Ensure label takes full width within its div */
		height: 100%; /* Take full height of its parent div */
	}

	.radio-label input[type='radio'] {
		display: none; /* Hide the default radio button */
	}

	.radio-custom {
		height: 0.75em;
		width: 0.75em;
		background-color: transparent;
		border-radius: 50%;
		display: inline-block;
		position: relative;
		border: 2px solid black;
		flex-shrink: 0;
	}

	.radio-label input[type='radio']:checked + .radio-custom {
		background-color: transparent; /* Changed to transparent */
		border-color: black; /* Changed to black */
	}

	.radio-custom::after {
		content: '';
		position: absolute;
		display: none;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 0.65em;
		height: 0.65em;
		border-radius: 50%;
		background: black;
	}

	.radio-label input[type='radio']:checked + .radio-custom::after {
		display: block;
	}
</style>
