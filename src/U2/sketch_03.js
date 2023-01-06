/*
 * Web Audio Workshop
 * U2 -> Visualization
 * Sketch_03 -> volume
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
let signalData;
let analyserNode;

window.mousePressed = () => {
	if (!audioContext) {
		// create a new audio context
		audioContext = new AudioContext();

		// create an audio tag
		audio = document.createElement('audio');

		// set URL to audio file
		audio.src = '../../assets/piano.mp3';

		audio.crossOrigin = 'Anonymous';

		// enable looping so the audio never stops
		audio.loop = true;

		// play audio
		audio.play();

		// create a media element source node
		const source = audioContext.createMediaElementSource(audio);

		// create an analyser
		analyserNode = audioContext.createAnalyser();
		analyserNode.smoothingTimeConstant = 1;

		// create FFT data
		signalData = new Float32Array(analyserNode.fftSize);

		// connect the source to the destination
		source.connect(audioContext.destination);

		// connect the source to the analyser node as well
		source.connect(analyserNode);
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
			// get the *time domaain* data ( not the frequency )
			analyserNode.getFloatTimeDomainData(signalData);

			// get the root mean square of the data
			const signal = rootMeanSquaredSignal(signalData);
			// scale the data a bit
			const scale = 10;
			const size = dim * scale * signal;

			stroke('white');
			noFill();
			strokeWeight(dim * 0.0075);
			circle(width / 2, height / 2, size);
		} else {
			fill('white');
			noStroke();
			polygon(width / 2, height / 2, dim * 0.1, 3);
		}
	};
};

// create the root mean squared of a set of signals
function rootMeanSquaredSignal(data) {
	let rms = 0;
	for (let i = 0; i < data.length; i++) {
		rms += data[i] * data[i];
	}
	return Math.sqrt(rms / data.length);
}

// draw basic polygon
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
