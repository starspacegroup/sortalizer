import { describe, it, expect } from 'vitest';
import {
	bubbleSort,
	mergeSort,
	quickSort,
	insertionSort,
	selectionSort,
	heapSort,
	type SortStep,
	type SortState
} from '$lib/services/sortingAlgorithms';

describe('Sorting Algorithms', () => {
	const testArrays = [
		{ name: 'simple unsorted', array: [5, 2, 8, 1, 9] },
		{ name: 'already sorted', array: [1, 2, 3, 4, 5] },
		{ name: 'reverse sorted', array: [5, 4, 3, 2, 1] },
		{ name: 'single element', array: [1] },
		{ name: 'two elements', array: [2, 1] },
		{ name: 'duplicates', array: [3, 1, 4, 1, 5, 9, 2, 6, 5] }
	];

	const expectedSorted = [
		[1, 2, 5, 8, 9],
		[1, 2, 3, 4, 5],
		[1, 2, 3, 4, 5],
		[1],
		[1, 2],
		[1, 1, 2, 3, 4, 5, 5, 6, 9]
	];

	describe('bubbleSort', () => {
		it('should generate steps that result in sorted array', () => {
			testArrays.forEach((test, i) => {
				const steps = bubbleSort([...test.array]);
				const finalStep = steps[steps.length - 1];
				expect(finalStep.array).toEqual(expectedSorted[i]);
			});
		});

		it('should include comparison and swap steps', () => {
			const steps = bubbleSort([5, 2, 8, 1, 9]);
			const hasComparisons = steps.some((step) => step.type === 'compare');
			const hasSwaps = steps.some((step) => step.type === 'swap');
			expect(hasComparisons).toBe(true);
			expect(hasSwaps).toBe(true);
		});

		it('should mark array as sorted in final step', () => {
			const steps = bubbleSort([5, 2, 8, 1, 9]);
			const finalStep = steps[steps.length - 1];
			expect(finalStep.sorted).toBe(true);
		});
	});

	describe('mergeSort', () => {
		it('should generate steps that result in sorted array', () => {
			testArrays.forEach((test, i) => {
				const steps = mergeSort([...test.array]);
				const finalStep = steps[steps.length - 1];
				expect(finalStep.array).toEqual(expectedSorted[i]);
			});
		});

		it('should include comparison steps', () => {
			const steps = mergeSort([5, 2, 8, 1, 9]);
			const hasComparisons = steps.some((step) => step.type === 'compare');
			expect(hasComparisons).toBe(true);
		});
	});

	describe('quickSort', () => {
		it('should generate steps that result in sorted array', () => {
			testArrays.forEach((test, i) => {
				const steps = quickSort([...test.array]);
				const finalStep = steps[steps.length - 1];
				expect(finalStep.array).toEqual(expectedSorted[i]);
			});
		});

		it('should include pivot selection steps', () => {
			const steps = quickSort([5, 2, 8, 1, 9]);
			const hasPivot = steps.some((step) => step.pivot !== undefined);
			expect(hasPivot).toBe(true);
		});
	});

	describe('insertionSort', () => {
		it('should generate steps that result in sorted array', () => {
			testArrays.forEach((test, i) => {
				const steps = insertionSort([...test.array]);
				const finalStep = steps[steps.length - 1];
				expect(finalStep.array).toEqual(expectedSorted[i]);
			});
		});
	});

	describe('selectionSort', () => {
		it('should generate steps that result in sorted array', () => {
			testArrays.forEach((test, i) => {
				const steps = selectionSort([...test.array]);
				const finalStep = steps[steps.length - 1];
				expect(finalStep.array).toEqual(expectedSorted[i]);
			});
		});
	});

	describe('heapSort', () => {
		it('should generate steps that result in sorted array', () => {
			testArrays.forEach((test, i) => {
				const steps = heapSort([...test.array]);
				const finalStep = steps[steps.length - 1];
				expect(finalStep.array).toEqual(expectedSorted[i]);
			});
		});
	});

	describe('SortStep structure', () => {
		it('should have required properties', () => {
			const steps = bubbleSort([5, 2]);
			steps.forEach((step) => {
				expect(step).toHaveProperty('array');
				expect(step).toHaveProperty('type');
				expect(Array.isArray(step.array)).toBe(true);
				expect(['compare', 'swap', 'pivot', 'merge']).toContain(step.type);
			});
		});
	});
});
