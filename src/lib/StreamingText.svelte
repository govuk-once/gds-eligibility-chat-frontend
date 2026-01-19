<script lang="ts">
	import { onMount } from 'svelte';
	import { markdownToHtml } from './utils/markdown-to-html';
	import { finishedStreaming } from './chat.svelte';
	import { getRandomDelay } from '$lib/utils/random-delay';

	export let content: string;
	export let stream = false;
	export let messageId: string;
	export let onUpdate: (() => void) | undefined = undefined;

	let displayedContent = '';
	let htmlContent = '';
	let intervalId: ReturnType<typeof setInterval> | undefined;

	async function updateHtml(markdown: string) {
		htmlContent = await markdownToHtml(markdown);
		if (onUpdate) {
			onUpdate();
		}
	}

	function startStreaming() {
		if (intervalId) clearInterval(intervalId);

		displayedContent = '';
		const words = content.split(' ');
		let i = 0;
		const currentDelay = getRandomDelay(100, 180);

		intervalId = setInterval(() => {
			const chunkSize = Math.floor(Math.random() * 2) + 2; // 2 or 3 words
			const chunk = words.slice(i, i + chunkSize).join(' ');

			if (chunk) {
				displayedContent += (i > 0 ? ' ' : '') + chunk;
				updateHtml(displayedContent);
			}

			i += chunkSize;

			if (i >= words.length) {
				if (intervalId) clearInterval(intervalId);
				displayedContent = content;
				updateHtml(content);
				finishedStreaming(messageId);
			}
		}, currentDelay);
	}

	function stopStreaming() {
		if (intervalId) clearInterval(intervalId);
		displayedContent = content;
		updateHtml(content);
	}

	$: if (stream) {
		startStreaming();
	} else {
		stopStreaming();
	}

	onMount(() => {
		// Initial render
		updateHtml(stream ? displayedContent : content);

		return () => {
			if (intervalId) clearInterval(intervalId);
		};
	});
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html htmlContent}
