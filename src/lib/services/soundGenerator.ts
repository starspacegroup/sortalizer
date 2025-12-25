/**
 * Sound Generator Service
 * Uses Web Audio API to generate tones for sorting visualization
 */

export class SoundGenerator {
	private audioContext: AudioContext | null = null;
	private volume: number = 0.3;
	private muted: boolean = false;

	constructor() {
		if (typeof window !== 'undefined' && 'AudioContext' in window) {
			this.audioContext = new AudioContext();
		}
	}

	/**
	 * Map array value to frequency (200Hz - 800Hz)
	 */
	valueToFrequency(value: number, maxValue: number): number {
		const minFreq = 200;
		const maxFreq = 800;
		const normalized = value / maxValue;
		return minFreq + normalized * (maxFreq - minFreq);
	}

	/**
	 * Play a tone at the given frequency
	 */
	playTone(frequency: number, duration: number = 0.1): void {
		if (!this.audioContext || this.muted) return;

		try {
			const oscillator = this.audioContext.createOscillator();
			const gainNode = this.audioContext.createGain();

			oscillator.connect(gainNode);
			gainNode.connect(this.audioContext.destination);

			oscillator.frequency.value = frequency;
			oscillator.type = 'sine';

			// Envelope for smooth sound
			const now = this.audioContext.currentTime;
			gainNode.gain.setValueAtTime(0, now);
			gainNode.gain.linearRampToValueAtTime(this.volume, now + 0.01);
			gainNode.gain.linearRampToValueAtTime(0, now + duration);

			oscillator.start(now);
			oscillator.stop(now + duration);
		} catch (error) {
			console.error('Error playing tone:', error);
		}
	}

	/**
	 * Play comparison sound (two tones in sequence)
	 */
	playComparison(value1: number, value2: number, maxValue: number): void {
		const freq1 = this.valueToFrequency(value1, maxValue);
		const freq2 = this.valueToFrequency(value2, maxValue);

		this.playTone(freq1, 0.05);
		setTimeout(() => this.playTone(freq2, 0.05), 25);
	}

	/**
	 * Play swap sound (chord)
	 */
	playSwap(value1: number, value2: number, maxValue: number): void {
		const freq1 = this.valueToFrequency(value1, maxValue);
		const freq2 = this.valueToFrequency(value2, maxValue);

		this.playTone(freq1, 0.08);
		this.playTone(freq2, 0.08);
	}

	/**
	 * Set volume (0 to 1)
	 */
	setVolume(vol: number): void {
		this.volume = Math.max(0, Math.min(1, vol));
	}

	/**
	 * Get current volume
	 */
	getVolume(): number {
		return this.volume;
	}

	/**
	 * Set muted state
	 */
	setMuted(muted: boolean): void {
		this.muted = muted;
	}

	/**
	 * Check if muted
	 */
	isMuted(): boolean {
		return this.muted;
	}

	/**
	 * Toggle mute
	 */
	toggleMute(): void {
		this.muted = !this.muted;
	}

	/**
	 * Clean up audio context
	 */
	dispose(): void {
		if (this.audioContext) {
			this.audioContext.close();
			this.audioContext = null;
		}
	}
}
