<script lang="ts">
	import { onMount } from 'svelte';
	import { markdownToHtml } from './utils/markdown-to-html';

	export let content: string;
	export let stream = false;

	let displayedContent = '';
	let htmlContent = '';
	let intervalId: ReturnType<typeof setInterval> | undefined;

	async function updateHtml(markdown: string) {
		htmlContent = await markdownToHtml(markdown);
	}

	function startStreaming() {
		if (intervalId) clearInterval(intervalId);

		displayedContent = '';
		const words = content.split(' ');
		let i = 0;
		const currentDelay = Math.floor(Math.random() * (180 - 100 + 1)) + 100; // between 100-180

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
