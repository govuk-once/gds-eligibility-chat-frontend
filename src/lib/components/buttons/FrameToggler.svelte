<script lang="ts">
	let { on, toggle } = $props<{ on: boolean; toggle: () => void }>();
</script>

<button class="frame-toggler" onclick={toggle}>
	Turn Frame {on ? 'Off' : 'On'}
</button>

<style>
	.frame-toggler {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		width: 10em;
		height: 2em;
		background-color: transparent;
		color: #595959;
		border: 1px solid #595959;
		border-radius: 0.5em;
		cursor: pointer;
	}
</style>
