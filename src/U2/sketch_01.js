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
let audio;

window.mousePressed = () => {
	if (!audioContext) {
		// setup audio
		audioContext = new AudioContext();

		// create a new <audio> tag
		audio = document.createElement('audio');

		// optional -> enable audio looping
		audio.loop = true;

		// set the URL of the audio asset
		audio.src = '../assets/piano.mp3';

		// trigger audio
		audio.play();

		const source = audioContext.createMediaElementSource(audio);

		// wire the source to the speaker
		source.connect(audioContext.destination);
	} else {
		// stop the audio
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
			polygon(width / 2, height / 2, dim * 0.1, 4, PI / 4);
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
