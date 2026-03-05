<script lang="ts">
	import { chatState } from '$lib/chat.svelte';
	import { device } from '$lib/device.svelte';

	let { showVault = true, isFrameOn = false } = $props<{
		showVault?: boolean;
		isFrameOn?: boolean;
	}>();

	const isProactiveWebNoFrame = $derived(
		chatState.config.isProactive && !device.isMobile && !isFrameOn
	);
</script>

<header class:proactive-header={isProactiveWebNoFrame}>
	{#if showVault}
		<div class="vault-container">
			<div class="shield-container">
				<img
					src="/icons/shield-check.svg"
					alt="vault icon"
					aria-hidden="true"
					class="privacy-icon"
				/>
			</div>
		</div>
	{/if}
</header>

<style>
	header {
		height: 6.625em;
		display: flex;
		justify-content: flex-end;
		align-items: flex-end;
		padding: 0 0.5em;
		background-color: #f5f5f5;
	}

	header.proactive-header {
		height: 1em;
	}

	.vault-container {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	.privacy-icon {
		width: 1.4em;
		height: 1.4em;
	}

	.shield-container {
		width: 2.75em;
		height: 2.75em;
		border-radius: 50%;
		background-color: white;
		border: 1px solid black;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
