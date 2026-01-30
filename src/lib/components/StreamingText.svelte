<script lang="ts">
	import { onMount } from 'svelte';
	import { markdownToHtml } from '$lib/utils/markdown-to-html';
	import { finishedStreaming } from '$lib/chat.svelte';
	import { getRandomDelay } from '$lib/utils/random-delay';

	export let content: string;
	export let stream = false;
	export let messageId: string;
	export let onUpdate: (() => void) | undefined = undefined;

	let displayedContent = '';
	let htmlContent = '';
	let intervalId: ReturnType<typeof setInterval> | undefined;

	function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
		let timeout: ReturnType<typeof setTimeout>;

		return (...args: Parameters<T>) => {
			clearTimeout(timeout);
			timeout = setTimeout(() => fn(...args), delay);
		};
	}

	async function updateHtml(markdown: string) {
		htmlContent = await markdownToHtml(markdown);
		onUpdate?.();
	}

	const debouncedUpdateHtml = debounce(updateHtml, 80);

	function startStreaming() {
		if (intervalId) clearInterval(intervalId);

		displayedContent = '';
		const words = content.split(/(\s+)/);
		let i = 0;
		const currentDelay = getRandomDelay(120, 125);

		intervalId = setInterval(() => {
			const chunkSize = Math.floor(Math.random() * 2) + 5;
			const chunk = words.slice(i, i + chunkSize).join(' ');

			if (chunk) {
				displayedContent += (i > 0 ? ' ' : '') + chunk;
				debouncedUpdateHtml(displayedContent);
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
		updateHtml(stream ? displayedContent : content);

		return () => {
			if (intervalId) clearInterval(intervalId);
		};
	});
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html htmlContent}
