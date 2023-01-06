/*
* Web Audio Workshop
* U2 -> Visualization
* Sketch_02 -> advanced waveform
*/

const canvasSketch = require('canvas-sketch');
const p5 = require('p5');
new p5();

const settings = {
	p5: true,
  dimensions: [ 1024, 1024 ],
	animate: true,
	context: '2d'
};

let audioContext;
let analyserNode;
let analyserData;
let gainNode;
let audio;
let isFloat = false;
let interval;

window.mousePressed = () => {
	//---
	if (!audioContext) {
		const AudioContext = window.AudioContext || window.webkitAudioContext;
		audioContext = new AudioContext();
		//---
		audio = document.createElement('audio');

		// upon loading the audio, let's play it
		audio.addEventListener(
			"canplay",
			() => {
				// ensure the context is in a resume state
				audioContext.resume();
				// now play the audio
				audio.play();
			},
			{ once: true }
		);

		// loop audio
		audio.loop = true;

		// set source
		audio.crossOrigin = "Anonymous";
		audio.src = "../../assets/piano.mp3";

		// connect source into the WebAudio context
		const source = audioContext.createMediaElementSource(audio);
		source.connect(audioContext.destination);

		analyserNode = audioContext.createAnalyser();

		// we can increase the detail to some power-of-two value
		// this will give more samples of data per second
		const detail = 4;
		analyserNode.fftSize = 2048 * detail;

		isFloat = Boolean(analyserNode.getFloatTimeDomainData);
		analyserData = new Float32Array(analyserNode.fftSize);
		if (isFloat) {
			// use float array for higher detail
			analyserTarget = new Float32Array(analyserData.length);
		} else {
			// stuck with byte array
			analyserTarget = new Uint8Array(analyserData.length);
			analyserTarget.fill(0xff / 2);
		}

		// connect source to analyser
		source.connect(analyserNode);

		// only update the data every N fps
		const fps = 12;
		interval = setInterval(() => {
			if (isFloat) {
				analyserNode.getFloatTimeDomainData(analyserTarget);
			} else {
				analyserNode.getByteTimeDomainData(analyserTarget);
			}
		}, (1 / fps) * 1000);
	} else {
		// kill audio
		audio.pause();
		audioContext.close();
		clearInterval(interval);
		audioContext = analyserNode = null;
	}
};

const sketch = () => {
	//---
  return ({ time, width, height }) => {
		background(0, 0, 0);
		fill("white");
		noStroke();

		if (analyserNode) {
			// interpolate the previous frame's data to the new frame
			for (let i = 0; i < analyserData.length; i++) {
				analyserData[i] = damp(
					analyserData[i],
					isFloat ? analyserTarget[i] : (analyserTarget[i] / 256) * 2 - 1,
					0.01,
					// deltaTime
					time
				);
			}

			// draw scene
			noFill();
			stroke("white")

			// draw each sample within the data
			beginShape();
			const margin = 0.1;

			for (let i = 0; i < analyserData.length; i++) {
				// map sample to screen X pos
				const x = map(
					i,
					0,
					analyserData.length,
					width * margin,
					width * (1 - margin)
				);

				// signal coming from this frequency bin
				const signal = analyserData[i];

				// boost the signal so it shows better
				const amplitude = height * 4;

				// map signal to screen Y pos
				const y = map(
					signal,
					-1,
					1,
					height / 2 - amplitude / 2,
					height / 2 + amplitude / 2
				);

				// place vertex
				vertex(x, y);
			}
			// finish the line
			endShape();
		} else {
			// draw a play button
			const dim = min(width, height);
			polygon(width /2, height / 2, dim * 0.1, 3);
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

function damp(a, b, lambda, dt) {
	return lerp(a, b, 1 - Math.exp(-lambda * dt));
}

canvasSketch(sketch, settings);
