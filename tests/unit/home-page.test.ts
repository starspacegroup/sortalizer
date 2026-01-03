import { fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Page from '../../src/routes/+page.svelte';

// Mock the sound generator
vi.mock('$lib/services/soundGenerator', () => ({
	SoundGenerator: vi.fn().mockImplementation(() => ({
		setVolume: vi.fn(),
		setMuted: vi.fn(),
		playComparison: vi.fn(),
		playSwap: vi.fn(),
		dispose: vi.fn()
	}))
}));

describe('Home Page - Sorting Visualizer', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should render the main title', () => {
		render(Page);
		const title = screen.getByText('Sortalizer');
		expect(title).toBeTruthy();
	});

	it('should render the tagline', () => {
		render(Page);
		const tagline = screen.getByText('Watch algorithms think, one swap at a time');
		expect(tagline).toBeTruthy();
	});

	it('should render algorithm selection pills', () => {
		const { container } = render(Page);
		const pills = container.querySelectorAll('.pill');
		expect(pills.length).toBe(6); // 6 algorithm pills

		// Check pill names contain expected algorithms
		const pillTexts = Array.from(pills).map(p => p.textContent?.trim());
		expect(pillTexts).toContain('Bubble Sort');
		expect(pillTexts).toContain('Insertion Sort');
		expect(pillTexts).toContain('Selection Sort');
		expect(pillTexts).toContain('Merge Sort');
		expect(pillTexts).toContain('Quick Sort');
		expect(pillTexts).toContain('Heap Sort');
	});

	it('should have Bubble Sort selected by default', () => {
		const { container } = render(Page);
		const activePill = container.querySelector('.pill.active');
		expect(activePill?.textContent?.trim()).toBe('Bubble Sort');
	});

	it('should render visualization bars', () => {
		const { container } = render(Page);
		const bars = container.querySelectorAll('.bar');
		expect(bars.length).toBe(50); // Default array size
	});

	it('should render playback controls', () => {
		const { container } = render(Page);
		const playBtn = container.querySelector('.btn-play');
		expect(playBtn).toBeTruthy();
	});

	it('should render stats display', () => {
		render(Page);
		expect(screen.getByText('comparisons')).toBeTruthy();
		expect(screen.getByText('swaps')).toBeTruthy();
	});

	it('should render algorithm info card', () => {
		const { container } = render(Page);
		// Check for algorithm card container
		const algorithmCard = container.querySelector('.algorithm-card');
		expect(algorithmCard).toBeTruthy();

		// Check for algorithm description text
		const description = container.querySelector('.algorithm-description');
		expect(description).toBeTruthy();
	});

	it('should render color legend', () => {
		render(Page);
		expect(screen.getByText('Unsorted')).toBeTruthy();
		expect(screen.getByText('Comparing')).toBeTruthy();
		expect(screen.getByText('Swapping')).toBeTruthy();
		expect(screen.getByText('Pivot')).toBeTruthy();
		expect(screen.getByText('Sorted')).toBeTruthy();
	});

	it('should render keyboard shortcuts', () => {
		render(Page);
		expect(screen.getByText('Play/Pause')).toBeTruthy();
		expect(screen.getByText('Reset')).toBeTruthy();
		expect(screen.getByText('Mute')).toBeTruthy();
	});

	it('should change algorithm when clicking on pill', async () => {
		const { container } = render(Page);
		const pills = container.querySelectorAll('.pill');
		const quickSortPill = Array.from(pills).find(p => p.textContent?.includes('Quick Sort'));

		expect(quickSortPill).toBeTruthy();
		if (quickSortPill) {
			await fireEvent.click(quickSortPill);

			const activePill = container.querySelector('.pill.active');
			expect(activePill?.textContent?.trim()).toBe('Quick Sort');
		}
	});

	it('should render settings panel by default', () => {
		render(Page);
		expect(screen.getByText('Array Size')).toBeTruthy();
		expect(screen.getByText('Speed')).toBeTruthy();
		expect(screen.getByText('Volume')).toBeTruthy();
	});

	it('should toggle settings panel visibility', async () => {
		const { container } = render(Page);
		const settingsBtn = container.querySelector('button[title="Settings"]');

		expect(settingsBtn).toBeTruthy();
		if (settingsBtn) {
			// Settings panel visible by default
			expect(container.querySelector('.settings-panel')).toBeTruthy();

			// Click to hide
			await fireEvent.click(settingsBtn);
			expect(container.querySelector('.settings-panel')).toBeFalsy();

			// Click to show again
			await fireEvent.click(settingsBtn);
			expect(container.querySelector('.settings-panel')).toBeTruthy();
		}
	});

	it('should render animated background elements', () => {
		const { container } = render(Page);
		const bgEffects = container.querySelector('.bg-effects');
		expect(bgEffects).toBeTruthy();

		const orbs = container.querySelectorAll('.gradient-orb');
		expect(orbs.length).toBe(3);
	});

	it('should render progress bar', () => {
		const { container } = render(Page);
		const progressContainer = container.querySelector('.progress-container');
		const progressBar = container.querySelector('.progress-bar');
		expect(progressContainer).toBeTruthy();
		expect(progressBar).toBeTruthy();
	});

	it('should display complexity information for selected algorithm', () => {
		const { container } = render(Page);
		// Check for complexity details container
		const complexityDetails = container.querySelector('.complexity-details');
		expect(complexityDetails).toBeTruthy();

		// Check for individual complexity items
		const complexityItems = container.querySelectorAll('.complexity-item');
		expect(complexityItems.length).toBe(3); // Best, Worst, Space
	});
});

describe('Home Page - Accessibility', () => {
	it('should have proper page title', () => {
		render(Page);
		// Check svelte:head sets proper title
		expect(document.title).toContain('Sortalizer');
	});

	it('should have buttons with titles for accessibility', () => {
		const { container } = render(Page);

		const shuffleBtn = container.querySelector('button[title="Shuffle"]');
		const resetBtn = container.querySelector('button[title="Reset (R)"]');
		const muteBtn = container.querySelector('button[title="Toggle Sound (M)"]');
		const settingsBtn = container.querySelector('button[title="Settings"]');

		expect(shuffleBtn).toBeTruthy();
		expect(resetBtn).toBeTruthy();
		expect(muteBtn).toBeTruthy();
		expect(settingsBtn).toBeTruthy();
	});
});
