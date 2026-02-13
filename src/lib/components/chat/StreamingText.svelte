<script lang="ts">
	import { onMount } from 'svelte';
	import { markdownToHtml } from '$lib/utils/markdown-to-html';
	import { finishedStreaming } from '$lib/chat.svelte';
	import { getRandomDelay } from '$lib/utils/random-delay';
	import { tick } from 'svelte';

	export let content: string;
	export let stream = false;
	export let messageId: string;
	export let onUpdate: (() => void) | undefined = undefined;

	let displayedContent = '';
	let htmlContent = '';
	let intervalId: ReturnType<typeof setInterval> | undefined;

	async function updateHtml(markdown: string) {
		htmlContent = await markdownToHtml(markdown);
		onUpdate?.();
	}

	async function startStreaming() {
		if (intervalId) clearInterval(intervalId);

		const fullHtml = await markdownToHtml(content);

		let index = 0;
		let isRendering = false;

		const delay = getRandomDelay(20, 40);

		intervalId = setInterval(async () => {
			if (isRendering) return;
			isRendering = true;

			const chunkSize = Math.floor(Math.random() * 4) + 2;

			index = Math.min(index + chunkSize, fullHtml.length);

			let nextIndex = index;

			// If we're inside a tag, fast-forward to the end of the tag
			if (fullHtml[nextIndex - 1] === '<') {
				const closing = fullHtml.indexOf('>', nextIndex);
				if (closing !== -1) {
					nextIndex = closing + 1;
				}
			}

			// Also handle when we cut in the middle of a tag
			const lastOpen = fullHtml.lastIndexOf('<', nextIndex);
			const lastClose = fullHtml.lastIndexOf('>', nextIndex);

			if (lastOpen > lastClose) {
				const closing = fullHtml.indexOf('>', nextIndex);
				if (closing !== -1) {
					nextIndex = closing + 1;
				}
			}

			// Incrementally update htmlContent
			htmlContent = fullHtml.slice(0, nextIndex);

			// Notify parent after DOM updates
			await tick();
			onUpdate?.();

			if (nextIndex >= fullHtml.length) {
				clearInterval(intervalId);
				finishedStreaming(messageId, content);
			}

			index = nextIndex;
			isRendering = false;
		}, delay);
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
