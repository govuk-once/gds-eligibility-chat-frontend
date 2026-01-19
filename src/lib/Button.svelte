<script lang="ts">
	let { onclick, label, color = 'black' } = $props<{
		onclick: () => void;
		label: string;
		color?: string;
	}>();
</script>

<button onclick={onclick} style="background-color: {color};">
	{label}
</button>

<style>
	button {
		background-color: black;
		color: white;
		border: none;
		padding: 1em 0.5em;
		cursor: pointer;
		text-align: center;
		height: 2.75em; /* Standardized height */
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.5em;
	}
</style>
