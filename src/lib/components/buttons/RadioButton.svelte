<script lang="ts">
	import type { Action } from '$lib/types';
	import { chatState } from '$lib/chat.svelte';

	let { actions } = $props<{
		actions: Action[];
	}>();

	let selectedValue: string | undefined = $state(undefined);

	$effect(() => {
		chatState.pendingActionPayload = selectedValue;
	});
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
</div>

<style>
	.radio-group {
		display: flex;
		flex-direction: column;
		gap: 0.5em; 
	}

	.radio-group > div {
		height: 2.75em; 
		display: flex; /* To vertically center the label content */
		align-items: center; /* Vertically center the label */
		border: 1px solid #aaaaaa;
		border-radius: 0.5em;
		background-color: white;
	}

	.radio-label {
		display: flex;
		align-items: center;
		cursor: pointer;
		font-size: 1em;
		padding-left: 1.75em;
		gap: 0.75em;
		width: 100%; 
	}

	.radio-label input[type='radio'] {
		display: none; /* Hide the default radio button */
	}

	.radio-custom {
		height: 0.75em;
		width: 0.75em;
		background-color: white;
		border-radius: 50%;
		display: inline-block;
		position: relative;
		border: 2px solid black;
		flex-shrink: 0;
	}

	.radio-label input[type='radio']:checked + .radio-custom {
		background-color: white;
		border-color: black;
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
