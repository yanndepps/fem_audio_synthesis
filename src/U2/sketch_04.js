/*
 * Web Audio Workshop
 * U2 -> Visualization
 * Sketch_04 -> volume meter
 */

const canvasSketch = require('canvas-sketch');
const p5 = require('p5');
new p5();

const settings = {
	p5: true,
	dimensions: [1024, 1024],
	animate: true,
	context: '2d'
};

let audioContext;
let audio;
let signals;

// isolate specifics bands of frequeny with their own colors
const frequencyBands = [
	{ frequency: 55, color: "#D5B3E5" },
	{ frequency: 110, color: "#7F3CAC" },
	{ frequency: 220, color: "#22A722" },
	{ frequency: 440, color: "#F1892A" },
	{ frequency: 570, color: "#E84420" },
	{ frequency: 960, color: "#F4CD00" },
	{ frequency: 2000, color: "#3E58E2" },
	{ frequency: 4000, color: "#F391C7" },
];

window.mousePressed = () => {
	if (!audioContext) {
		// create new audio context
		audioContext = new AudioContext();

		// create audio tag
		audio = document.createElement('audio');

		// set URL to audio file
		audio.src = '../../assets/piano.mp3';

		// play audio through CDN
		audio.crossOrigin = 'Anonymous';

		// enable looping
		audio.loop = true;

		// play audio
		audio.play();

		// create a media element source node
		const source = audioContext.createMediaElementSource(audio);

		// connect the source to the destination ( speakers/headphones )
		source.connect(audioContext.destination);

		// for each frequency isolated, create both an analyser and filter nodes
		signals = frequencyBands.map(({ frequency, color }) => {
			// create an analyser
			const analyser = audioContext.createAnalyser();
			analyser.smoothingTimeConstant = 1;

			// create FFT data
			const data = new Float32Array(analyser.fftSize);

			// create a filter that will only allow a band of data
			const filter = audioContext.createBiquadFilter();
			filter.frequency.value = frequency;
			filter.Q.value = 1;
			filter.type = 'bandpass';

			source.connect(filter);
			filter.connect(analyser);

			return {
				analyser,
				color,
				data,
				filter,
			};
		});
	} else {
		// clean up our element and audio context
		if (audio.paused) audio.play();
		else audio.pause();
	}
}

const sketch = () => {
	//---
	return ({ width, height }) => {
		background(33);

		// draw play/pause button
		const dim = min(width, height);
		if (audioContext) {
			signals.forEach(({ analyser, data, color }, i) => {
				// get the waveform
				analyser.getFloatTimeDomainData(data);

				// get the root mean square of the data
				// already filtered down to the band of
				// frequency we want
				const signal = rootMeanSquaredSignal(data);
				// scale the data a bit
				const scale = 10;
				const size = dim * scale * signal;

				// draw rectangles
				fill(color);
				noStroke();
				rectMode(CENTER);
				const margin = 0.2 * dim;
				const x = signals.length <= 1 ? width / 2 : map(i, 0, signals.length - 1, margin, width - margin);
				const sliceWidth = ((width - margin * 2) / (signals.length - 1)) * 0.75;
				rect(x, height / 2, sliceWidth, size);
			});
		} else {
			fill('white');
			noStroke();
			polygon(width / 2, height / 2, dim * 0.1, 3);
		}
	};
};

function rootMeanSquaredSignal(data) {
	let rms = 0;
	for (let i = 0; i < data.length; i++) {
		rms += data[i] * data[i];
	}
	return Math.sqrt(rms / data.length);
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
