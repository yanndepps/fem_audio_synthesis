/*
* Web Audio Workshop
* Sketch_02
* play mp3 -> buffering
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

window.mousePressed = () => {
	playSound();
};

async function loadSound() {
	// re-use the same context if it exists
	if (!audioContext) {
		audioContext = new AudioContext();
	}

	// re-use the audio buffer as a source
	if (!audioBuffer) {
		// fetch MP3 from URL
		const resp = await fetch('../assets/chime.mp3');

		// turn into an array buffer of raw binary data
		const buf = await resp.arrayBuffer();

		// decode the entire binary MP3 into an AudioBuffer
		audioBuffer = await audioContext.decodeAudioData(buf);
	}
}

async function playSound() {
	// ensure we are all loaded up
	await loadSound();

	// ensure we are in a resume state
	await audioContext.resume();

	// now create a new "buffer source" node for playing AudioBuffers
	const source = audioContext.createBufferSource();

	// connect to destination
	source.connect(audioContext.destination);

	// assign the loaded buffer
	source.buffer = audioBuffer;

	// start ( zero -> play immediately )
	source.start(0);
}

const sketch = () => {
	return ({ width, height }) => {
		background(33);
		fill(255);
		noStroke();

		// draw play/pause button
		const dim = min(width, height);
		if (mouseIsPressed) {
			circle(width / 2, height / 2, dim * 0.1);
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
