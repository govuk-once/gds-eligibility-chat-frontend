<script lang="ts">
	import { onMount } from 'svelte';
	import { initializeChat, startSession } from '$lib/chat.svelte';
	import ProactiveChat from '../../../routes/+page.svelte';

	let { data } = $props();

	onMount(() => {
		initializeChat({ isProactive: true, ageGroup: data.age });
		startSession();
	});
</script>

<ProactiveChat />
