<script lang="ts">
	import Button from '$lib/components/buttons/Button.svelte';

	type Props = {
		disabled?: boolean;
		onclick: () => void;
	};

	let { disabled = false, onclick }: Props = $props();
</script>

<div class="submit-wrapper">
	<div class="submit-button-container">
		<div></div>
		<Button {onclick} label="Submit" {disabled} />
	</div>

	<div class="privacy-note">
		Stored in your private data vault
		<img src="/icons/shield-check.svg" alt="" aria-hidden="true" class="privacy-icon" />
	</div>
</div>

<style>
	.submit-wrapper {
		width: 100%;
	}

	.submit-button-container {
		display: flex;
		gap: 0.5em;
		width: 100%;
	}

	.submit-button-container > div:first-child {
		flex: 1;
	}

	.submit-button-container :global(button) {
		flex: 1;
		width: 100%;
		margin: 0;
	}

	.privacy-note {
		margin-top: 0.5em;
		font-size: 1em;
		color: #aaaaaa;
		display: inline-flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.35em;
		width: 100%;
		line-height: 1;
	}
	.privacy-icon {
		width: 1.35em;
		height: 1.35em;
		display: block;
		overflow: hidden;
		padding-bottom: 0.1em;
	}
</style>
