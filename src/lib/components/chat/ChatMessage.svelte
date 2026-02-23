<script lang="ts">
    import type { Message } from '$lib/types';
    import StreamingText from '$lib/components/chat/StreamingText.svelte';

    let { message, isLast, loading, onUpdate } = $props<{
        message: Message;
        isLast: boolean;
        loading: boolean;
        onUpdate?: () => void;
    }>();
</script>

<div class="message {message.role} {message.vault ? 'vault' : ''}">
    <div class="message-content">
        {#if message.html}
            {#if message.role === 'assistant' && isLast && !loading && message.markdown}
                <StreamingText messageId={message.id} content={message.markdown} stream={true} {onUpdate} />
            {:else}
                <!-- we have sanitised message.html with DOMPurify -->
                <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                {@html message.html}
            {/if}
        {:else}
            {message.text}
        {/if}
    </div>

    {#if message.vault}
        <div class="shield-icon">
            <img
                src="/icons/shield-check.svg"
                alt="vaulted response"
                aria-hidden="true"
                class="privacy-icon"
            />
        </div>
    {/if}
</div>

<style>
    :global(.message a) {
        color: black;
    }
    :global(.message p) {
        margin: 0;
        padding-left: 1em;
        padding-right: 1em;
    }

    :global(.message ol) {
        padding-left: 1em;
        padding-right: 1em;
    }

	  :global(.message ul) {
        padding-left: 1em;
        padding-right: 1em;
    }

    :global(.message h1) {
        margin-top: 0;
        padding-left: 0.5em;
        padding-right: 0.5em;
    }

    :global(.message h2) {
        padding-left: 0.5em;
        padding-right: 0.5em;
    }

	:global(.message h3) {
        padding-left: 0.5em;
        padding-right: 0.5em;
    }

	:global(.message h4) {
        padding-left: 0.5em;
        padding-right: 0.5em;
    }

	:global(.message h5) {
        padding-left: 0.5em;
        padding-right: 0.5em;
    }

	:global(.message h6) {
        padding-left: 0.5em;
        padding-right: 0.5em;
    }

    :global(.message li) {
        padding-right: 1em;
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
        padding: 0.75em 1em;
        border-radius: 10.86px;
        margin-right: 1em;
        margin-left: 4.5em;
        text-align: left;
        background-color: #d9d9d9;
        align-self: flex-end;
        max-width: 100%;
        display: flex;
        gap: 0.5em;
        align-items: center;
    }

    .message.user.vault {
        padding: 0.75em 1em 0.75em 1.5em;
        gap: 0.5em;
    }

    .message.assistant,
    .message.error {
        padding-left: 0;
        border-radius: 0;
        background-color: transparent;
        text-align: left;
        align-self: stretch;
    }
    .message.error {
        color: #c00;
    }

    .actions {
        margin-top: 1em;
        display: flex;
        flex-direction: column;
        gap: 0.5em;
    }
    .shield-icon {
        display: flex;
        align-items: flex-end; /* bottom */
        justify-content: flex-end; /* right */
        align-self: flex-end;
    }

    .privacy-icon {
        width: 1em;
        height: 1em;
        padding-bottom: 0.1em;
    }
</style>