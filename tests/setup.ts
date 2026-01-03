import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/svelte';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
	cleanup();
});

// Setup global test utilities
globalThis.ResizeObserver = class ResizeObserver {
	observe() { }
	unobserve() { }
	disconnect() { }
};

// Mock IntersectionObserver
globalThis.IntersectionObserver = class IntersectionObserver {
	constructor() { }
	observe() { }
	unobserve() { }
	disconnect() { }
} as any;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => { },
		removeListener: () => { },
		addEventListener: () => { },
		removeEventListener: () => { },
		dispatchEvent: () => true
	})
});

// Mock Element.animate for Svelte 5 transitions (not supported in happy-dom)
Element.prototype.animate = function (keyframes: Keyframe[] | PropertyIndexedKeyframes | null, options?: number | KeyframeAnimationOptions): Animation {
	return {
		onfinish: null,
		oncancel: null,
		finished: Promise.resolve(this as unknown as Animation),
		cancel: () => { },
		finish: () => {
			if (typeof (this as any).onfinish === 'function') {
				(this as any).onfinish();
			}
		},
		play: () => { },
		pause: () => { },
		reverse: () => { },
		commitStyles: () => { },
		persist: () => { },
		updatePlaybackRate: () => { },
		currentTime: 0,
		effect: null,
		id: '',
		pending: false,
		playState: 'finished' as AnimationPlayState,
		playbackRate: 1,
		replaceState: 'active' as AnimationReplaceState,
		startTime: 0,
		timeline: null,
		addEventListener: () => { },
		removeEventListener: () => { },
		dispatchEvent: () => true
	} as unknown as Animation;
};
