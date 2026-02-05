/**
 * Svelte action that keeps an element's height in sync with the Visual Viewport.
 *
 * Useful on mobile to prevent layout issues when the virtual keyboard appears,
 * disappears, or when the visual viewport changes size (e.g. browser UI or zoom).
 *
 * Side effects:
 * - Mutates `node.style.height`
 * - Adds a `visualViewport.resize` event listener while enabled
 *
 * @param {HTMLDivElement} node The element whose height should match the visual viewport
 *  @param enabled Whether the action is active (can be toggled dynamically)
 * @returns Svelte action lifecycle handlers
 */
export function virtualViewportSizer(node: HTMLDivElement, enabled: boolean = true) {
	if (typeof window === 'undefined' || !window.visualViewport) return;

	const viewport = window.visualViewport;

	const handleResize = () => {
		node.style.height = `${viewport.height}px`;
	};

	function enable() {
		handleResize();
		viewport.addEventListener('resize', handleResize);
	}

	function disable() {
		viewport.removeEventListener('resize', handleResize);
		node.style.height = '';
	}

	if (enabled) {
		enable();
	}

	return {
		update(newEnabled: boolean = true) {
			if (newEnabled) {
				enable();
			} else {
				disable();
			}
		},
		destroy() {
			disable();
		}
	};
}
