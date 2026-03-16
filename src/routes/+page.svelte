<script lang="ts">
	import WebView from '$lib/components/web/WebView.svelte';
	import MobileView from '$lib/components/mobile/MobileView.svelte';
	import { device, initDeviceListeners } from '$lib/device.svelte';
	import { initializeChat, startSession } from '$lib/chat.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		initializeChat({ isProactive: false });
		startSession();
	});

	initDeviceListeners();
</script>

{#if device.isMobile}
	<MobileView />
{:else}
	<WebView />
{/if}
