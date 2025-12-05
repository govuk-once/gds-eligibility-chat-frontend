<script lang="ts">
	import Header from '$lib/Header.svelte';
	import ChatInputBox from '$lib/ChatInputBox.svelte';
	import showdown from 'showdown';
	import DOMPurify from 'dompurify';

	type Message = {
		id: string;
		role: 'user' | 'assistant' | 'error';
		text?: string;
		html?: string;
	};

	let messages = $state<Message[]>([]);
	let input = $state('');
	let loading = $state(false);
	let chatInputBoxComponent: ChatInputBox;
	let isMobileDevice = $state(false);
	let executionId = $state<string | undefined>(undefined);
	let nodeName = $state<string | undefined>(undefined);
	let isKeyboardCollapsed = $state(true);

	const converter = new showdown.Converter();

	messages.push({
		id: crypto.randomUUID(),
		role: 'assistant',
		html: '<b>Hi!</b> How can I help you today?'
	});

	// Effect to detect mobile device based on pointer capability
	$effect(() => {
		if (typeof window !== 'undefined') {
			const mediaQuery = window.matchMedia('(pointer: coarse)');
			isMobileDevice = mediaQuery.matches;

			const handleChange = (e: MediaQueryListEvent) => {
				isMobileDevice = e.matches;
			};
			mediaQuery.addEventListener('change', handleChange);
			return () => mediaQuery.removeEventListener('change', handleChange);
		}
	});

	// Attachment to handle resizing when the virtual keyboard appears on mobile
	function virtualViewportSizer(node: HTMLDivElement) {
		if (typeof window === 'undefined' || !window.visualViewport) return;

		const viewport = window.visualViewport;

		const handleResize = () => {
			node.style.height = `${viewport.height}px`;

			const keyboardThreshold = 150;
			isKeyboardCollapsed = !(window.innerHeight - viewport.height > keyboardThreshold);
		};

		handleResize();

		viewport.addEventListener('resize', handleResize);

		// Cleanup function to remove the listener when the component is destroyed
		return () => {
			viewport.removeEventListener('resize', handleResize);
		};
	}

	function autoScroll(node: HTMLElement) {
		$effect(() => {
			if (messages.length) {
				node.scrollTop = node.scrollHeight;
			}
		});
	}

	async function sendMessage() {
		if (!input.trim() || loading) {
			return;
		}

		const currentInput = input;
		messages.push({ id: crypto.randomUUID(), role: 'user', text: currentInput });
		input = '';

		loading = true;

		try {
			const requestBody: { message: string; executionId?: string; nodeName?: string } = {
				message: currentInput
			};

			if (executionId && nodeName) {
				requestBody.executionId = executionId;
				requestBody.nodeName = nodeName;
			}

			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(requestBody)
			});

			if (!res.ok) {
				throw new Error(`API request failed with status ${res.status}`);
			}

			const resData = await res.json();
			const markdown = resData.content.document;
			const unsafeHtml = converter.makeHtml(markdown);
			const safeHtml = DOMPurify.sanitize(unsafeHtml);

			messages.push({ id: crypto.randomUUID(), role: 'assistant', html: safeHtml });

			if (resData.completionReason === 'INPUT_REQUIRED') {
				executionId = resData.executionId;
				nodeName = resData.nodeName;
			} else {
				executionId = undefined;
				nodeName = undefined;
			}
		} catch (error) {
			console.error('Fetch Error:', error);
			const errorMessage = error instanceof Error ? error.message : String(error);
			messages.push({
				id: crypto.randomUUID(),
				role: 'error',
				text: `A network error occurred: ${errorMessage}`
			});
		} finally {
			loading = false;
			// Only refocus if not on a mobile device
			if (chatInputBoxComponent && !isMobileDevice) {
				// Add small delay to ensure DOM has updated after `loading = false`
				// and input is ready to receive focus.
				setTimeout(() => {
					chatInputBoxComponent.focusInput();
				}, 0);
			}
		}
	}
</script>

<div class="page-container" {@attach virtualViewportSizer}>
	<Header />
	<div class="chat-container">
		<div class="chat-window" {@attach autoScroll}>
			{#each messages as m (m.id)}
				<div class="message {m.role}">
					{#if m.html}
						<!-- we have sanitised m.html with DOMPurify -->
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html m.html}
					{:else}
						{m.text}
					{/if}
				</div>
			{/each}

			{#if loading}
				<div class="message assistant">Thinking...</div>
			{/if}
		</div>

		<ChatInputBox
			bind:this={chatInputBoxComponent}
			bind:value={input}
			{loading}
			placeholder="Ask me anything"
			onSend={sendMessage}
		/>
	</div>
	{#if isMobileDevice && isKeyboardCollapsed}
		<footer class="keyboard-collapsed-footer"></footer>
	{/if}
</div>

<style>
	:global(.message p) {
		margin: 0;
	}
	:global(.message.assistant p + p) {
		margin-top: 1.5em;
	}
	.page-container {
		max-width: 800px;
		width: 100%;
		margin: 0 auto; /* Horizontal centering */
		padding: 0 2em; /* Add 2em "margins" on each side visually */
		box-sizing: border-box; /* Include padding in the width calculation */
		display: flex;
		flex-direction: column;
	}
	/* A visually hidden class for accessible labels */
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		border: 0;
	}

	.chat-container {
		width: 100%;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
		flex: 1;
		min-height: 0;
	}

	.chat-window {
		margin-top: 1.5em;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 1.5em;
		flex: 1; /* Grow to fill available space */
		min-height: 0; /* Prevent flexbox overflow */
	}

	.message {
		/* margin-top: 1.5em; */
		/* Base styling for all messages, will be overridden for assistant/error */
		font-size: 1em;
		overflow-wrap: break-word;
		word-break: break-word; /* For older browser compatibility and stronger breaking */
	}

	.message.user {
		padding: 0.69em 1.5em;
		border-radius: 10.86px;
		text-align: left;
		background-color: #d9d9d9;
		align-self: flex-end; /* Chat bubble effect */
		max-width: 75%; /* Optional: limit width for bubble effect */
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

	.keyboard-collapsed-footer {
		height: 1em;
		background-color: blue;
		text-align: center;
		flex-shrink: 0;
	}
</style>
