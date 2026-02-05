<script lang="ts">
	let { class: className = '' } = $props<{ class?: string }>();
</script>

<footer class={className}></footer>

<style>
	footer {
		height: 6.625em;
		background-color: #f5f5f5;
	}

	.keyboard-collapsed-footer {
		height: 1em;
		text-align: center;
		flex-shrink: 0;
	}
</style>
