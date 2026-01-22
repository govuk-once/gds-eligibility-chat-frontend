<script lang="ts">
    import { chatState } from '$lib/chat.svelte';

    const vaultCount = $derived(chatState.messages.filter(m => m.vault).length);
</script>

<header>
    <div class="vault-container">
		<div class="shield-container">
			<img
				src="/icons/shield-check.svg"
				alt="vault icon"
				aria-hidden="true"
				class="privacy-icon"
			/>
        </div>
		{#if vaultCount > 0}
			<div class="notification-dot">
				<span>{vaultCount}</span>
			</div>
		{/if}
    </div>
    
</header>

<style>
	header {
		height: 6.625em;
        display: flex;
        justify-content: flex-end;
        align-items: flex-end;
        padding: 0 1.5em;
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

	.notification-dot {
		position: absolute;
		top: 0;
		right: 0;
		width: 0.875em;
		height: 0.875em;
		background-color: black;
		border-radius: 50%;
		color: white;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.notification-dot span {
		font-size: 0.6em;
		font-weight: bold;
		font-family: sans-serif;
	}
</style>
