import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SoundGenerator } from '$lib/services/soundGenerator';

describe('SoundGenerator', () => {
	let soundGenerator: SoundGenerator;
	let mockAudioContext: any;

	beforeEach(() => {
		// Mock AudioContext
		mockAudioContext = {
			createOscillator: vi.fn(() => ({
				frequency: { value: 0 },
				connect: vi.fn(),
				start: vi.fn(),
				stop: vi.fn(),
				type: 'sine'
			})),
			createGain: vi.fn(() => ({
				gain: {
					value: 0,
					setValueAtTime: vi.fn(),
					linearRampToValueAtTime: vi.fn()
				},
				connect: vi.fn()
			})),
			currentTime: 0,
			destination: {},
			close: vi.fn()
		};

		(globalThis as any).AudioContext = vi.fn(() => mockAudioContext) as any;
		soundGenerator = new SoundGenerator();
	});

	afterEach(() => {
		soundGenerator.dispose();
	});

	it('should create instance', () => {
		expect(soundGenerator).toBeInstanceOf(SoundGenerator);
	});

	it('should map values to frequencies', () => {
		const freq1 = soundGenerator.valueToFrequency(0, 100);
		const freq2 = soundGenerator.valueToFrequency(50, 100);
		const freq3 = soundGenerator.valueToFrequency(100, 100);

		expect(freq1).toBeLessThan(freq2);
		expect(freq2).toBeLessThan(freq3);
		expect(freq1).toBeGreaterThanOrEqual(200);
		expect(freq3).toBeLessThanOrEqual(800);
	});

	it('should play tone when not muted', () => {
		soundGenerator.playTone(400, 0.1);
		expect(mockAudioContext.createOscillator).toHaveBeenCalled();
		expect(mockAudioContext.createGain).toHaveBeenCalled();
	});

	it('should not play tone when muted', () => {
		soundGenerator.setMuted(true);
		soundGenerator.playTone(400, 0.1);
		expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
	});

	it('should update volume', () => {
		soundGenerator.setVolume(0.5);
		expect(soundGenerator.getVolume()).toBe(0.5);
	});

	it('should toggle mute', () => {
		expect(soundGenerator.isMuted()).toBe(false);
		soundGenerator.setMuted(true);
		expect(soundGenerator.isMuted()).toBe(true);
		soundGenerator.toggleMute();
		expect(soundGenerator.isMuted()).toBe(false);
	});

	it('should clamp volume between 0 and 1', () => {
		soundGenerator.setVolume(1.5);
		expect(soundGenerator.getVolume()).toBe(1);

		soundGenerator.setVolume(-0.5);
		expect(soundGenerator.getVolume()).toBe(0);
	});
});
