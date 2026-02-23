<script lang="ts">
    import { onMount } from 'svelte';
    import { initializeChat, startProactiveSession } from '$lib/chat.svelte';
    import ProactiveChat from '../../../routes/+page.svelte';

    let { data } = $props();

    onMount(() => {
        initializeChat({ proactive: true, age: data.age });
        startProactiveSession();
    });
</script>

<ProactiveChat />