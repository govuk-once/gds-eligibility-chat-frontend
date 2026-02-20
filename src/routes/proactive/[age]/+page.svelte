<script lang="ts">
	import { onMount } from 'svelte';
	import { initializeChat, startProactiveSession } from '$lib/chat.svelte';
	import ProactiveChat from '../../../routes/+page.svelte';

	onMount(() => {
		initializeChat({ proactive: true });
		startProactiveSession();
	});
</script>

<ProactiveChat />
