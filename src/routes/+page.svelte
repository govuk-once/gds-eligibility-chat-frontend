<script lang="ts">
	import WebView from '$lib/components/web/WebView.svelte';
	import MobileView from '$lib/components/mobile/MobileView.svelte';
	import { device, initDeviceListeners } from '$lib/device.svelte';
	import { initializeChat } from '$lib/chat.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		initializeChat({ proactive: false });
	});

	initDeviceListeners();
</script>

{#if device.isMobile}
	<MobileView />
{:else}
	<WebView />
{/if}
