<script lang="ts">
	import { chatState } from '$lib/chat.svelte';
	import { authState } from '$lib/auth-journey.svelte';
	import { device } from '$lib/device.svelte';

	let { showIcons = true, isFrameOn = false } = $props<{
		showIcons?: boolean;
		isFrameOn?: boolean;
	}>();

	const isProactiveWebNoFrame = $derived(
		chatState.config.isProactive && !device.isMobile && !isFrameOn
	);
</script>

<header class:proactive-header={isProactiveWebNoFrame}>
	{#if showIcons}
		<div class="icon-container">
			<div class="account-container">
				<img
					src={authState.signedIn
						? '/icons/account-signed-in.svg'
						: '/icons/account-not-signed-in.svg'}
					alt={authState.signedIn ? 'account signed in' : 'account not signed in'}
					aria-hidden="true"
					class="account-icon"
				/>
				{#if authState.signedIn}
					<img src="/icons/notepad.svg" alt="notepad" aria-hidden="true" class="account-icon" />
				{/if}
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
		background-color: #f5f5f5;
	}

	header.proactive-header {
		height: 1em;
	}

	.icon-container {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	.account-container {
		height: 3.5em;
		min-width: 3.5em;
		border-radius: 1.75em;
		background-color: white;
		border: 1px solid black;
		display: flex;
		justify-content: center;
		align-items: center;
		box-sizing: border-box;
		padding: 0 0.375em;
		gap: 1em;
	}

	.account-icon {
		width: 2.75em;
		height: 2.75em;
	}
</style>
