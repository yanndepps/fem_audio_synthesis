/*
 * Web Audio Workshop
 * U1 -> Web Audio API
 * Sketch_03 ->  gain node
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
let gainNode;

window.mousePressed = () => {
	if (!audioContext) {
		// create a new audioContext
		audioContext = new AudioContext();

		// create <audio> tag
		audio = document.createElement('audio');

		// set URL to the MP3
		audio.src = '../assets/piano.mp3';

		// to play audio through CDN
		// audio.crossOrigin = 'Anonymouse';

		// enable looping
		audio.loop = true;

		// play the audio
		audio.play();

		// create a "Media Element" source node
		const source = audioContext.createMediaElementSource(audio);

		// create a gain volume for adjustement
		gainNode = audioContext.createGain();

		// wire source to gain
		source.connect(gainNode);

		// wire gain -> speaker
		gainNode.connect(audioContext.destination);
	} else {
		// clean up our element and audio context
		audio.pause();
		audioContext.close();
		audioContext = audio = null;
	}
};

const sketch = () => {
	return ({ width, height }) => {
		background(33);
		fill(255);
		noStroke();

		// draw play/pause button
		const dim = min(width, height);
		if (audioContext) {
			// get a new volume based on mouse pos
			const volume = abs(mouseX - width / 2) / (width / 2);
			// schedule a gradual shift in value with a small time constant
			gainNode.gain.setTargetAtTime(volume, audioContext.currentTime, 0.01);
			// draw a volume meter
			rectMode(CENTER);
			rect(width / 2, height / 2, dim * volume, dim * 0.05);
		} else {
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
