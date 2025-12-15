<script lang="ts">
	import Header from '$lib/Header.svelte';
	import Footer from '$lib/Footer.svelte';
	import ChatInputBox from '$lib/ChatInputBox.svelte';
	import ChatMessage from '$lib/ChatMessage.svelte';
	import showdown from 'showdown';
	import DOMPurify from 'dompurify';
	import type { Message } from '$lib/types';

	let messages = $state<Message[]>([
		{
			id: crypto.randomUUID(),
			role: 'assistant',
			html: '<b>Hi!</b> How can I help you today?'
		}
	]);
	let input = $state('');
	let loading = $state(false);
	let chatInputBoxComponent: ChatInputBox;
	let isMobileDevice = $state(false);
	let sessionId = $state<string | undefined>(undefined);
	let isKeyboardCollapsed = $state(true);

	const converter = new showdown.Converter();

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

		// Use a placeholder for the assistant's message, which we'll update
		const assistantMessageId = crypto.randomUUID();
		messages.push({ id: assistantMessageId, role: 'assistant', html: '' });

		const isFirstMessage = !sessionId;
		let currentSessionId = sessionId;
		if (isFirstMessage) {
			currentSessionId = crypto.randomUUID();
			sessionId = currentSessionId;
		}

		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message: currentInput,
					sessionId: currentSessionId,
					is_first_message: isFirstMessage
				})
			});

			if (!res.ok) {
				const errorText = await res.text();
				throw new Error(`API request failed with status ${res.status}: ${errorText}`);
			}

			const resData = await res.json();
			let fullResponseMarkdown = '';

			if (Array.isArray(resData)) {
				for (const event of resData) {
					// Check for model responses that contain text parts
					if (
						event.content?.role === 'model' &&
						event.content.parts &&
						Array.isArray(event.content.parts)
					) {
						for (const part of event.content.parts) {
							if (part.text) {
								fullResponseMarkdown += part.text;
							}
						}
					}
				}
			}

			const unsafeHtml = converter.makeHtml(fullResponseMarkdown);
			const safeHtml = DOMPurify.sanitize(unsafeHtml);

			const assistantMessage = messages.find((m) => m.id === assistantMessageId);
			if (assistantMessage) {
				if (safeHtml) {
					assistantMessage.html = safeHtml;
				} else {
					assistantMessage.html = 'Received a non-text response from the agent.';
				}
			}
		} catch (error) {
			console.error('Fetch Error:', error);
			const errorMessage = error instanceof Error ? error.message : String(error);

			// Remove the placeholder message on error
			messages = messages.filter((m) => m.id !== assistantMessageId);

			messages.push({
				id: crypto.randomUUID(),
				role: 'error',
				text: `A network error occurred: ${errorMessage}`
			});
		} finally {
			loading = false;
			if (chatInputBoxComponent && !isMobileDevice) {
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
				<ChatMessage message={m} />
			{/each}

			{#if loading}
				<ChatMessage message={{ id: 'loading-indicator', role: 'assistant', text: 'Thinking...' }} />
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
	{#if !isMobileDevice}
		<Footer />
	{/if}
	{#if isMobileDevice && isKeyboardCollapsed}
		<footer class="keyboard-collapsed-footer"></footer>
	{/if}
</div>

<style>
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

	.keyboard-collapsed-footer {
		height: 1em;
		text-align: center;
		flex-shrink: 0;
	}
</style>
