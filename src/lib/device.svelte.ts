export const device = $state({
    isMobile: false,
    isKeyboardCollapsed: true
});

// This function must be called from within a component's setup phase
// to correctly associate the effect with the component's lifecycle.
export function initDeviceListeners() {
    $effect(() => {
        // 1. Mobile detection
        const mediaQuery = window.matchMedia('(pointer: coarse)');
        const handleMediaQueryChange = (e: MediaQueryListEvent) => (device.isMobile = e.matches);
        mediaQuery.addEventListener('change', handleMediaQueryChange);
        device.isMobile = mediaQuery.matches; // set initial value

        // 2. Keyboard collapse detection
        const viewport = window.visualViewport;
        if (viewport) {
            const handleViewportResize = () => {
                const keyboardThreshold = 150;
                device.isKeyboardCollapsed = !(window.innerHeight - viewport.height > keyboardThreshold);
            };
            viewport.addEventListener('resize', handleViewportResize);
            handleViewportResize(); // set initial value

            // Cleanup function for when the effect is destroyed
            return () => {
                mediaQuery.removeEventListener('change', handleMediaQueryChange);
                viewport.removeEventListener('resize', handleViewportResize);
            };
        }

        // Cleanup if visualViewport is not supported
        return () => {
            mediaQuery.removeEventListener('change', handleMediaQueryChange);
        };
    });
}
