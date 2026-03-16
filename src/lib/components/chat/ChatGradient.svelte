<script lang="ts">
	let {
		bottom = '0',
		position = 'sticky',
		rgb = '245, 245, 245',
		maxOpacity = 0.3
	} = $props<{
		bottom?: string | number;
		position?: 'sticky' | 'absolute' | 'relative' | 'static';
		rgb?: string;
		maxOpacity?: number;
	}>();

	const bottomStyle = $derived(typeof bottom === 'number' ? `${bottom}px` : bottom);
	const backgroundStyle = $derived(`linear-gradient(
		to bottom,
		rgba(${rgb}, 0) 0%,
		rgba(${rgb}, ${maxOpacity * 0.33}) 40%,
		rgba(${rgb}, ${maxOpacity}) 100%
	)`);
</script>

<div
	class="chat-gradient"
	style:bottom={bottomStyle}
	style:position
	style:background-image={backgroundStyle}
></div>

<style>
	.chat-gradient {
		height: 1.5em;
		flex-shrink: 0;
		left: 0;
		right: 0;
		pointer-events: none;
		z-index: 25;
	}
</style>
