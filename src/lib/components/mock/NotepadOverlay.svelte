<script lang="ts">
	import { fade } from 'svelte/transition';

	let { headerHeight = 0, footerHeight = 0 } = $props<{
		headerHeight?: number;
		footerHeight?: number;
	}>();
</script>

<div class="overlay" transition:fade={{ duration: 200 }}>
	<div class="scroll-container">
		<div class="header-spacer" style:height="{headerHeight}px"></div>
		<div class="extra-gap"></div>
		<img src="/images/notepad.png" alt="notepad content" />
		<div class="bottom-spacer" style:height="{footerHeight}px"></div>
	</div>
</div>

<style>
	.overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #2e2e2e;
		background-image: linear-gradient(#3d3d3d 1px, transparent 1px),
			linear-gradient(90deg, #3d3d3d 1px, transparent 1px);
		background-size: 0.8em 0.8em;
		overflow-y: auto;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.overlay::-webkit-scrollbar {
		display: none;
	}

	.scroll-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
	}

	.header-spacer {
		width: 100%;
		flex-shrink: 0;
	}

	.extra-gap {
		height: 1em;
		flex-shrink: 0;
	}

	img {
		display: block;
		margin: 0 auto;
		max-width: 90%;
		height: auto;
		flex-shrink: 0;
	}

	.bottom-spacer {
		width: 100%;
		flex-shrink: 0;
	}
</style>
