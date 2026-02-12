<script lang="ts">
	let {
		onclick,
		label,
		color = 'black',
		disabled = false,
		payload
	} = $props<{
		onclick: (payload?: string) => void;
		label: string;
		color?: string;
		disabled?: boolean;
		payload?: string;
	}>();
</script>

<button onclick={() => onclick(payload)} style="background-color: {color};" {disabled}>
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
		height: 2.75em;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.5em;
	}
</style>
