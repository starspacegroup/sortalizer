/**
 * Sorting Algorithms Service
 * Implements various sorting algorithms with step-by-step state tracking
 */

export type SortStepType = 'compare' | 'swap' | 'pivot' | 'merge';

export interface SortStep {
	array: number[];
	type: SortStepType;
	indices?: number[];
	pivot?: number;
	sorted?: boolean;
}

export interface SortState {
	steps: SortStep[];
	currentStep: number;
	isPlaying: boolean;
	speed: number;
}

export interface AlgorithmInfo {
	name: string;
	timeComplexity: {
		best: string;
		average: string;
		worst: string;
	};
	spaceComplexity: string;
	description: string;
}

export const algorithms: Record<string, AlgorithmInfo> = {
	bubble: {
		name: 'Bubble Sort',
		timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
		spaceComplexity: 'O(1)',
		description:
			'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.'
	},
	insertion: {
		name: 'Insertion Sort',
		timeComplexity: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
		spaceComplexity: 'O(1)',
		description:
			'Builds the final sorted array one item at a time, inserting each element into its proper position.'
	},
	selection: {
		name: 'Selection Sort',
		timeComplexity: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)' },
		spaceComplexity: 'O(1)',
		description:
			'Divides the array into sorted and unsorted regions, repeatedly selecting the minimum element from unsorted region.'
	},
	merge: {
		name: 'Merge Sort',
		timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
		spaceComplexity: 'O(n)',
		description:
			'Divides the array into two halves, recursively sorts them, and then merges the sorted halves.'
	},
	quick: {
		name: 'Quick Sort',
		timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
		spaceComplexity: 'O(log n)',
		description:
			'Picks a pivot element and partitions the array around it, recursively sorting the partitions.'
	},
	heap: {
		name: 'Heap Sort',
		timeComplexity: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
		spaceComplexity: 'O(1)',
		description: 'Converts the array into a heap data structure and repeatedly extracts the maximum element.'
	}
};

/**
 * Bubble Sort - O(n²)
 */
export function bubbleSort(arr: number[]): SortStep[] {
	const steps: SortStep[] = [];
	const array = [...arr];
	const n = array.length;

	for (let i = 0; i < n - 1; i++) {
		let swapped = false;
		for (let j = 0; j < n - i - 1; j++) {
			// Compare step
			steps.push({
				array: [...array],
				type: 'compare',
				indices: [j, j + 1]
			});

			if (array[j] > array[j + 1]) {
				// Swap
				[array[j], array[j + 1]] = [array[j + 1], array[j]];
				swapped = true;

				steps.push({
					array: [...array],
					type: 'swap',
					indices: [j, j + 1]
				});
			}
		}
		if (!swapped) break;
	}

	// Final sorted state
	steps.push({
		array: [...array],
		type: 'compare',
		indices: [],
		sorted: true
	});

	return steps;
}

/**
 * Insertion Sort - O(n²)
 */
export function insertionSort(arr: number[]): SortStep[] {
	const steps: SortStep[] = [];
	const array = [...arr];
	const n = array.length;

	for (let i = 1; i < n; i++) {
		const key = array[i];
		let j = i - 1;

		steps.push({
			array: [...array],
			type: 'compare',
			indices: [i]
		});

		while (j >= 0 && array[j] > key) {
			steps.push({
				array: [...array],
				type: 'compare',
				indices: [j, j + 1]
			});

			array[j + 1] = array[j];

			steps.push({
				array: [...array],
				type: 'swap',
				indices: [j, j + 1]
			});

			j--;
		}
		array[j + 1] = key;
	}

	steps.push({
		array: [...array],
		type: 'compare',
		indices: [],
		sorted: true
	});

	return steps;
}

/**
 * Selection Sort - O(n²)
 */
export function selectionSort(arr: number[]): SortStep[] {
	const steps: SortStep[] = [];
	const array = [...arr];
	const n = array.length;

	for (let i = 0; i < n - 1; i++) {
		let minIdx = i;

		for (let j = i + 1; j < n; j++) {
			steps.push({
				array: [...array],
				type: 'compare',
				indices: [minIdx, j]
			});

			if (array[j] < array[minIdx]) {
				minIdx = j;
			}
		}

		if (minIdx !== i) {
			[array[i], array[minIdx]] = [array[minIdx], array[i]];

			steps.push({
				array: [...array],
				type: 'swap',
				indices: [i, minIdx]
			});
		}
	}

	steps.push({
		array: [...array],
		type: 'compare',
		indices: [],
		sorted: true
	});

	return steps;
}

/**
 * Merge Sort - O(n log n)
 */
export function mergeSort(arr: number[]): SortStep[] {
	const steps: SortStep[] = [];
	const array = [...arr];

	function merge(left: number, mid: number, right: number) {
		const leftArr = array.slice(left, mid + 1);
		const rightArr = array.slice(mid + 1, right + 1);

		let i = 0;
		let j = 0;
		let k = left;

		while (i < leftArr.length && j < rightArr.length) {
			steps.push({
				array: [...array],
				type: 'compare',
				indices: [left + i, mid + 1 + j]
			});

			if (leftArr[i] <= rightArr[j]) {
				array[k] = leftArr[i];
				i++;
			} else {
				array[k] = rightArr[j];
				j++;
			}

			steps.push({
				array: [...array],
				type: 'merge',
				indices: [k]
			});

			k++;
		}

		while (i < leftArr.length) {
			array[k] = leftArr[i];
			steps.push({
				array: [...array],
				type: 'merge',
				indices: [k]
			});
			i++;
			k++;
		}

		while (j < rightArr.length) {
			array[k] = rightArr[j];
			steps.push({
				array: [...array],
				type: 'merge',
				indices: [k]
			});
			j++;
			k++;
		}
	}

	function mergeSortHelper(left: number, right: number) {
		if (left < right) {
			const mid = Math.floor((left + right) / 2);
			mergeSortHelper(left, mid);
			mergeSortHelper(mid + 1, right);
			merge(left, mid, right);
		}
	}

	mergeSortHelper(0, array.length - 1);

	steps.push({
		array: [...array],
		type: 'compare',
		indices: [],
		sorted: true
	});

	return steps;
}

/**
 * Quick Sort - O(n log n) average
 */
export function quickSort(arr: number[]): SortStep[] {
	const steps: SortStep[] = [];
	const array = [...arr];

	function partition(low: number, high: number): number {
		const pivot = array[high];

		steps.push({
			array: [...array],
			type: 'pivot',
			indices: [high],
			pivot: high
		});

		let i = low - 1;

		for (let j = low; j < high; j++) {
			steps.push({
				array: [...array],
				type: 'compare',
				indices: [j, high],
				pivot: high
			});

			if (array[j] < pivot) {
				i++;
				[array[i], array[j]] = [array[j], array[i]];

				steps.push({
					array: [...array],
					type: 'swap',
					indices: [i, j],
					pivot: high
				});
			}
		}

		[array[i + 1], array[high]] = [array[high], array[i + 1]];

		steps.push({
			array: [...array],
			type: 'swap',
			indices: [i + 1, high],
			pivot: i + 1
		});

		return i + 1;
	}

	function quickSortHelper(low: number, high: number) {
		if (low < high) {
			const pi = partition(low, high);
			quickSortHelper(low, pi - 1);
			quickSortHelper(pi + 1, high);
		}
	}

	quickSortHelper(0, array.length - 1);

	steps.push({
		array: [...array],
		type: 'compare',
		indices: [],
		sorted: true
	});

	return steps;
}

/**
 * Heap Sort - O(n log n)
 */
export function heapSort(arr: number[]): SortStep[] {
	const steps: SortStep[] = [];
	const array = [...arr];
	const n = array.length;

	function heapify(n: number, i: number) {
		let largest = i;
		const left = 2 * i + 1;
		const right = 2 * i + 2;

		if (left < n) {
			steps.push({
				array: [...array],
				type: 'compare',
				indices: [left, largest]
			});

			if (array[left] > array[largest]) {
				largest = left;
			}
		}

		if (right < n) {
			steps.push({
				array: [...array],
				type: 'compare',
				indices: [right, largest]
			});

			if (array[right] > array[largest]) {
				largest = right;
			}
		}

		if (largest !== i) {
			[array[i], array[largest]] = [array[largest], array[i]];

			steps.push({
				array: [...array],
				type: 'swap',
				indices: [i, largest]
			});

			heapify(n, largest);
		}
	}

	// Build max heap
	for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
		heapify(n, i);
	}

	// Extract elements from heap
	for (let i = n - 1; i > 0; i--) {
		[array[0], array[i]] = [array[i], array[0]];

		steps.push({
			array: [...array],
			type: 'swap',
			indices: [0, i]
		});

		heapify(i, 0);
	}

	steps.push({
		array: [...array],
		type: 'compare',
		indices: [],
		sorted: true
	});

	return steps;
}

/**
 * Generate random array
 */
export function generateRandomArray(size: number, min: number = 10, max: number = 500): number[] {
	return Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
export function shuffleArray(arr: number[]): number[] {
	const array = [...arr];
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}
