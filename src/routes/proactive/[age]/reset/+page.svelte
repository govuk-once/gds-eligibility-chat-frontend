<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { initializeChat } from '$lib/chat.svelte';

	onMount(() => {
		const age = page.params.age;
		localStorage.clear();
		initializeChat();
		if (age) {
			goto(`/proactive/${age}`);
		} else {
			goto('/');
		}
	});
</script>
