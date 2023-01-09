/*
 * Web Audio Workshop
 * U3 -> Frequency Analysis
 * Sketch_02 -> advanced frequency
 */

const canvasSketch = require('canvas-sketch');
const p5 = require('p5');
new p5();

const settings = {
	p5: true,
	dimensions: [1024, 1024],
	animate: true,
	context: '2d',
};

let audioContext;
let frequencyData;
let analyserNode;
let currentHue = 0;
let maxFrequencyTarget = 0;
let audio;

window.mousePressed = () => {
	// only initiate audio upon user gesture
	if (!audioContext) {
		audioContext = new AudioContext();

		// make stream source, i.e. MP3, microphone, etc
		// here an <audio> element
		audio = document.createElement('audio');

		// upon loading the audio, let's play it
		audio.addEventListener(
			'canplay',
			() => {
				// first, ensure the context is in a resume state
				audioContext.resume();
				// now play the audio
				audio.play();
			},
			{ once: true }
		);

		// enable looping
		audio.loop = true;

		// set source
		audio.crossOrigin = 'Anonymous';
		audio.src = '../../assets/piano.mp3';

		// connect source into the WebAudio context
		const source = audioContext.createMediaElementSource(audio);
		source.connect(audioContext.destination);

		analyserNode = audioContext.createAnalyser();

		const detail = 4;
		analyserNode.fftSize = 2048 * detail;

		analyserNode.minDecibels = -100;
		analyserNode.maxDecibels = -50;
		frequencyData = new Float32Array(analyserNode.frequencyBinCount);

		source.connect(analyserNode);
	} else {
		audio.pause();
		audioContext.close();
		audioContext = null;
	}
}

const sketch = () => {
	//---
	navigator.mediaSession.setActionHandler('pause', () => { });
	return ({ time, width, height }) => {
		background(240);
		noStroke();
		rectMode(CENTER);

		if (analyserNode) {
			analyserNode.getFloatFrequencyData(frequencyData);
			maxFrequencyTarget = map(
				audioMaxFrequency(analyserNode, frequencyData),
				0,
				500,
				0,
				360,
				true
			);
		}

		const cx = width / 2;
		const cy = height / 2;
		const dim = min(width, height);

		colorMode(HSL);
		currentHue = damp(currentHue, maxFrequencyTarget, 0.001, time);

		let hueA = currentHue;
		let hueB = (hueA + 45) % 360;
		const colorA = color(hueA, 50, 50);
		const colorB = color(hueB, 50, 50);

		const maxSize = dim * 0.75;
		const minSize = dim * 0.15;

		const count = 6;

		background(currentHue, 50, 50);

		for (let i = 0; i < count; i++) {
			const t = map(i, 0, count - 1, 0, 1);
			const c = color((currentHue + 90 * ((i + 1) / count)) % 360, 50, 50);

			const minBaseHz = 200;
			const maxBaseHz = 2000;
			const minHz = map(count - i, 0, count, minBaseHz, maxBaseHz);
			const maxHz = map(count - i + 1, 0, count, minBaseHz, maxBaseHz);

			const signal = analyserNode
				? audioSignal(analyserNode, frequencyData, minHz, maxHz)
				: 0;
			const baseSize = map(i, 0, count - 1, maxSize, minSize);
			const size = baseSize + (maxSize / 4) * signal;
			const edge = 0.5;

			fill(c);
			rect(cx, cy + ((maxSize - size) * edge) / 2, size, size);
		}

		if (!audioContext) {
			// draw play btn
			const dim = min(width, height);
			fill('white');
			noStroke();
			polygon(width / 2, height / 2, dim * 0.1, 3);
		}
	};
};

// convert the frequency in Hz to an index in the array
function frequencyToIndex(frequencyHz, sampleRate, frequencyBinCount) {
	const nyquist = sampleRate / 2;
	const index = Math.round((frequencyHz / nyquist) * frequencyBinCount);
	return Math.min(frequencyBinCount, Math.max(0, index));
}

// convert an index in an array to a frequency in Hz
function indexToFrequency(index, sampleRate, frequencyBinCount) {
	return (index * sampleRate) / (frequencyBinCount * 2);
}

// get the normalized audio signal (0..1) between two frequencies
function audioSignal(analyser, frequencies, minHz, maxHz) {
	if (!analyser) return 0;
	const sampleRate = analyser.context.sampleRate;
	const binCount = analyser.frequencyBinCount;
	let start = frequencyToIndex(minHz, sampleRate, binCount);
	const end = frequencyToIndex(maxHz, sampleRate, binCount);
	const count = end - start;
	let sum = 0;
	for (; start < end; start++) {
		sum += frequencies[start];
	}

	const minDb = analyserNode.minDecibels;
	const maxDb = analyserNode.maxDecibels;
	const valueDb = count === 0 || !isFinite(sum) ? minDb : sum / count;
	return map(valueDb, minDb, maxDb, 0, 1, true);
}

// find the frequency band that has the most peak signal
function audioMaxFrequency(analyserNode, frequencies) {
	let maxSignal = -Infinity;
	let maxSignalIndex = 0;
	for (let i = 0; i < frequencies.length; i++) {
		const signal = frequencies[i];
		if (signal > maxSignal) {
			maxSignal = signal;
			maxSignalIndex = i;
		}
	}
	return indexToFrequency(
		maxSignalIndex,
		analyserNode.context.sampleRate,
		analyserNode.frequencyBinCount
	);
}

function damp(a, b, lambda, dt) {
	return lerp(a, b, 1 - Math.exp(-lambda * dt));
}

function polygon(x, y, radius, sides = 3, angle = 0) {
	beginShape();
	for (let i = 0; i < sides; i++) {
		const a = angle + TWO_PI * (i / sides);
		let sx = x + cos(a) * radius;
		let sy = y + sin(a) * radius;
		vertex(sx, sy);
	}
	endShape(CLOSE);
}

canvasSketch(sketch, settings);
