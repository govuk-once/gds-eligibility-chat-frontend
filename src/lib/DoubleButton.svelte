<script lang="ts">
	import Button from '$lib/Button.svelte';

	let { onYesClick, yesLabel, onNoClick, noLabel } = $props<{
		onYesClick: () => void;
		yesLabel: string;
		onNoClick: () => void;
		noLabel: string;
	}>();
</script>

<div class="double-button-container">
	<Button onclick={onYesClick} label={yesLabel} />
	<Button onclick={onNoClick} label={noLabel}  color='#8B8888'/>
</div>

<style>
	.double-button-container {
		display: flex;
		gap: 0.5em;
		width: 100%; /* Fill the width of the parent */
	}

	.double-button-container :global(button) {
		flex: 1; /* Each button takes equal space */
		width: 100%; /* Ensure buttons fill their flex space */
	}
</style>
