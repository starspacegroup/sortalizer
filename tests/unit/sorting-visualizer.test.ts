import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import SortingVisualizer from '$lib/components/SortingVisualizer.svelte';

// Mock AudioContext
class MockAudioContext {
	createOscillator() {
		return {
			frequency: { value: 0 },
			connect: vi.fn(),
			start: vi.fn(),
			stop: vi.fn(),
			type: 'sine'
		};
	}
	createGain() {
		return {
			gain: {
				value: 0,
				setValueAtTime: vi.fn(),
				linearRampToValueAtTime: vi.fn()
			},
			connect: vi.fn()
		};
	}
	currentTime = 0;
	destination = {};
	close = vi.fn();
}

describe('SortingVisualizer', () => {
	beforeEach(() => {
		// Mock AudioContext
		(globalThis as any).AudioContext = MockAudioContext;
		vi.clearAllTimers();
	});

	it('should render main heading', () => {
		render(SortingVisualizer);
		expect(screen.getByText('Sorting Algorithm Visualizer')).toBeTruthy();
	});

	it('should render subtitle', () => {
		render(SortingVisualizer);
		expect(
			screen.getByText('Watch algorithms come to life with real-time visualization and sound')
		).toBeTruthy();
	});

	it('should render all control buttons', () => {
		const { container } = render(SortingVisualizer);
		const buttons = container.querySelectorAll('button.btn');
		const buttonTexts = Array.from(buttons).map((btn) => btn.textContent?.trim());
		expect(buttonTexts).toContain('Play');
		expect(buttonTexts).toContain('Reset');
		expect(buttonTexts).toContain('Shuffle');
		expect(buttonTexts).toContain('New Array');
	});

	it('should render algorithm selector with all algorithms', () => {
		const { container } = render(SortingVisualizer);
		const select = container.querySelector('select');
		expect(select).toBeTruthy();

		const options = select?.querySelectorAll('option');
		expect(options?.length).toBe(6);

		const algorithmNames = Array.from(options || []).map((opt) => opt.textContent);
		expect(algorithmNames).toContain('Bubble Sort');
		expect(algorithmNames).toContain('Insertion Sort');
		expect(algorithmNames).toContain('Selection Sort');
		expect(algorithmNames).toContain('Merge Sort');
		expect(algorithmNames).toContain('Quick Sort');
		expect(algorithmNames).toContain('Heap Sort');
	});

	it('should render visualization bars', () => {
		const { container } = render(SortingVisualizer);
		const bars = container.querySelectorAll('.bar');
		expect(bars.length).toBeGreaterThan(0);
		expect(bars.length).toBeGreaterThanOrEqual(10);
		expect(bars.length).toBeLessThanOrEqual(200);
	});

	it('should render legend with all states', () => {
		render(SortingVisualizer);
		expect(screen.getByText('Unsorted')).toBeTruthy();
		expect(screen.getByText('Comparing')).toBeTruthy();
		expect(screen.getByText('Swapping')).toBeTruthy();
		expect(screen.getByText('Pivot')).toBeTruthy();
		expect(screen.getByText('Sorted')).toBeTruthy();
	});

	it('should display algorithm information for Bubble Sort by default', () => {
		const { container } = render(SortingVisualizer);
		const text = container.textContent || '';
		expect(text).toContain('Bubble Sort');
		expect(text).toContain('Repeatedly steps through the list, compares adjacent elements');
	});

	it('should display time complexity information', () => {
		const { container } = render(SortingVisualizer);
		const text = container.textContent || '';
		expect(text).toContain('Best: O(n)');
		expect(text).toContain('Average: O(n²)');
		expect(text).toContain('Worst: O(n²)');
	});

	it('should display space complexity information', () => {
		const { container } = render(SortingVisualizer);
		const text = container.textContent || '';
		expect(text).toContain('O(1)');
	});

	it('should display keyboard shortcuts', () => {
		const { container } = render(SortingVisualizer);
		const text = container.textContent || '';
		expect(text).toContain('Keyboard Shortcuts');
		expect(text).toContain('Play/Pause');
		expect(text).toContain('Reset');
		expect(text).toContain('New Array');
		expect(text).toContain('Mute/Unmute');
	});

	it('should have array size slider with correct range', () => {
		const { container } = render(SortingVisualizer);
		const slider = container.querySelector('input[type="range"][id="size"]');
		expect(slider).toBeTruthy();
		expect(slider?.getAttribute('min')).toBe('10');
		expect(slider?.getAttribute('max')).toBe('200');
	});

	it('should have speed slider with correct range', () => {
		const { container } = render(SortingVisualizer);
		const slider = container.querySelector('input[type="range"][id="speed"]');
		expect(slider).toBeTruthy();
		expect(slider?.getAttribute('min')).toBe('1');
		expect(slider?.getAttribute('max')).toBe('500');
	});

	it('should have volume slider', () => {
		const { container } = render(SortingVisualizer);
		const slider = container.querySelector('input[type="range"][id="volume"]');
		expect(slider).toBeTruthy();
		expect(slider?.getAttribute('min')).toBe('0');
		expect(slider?.getAttribute('max')).toBe('1');
	});

	it('should have mute button', () => {
		render(SortingVisualizer);
		const muteButton = screen.getByLabelText('Toggle mute');
		expect(muteButton).toBeTruthy();
	});

	it('should display stats labels', () => {
		render(SortingVisualizer);
		expect(screen.getByText('Comparisons')).toBeTruthy();
		expect(screen.getByText('Swaps')).toBeTruthy();
		expect(screen.getByText('Progress')).toBeTruthy();
	});

	it('should render control labels', () => {
		render(SortingVisualizer);
		expect(screen.getByText('Algorithm')).toBeTruthy();
		expect(screen.getByText(/Array Size:/)).toBeTruthy();
		expect(screen.getByText(/Speed:/)).toBeTruthy();
		expect(screen.getByText('Volume')).toBeTruthy();
	});
});

