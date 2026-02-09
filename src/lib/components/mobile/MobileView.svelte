<script lang="ts">
	import ChatShell from '$lib/components/chat/ChatShell.svelte';
	import { device } from '$lib/device.svelte';
	import { virtualViewportSizer } from '$lib/utils/virtualViewportSizer.svelte';
</script>

<div class="app-container" use:virtualViewportSizer>
	<ChatShell
		footerClass={device.isKeyboardCollapsed ? 'keyboard-collapsed-footer' : 'mobile-footer'}
	/>
</div>

<style>
	.app-container {
		max-width: 800px;
		width: 100%;
		height: 100%; /* Added to ensure vertical filling */
		margin: 0 auto; /* Horizontal centering */
		padding: 0 1em;
		background-color: #f5f5f5;
		box-sizing: border-box; /* Include padding in the width calculation */
		display: flex;
		flex-direction: column;
	}
</style>
