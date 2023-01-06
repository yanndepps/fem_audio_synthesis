/*
 * Web Audio Workshop
 * U2 -> Visualization
 * Sketch_01 -> waveform
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
let audioBuffer;
let analyserNode;
let analyserData;
let gainNode;


window.mousePressed = () => {
	playSound();
};

async function loadSound() {
	// re-use same context if existing
	if (!audioContext) {
		audioContext = new AudioContext();
	}

	// re-use the audio buffer as source
	if (!audioBuffer) {
		// fetch MP3 from URL
		const resp = await fetch('../../assets/chime.mp3');

		// turn into an array buffer of raw binary data
		const buf = await resp.arrayBuffer();

		// decode the entire binary MP3 into an AudioBuffer
		audioBuffer = await audioContext.decodeAudioData(buf);
	}

	// setup a master gain node and AnalyserNode
	if (!gainNode) {
		// create a gain and connect it to dest
		gainNode = audioContext.createGain();

		// create an Analyser Node
		analyserNode = audioContext.createAnalyser();

		// create a Float32 array to hold the data
		analyserData = new Float32Array(analyserNode.fftSize);

		// connect the GainNode to the analyser
		gainNode.connect(analyserNode);

		// connect GainNode to destination as well
		gainNode.connect(audioContext.destination);
	}
}

async function playSound() {
	// ensure we are loaded up
	await loadSound();

	// ensure we are in a resumed state
	await audioContext.resume();

	// create a new 'Buffer Source' node for playing AudioBuffers
	const source = audioContext.createBufferSource();

	// connect to gain (which will be analyzed and also sent to dest.)
	source.connect(gainNode);

	// assign the loaded buffer
	source.buffer = audioBuffer;

	// start
	source.start(0);
}

const sketch = () => {
	return ({ width, height }) => {
		background(33);

		// draw play/pause button
		if (analyserNode) {
			noFill();
			stroke(255);

			// get time domain data
			analyserNode.getFloatTimeDomainData(analyserData);

			beginShape();

			for (let i = 0; i < analyserData.length; i++) {
				// -1...1
				const amplitude = analyserData[i];

				const y = map(
					amplitude,
					-1,
					1,
					height / 2 - height / 4,
					height / 2 + height / 4
				);

				const x = map(
					i,
					0,
					analyserData.length - 1,
					0,
					width
				);

				vertex(x, y);
			}

			endShape();
		} else {
			fill(255);
			noStroke();
			// draw a play button
			const dim = min(width, height);
			polygon(width / 2, height / 2, dim * 0.1, 3);
		}
	};
};

// draw a basic polygon, handles triangles, squares, pentagons, etc
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
