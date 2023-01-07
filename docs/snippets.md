# Snippets

Some useful recipes and patterns.


## Contents

-   [Creating an Audio Tag](#org0a780f3)
-   [Loading an Audio Buffer](#orge7c4f20)
-   [Playing an Audio Buffer](#org78af554)
-   [Disabling Builtin Play/Pause Controls](#org806935a)
-   [Analysing Audio Waveform](#org0070733)
-   [Analysing Audio Frequency](#org2bd6856)
-   [Root Mean Squared Metering](#org61ae913)
-   [Indexing into the Frequency Array](#org7a91cd4)


## Creating an Audio Tag

```js
// create <audio> tag
const audio = document.createElement('audio');

// set URL to the MP3 within assets
audio.src = 'path/to/music.mp3';

// optional -> enable looping so the audio never stops
audio.loop = true;

// play audio
audio.play();

// it it's not already playing, resume audio context
audioContext.resume();
```


## Loading an Audio Buffer

```js
let audioContext;
let audioBuffer

async function loadSound() {
  // re-use the same context if it exists
  if (!audioContext) {
  audioContext = new AudioContext();
  }

  // re-use the audio buffer as a source
  if (!audioBuffer) {
    // fetch MP3 from URL
    const resp = await fetch('path/to/music.mp3');

    // turn into an array buffer of raw binary data
    const buf = await resp.arrayBuffer();

    // decode the entire binary MP3 into an AudioBuffer
    audioBuffer = await audioContext.decodeAudioData(buf);
  }
}
```


## Playing an Audio Buffer

Relies on a `loadSound` function, as we can only play an audio buffer once it&rsquo;s been loaded and decoded asynchronously.

```js
async function playSound() {
  // ensure we are all loaded up
  await loadSound();

  // ensure we are in a resumed state
  await audioContext.resume();

  // now create a new "Buffer Source" node for playing AudioBuffers
  const source = audioContext.createBufferSource();

  // connect to gain ( which will be analyzed and also sent to destination )
  source.connect(audioContext.destination);

  // assign the loaded buffer
  source.buffer = audioBuffer;

  // start ( zero -> play immediately )
  source.start(0);
}
```


## Disabling Builtin Play/Pause Controls

Browsers, by default, will play/pause `<audio>` elements on keyboard controls, and also sometimes when you connect and disconnect bluetooth headphones. In many app, one may want to override this.

```js
// just ignore this event
navigator.mediaSession.setActionHandler('pause', () => {});
```


## Analysing Audio Waveform

```js
let data;
let analyserNode;

function setupAudio() {
    /* ... create an audio 'source' node ... */

    analyserNode = audioContext.createAnalyser();
    signalData = new Float32Array(analyserNode.fftSize);

    source.connect(analyserNode);
}

function draw() {
    analyserNode.getFloatTimeDomainData(signalData);

    /* ... now visualize ... */
}
```


## Analysing Audio Frequency

```js
let data;
let frequencyData;

function setupAudio() {
    /* ... create an audio 'source' node ... */

    analyserNode = audioContext.createAnalyser();
    frequencyData = new Float32Array(analyserNode.frequencyBinCount);

    source.connect(analyserNode);
}

function draw() {
    analyserNode.getFloatFrequenyData(frequencyData);
    /* ... now visualize ... */
}
```


## Root Mean Squared Metering

Start with [1.6](#org0070733) snippet and then pass the data into the following function to get a signal between 0 and 1.

```js
function rootMeanSquaredSignal(data) {
    let rms = 0;
    for (let i = 0; i < data.length; i++) {
        rms += data[i] * data[i];
    }
    return Math.sqrt(rms / data.length);
}
```


## Indexing into the Frequency Array

If we have an array that represents a list of frequency bins (i.e. where the indices represent a frequency band in Hz and the array elements represent it&rsquo;s signal in Db) we can convert from Hz to and index and back like so :

```js
// convert the frequency in Hz to an index in the array
function frequencyToIndex(frequencyHz, sampleRate, frequencyBinCount) {
    const nyquist = sampleRate / 2;
    const index = Math.round((frequencyHz / nyquist) * frequencyBinCount);
    return Math.min(frequencyBinCount, Math.max(0, index));
}

// convert an index in an array to frequency in Hz
function indexToFrequency(index, sampleRate, frequencyBinCount) {
    return (index * sampleRate) / (frequencyBinCount * 2);
}
```