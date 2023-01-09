/*
 * Web Audio Workshop
 * U3 -> Frequency Analysis
 * Sketch_01 -> overview
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
let audio;
let analyserNode;
let frequencyData;

window.mousePressed = () => {
	if (!audioContext) {
		// create a new audio context
		audioContext = new AudioContext();

		// create audio tag
		audio = document.createElement('audio');

		// set URL
		audio.src = '../../assets/bluejeans.mp3';

		// play audio through CDN
		audio.crossOrigin = 'Anonymous';

		// enable looping
		audio.loop = true;

		// play audio
		audio.play();

		// create a media element source node
		const source = audioContext.createMediaElementSource(audio);

		analyserNode = audioContext.createAnalyser();

		// get some higher resolution toward the low end
		analyserNode.fftSize = 2048 * 2;

		// defaults may need to be changed on different tracks
		analyserNode.minDecibels = -100;
		analyserNode.maxDecibels = -30;

		frequencyData = new Float32Array(analyserNode.fftSize);

		// connect source to analyser node
		source.connect(analyserNode);

		// connect source to destination
		source.connect(audioContext.destination);
	} else {
		// clean up element and audio context
		audio.pause();
		audioContext.close();
		audioContext = audio = null;
	}
}

const sketch = () => {
	//---
	return ({ width, height }) => {
		background(33);
		fill('white');
		noStroke();

		const dim = min(width, height);
		if (audioContext) {
			analyserNode.getFloatFrequencyData(frequencyData);
			const cx = width / 2;
			const cy = height / 2;
			const radius = dim * 0.75;
			strokeWeight(dim * 0.0075);
			noFill();

			// draw the low freq signal
			stroke('#E84420');
			const drum = audioSignal(analyserNode, frequencyData, 150, 2500);
			circle(cx, cy, radius * drum);

			// draw the higher freq signal
			stroke('#F4CD00');
			const voice = audioSignal(analyserNode, frequencyData, 50, 150);
			circle(cx, cy, radius * voice);
		} else {
			polygon(width / 2, height / 2, dim * 0.1, 3);
		}
	};
};

// convert the frequency in Hz to an index in the array
function frequencyToIndex(frequenyHz, sampleRate, frequencyBinCount) {
	const nyquist = sampleRate / 2;
	const index = Math.round((frequenyHz / nyquist) * frequencyBinCount);
	return Math.min(frequencyBinCount, Math.max(0, index));
}

// convert an index in a array to a frequency in Hz
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
