/**
 * Attachment to handle resizing when the virtual keyboard appears on mobile
 * @param {HTMLDivElement} node
 * @returns
 */
export function virtualViewportSizer(node: HTMLDivElement) {
	if (typeof window === 'undefined' || !window.visualViewport) return;

	const viewport = window.visualViewport;

	const handleResize = () => {
		node.style.height = `${viewport.height}px`;
	};

	handleResize();

	viewport.addEventListener('resize', handleResize);

	// Cleanup function to remove the listener when the component is destroyed
	return {
		destroy() {
			viewport.removeEventListener('resize', handleResize);
		}
	};
}
