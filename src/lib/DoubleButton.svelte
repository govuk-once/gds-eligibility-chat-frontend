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
	<Button onclick={onNoClick} label={noLabel} color="#8B8888" />
</div>

<style>
	.double-button-container {
		display: flex;
		gap: 0.5em;
		width: 100%;
		box-sizing: border-box;
		padding: 0 1em; /* optional padding instead of margin */
	}

	.double-button-container :global(button) {
		flex: 1;
		margin: 0;
	}
</style>
