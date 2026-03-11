<script lang="ts">
	import { chatState } from '$lib/chat.svelte';
	import { authState } from '$lib/auth-journey.svelte';
	import { device } from '$lib/device.svelte';

	let {
		showIcons = true,
		isFrameOn = false,
		showBackground = true
	} = $props<{
		showIcons?: boolean;
		isFrameOn?: boolean;
		showBackground?: boolean;
	}>();

	const isProactiveWebNoFrame = $derived(
		chatState.config.isProactive && !device.isMobile && !isFrameOn
	);
</script>

<header class:proactive-header={isProactiveWebNoFrame} class:with-background={showBackground}>
	<div class="upper-header"></div>
	<div class="lower-header">
		<div class="icon-container" style:visibility={showIcons ? 'visible' : 'hidden'}>
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
	</div>
</header>

<style>
	header {
		display: flex;
		flex-direction: column;
		position: relative;
	}

	header.proactive-header {
		height: 1em;
	}

	header.with-background .upper-header {
		background-color: rgba(245, 245, 245, 0.9);
	}

	header.with-background .lower-header {
		background: linear-gradient(
			to bottom,
			rgba(245, 245, 245, 0.9) 0%,
			rgba(245, 245, 245, 0) 100%
		);
	}

	.upper-header {
		height: 3.875em;
		position: relative;
		z-index: 2;
	}

	header.proactive-header .upper-header {
		display: none;
	}

	.lower-header {
		height: 3.5em;
		display: flex;
		justify-content: flex-end;
		align-items: center;
		position: relative;
		z-index: 2;
	}

	header.proactive-header .lower-header {
		height: 100%;
		align-items: flex-end;
	}

	.icon-container {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.5em;
		z-index: 25;
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
