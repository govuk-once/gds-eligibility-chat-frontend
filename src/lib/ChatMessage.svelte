<script lang="ts">
    import type { Message } from '$lib/types';

    export let message: Message;
</script>

<div class="message {message.role}">
    {#if message.html}
        <!-- we have sanitised message.html with DOMPurify -->
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html message.html}
    {:else}
        {message.text}
    {/if}
</div>

<style>
    :global(.message p) {
        margin: 0;
    }
    :global(.message.assistant p + p) {
        margin-top: 1.5em;
    }
    .message {
        font-size: 1em;
        overflow-wrap: break-word;
        word-break: break-word;
    }

    .message.user {
        padding: 0.69em 1.5em;
        border-radius: 10.86px;
        text-align: left;
        background-color: #d9d9d9;
        align-self: flex-end;
        max-width: 75%;
    }

    .message.assistant,
    .message.error {
        padding: 0;
        border-radius: 0;
        background-color: transparent;
        text-align: left;
        align-self: stretch;
    }

    .message.error {
        color: #c00;
    }
</style>
