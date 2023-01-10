/*
 * Web Audio Workshop
 * U4 -> Synth & Tone Generation
 * Sketch_01 -> tone demo
 */

const canvasSketch = require('canvas-sketch');
const p5 = require('p5');
const Tone = require('tone');
new p5();

const settings = {
	p5: true,
	dimensions: [512, 512],
	animate: true,
	context: '2d'
};

// master volume in decibels
const volume = -15;

// synth used for audio
let synth;

const sketch = () => {
	// clear with black on setup
	background(33);

	// make the volume quieter
	Tone.Destination.volume.value = volume;

	// setup a synth
	synth = new Tone.Synth({ oscillator: { type: 'sine' } });

	// wire up our nodes : synth +>---> master
	synth.connect(Tone.Destination);
	//---
	return ({ time, width, height }) => {
		background(33);

		const dim = Math.min(width, height);

		// get a 0..1 value for the mouse
		const u = max(0, min(1, mouseX / width));

		// choose a frequency
		const frequency = lerp(75, 2500, u);
		synth.setNote(frequency);

		if (mouseIsPressed) {
			const verts = 1000;
			noFill();
			stroke(255);
			strokeWeight(dim * 0.005);
			beginShape();
			for (let i = 0; i < verts; i++) {
				const t = verts <= 1 ? 0.5 : i / (verts - 1);
				const x = t * width;
				let y = height / 2;

				// an exaggerated representation for the sake of visualization
				const frequencyMod = lerp(1, 1000, pow(u, 5));
				const amplitude = sin(time + t * frequencyMod);

				y += (amplitude * height) / 2;

				vertex(x, y);
			}
			endShape();
		} else {
			// draw play btn
			noStroke();
			fill(255);
			polygon(width / 2, height / 2, dim * 0.1, 3);
		}
	};
};

window.mousePressed = () => {
	synth.triggerAttack();
}

window.mouseReleased = () => {
	synth.triggerRelease();
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
