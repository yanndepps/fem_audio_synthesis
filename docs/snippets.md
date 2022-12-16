

# Snippets

Some useful recipes and patterns.


## Contents

-   [Creating an Audio Tag](#org47d35b1)
-   [Loading an Audio Buffer](#orgfb60cf1)
-   [Playing an Audio Buffer](#org6ba49f8)


<a id="org47d35b1"></a>

## Creating an Audio Tag

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


<a id="orgfb60cf1"></a>

## Loading an Audio Buffer

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


<a id="org6ba49f8"></a>

## Playing an Audio Buffer

Relies on a `loadSound` function, as we can only play an audio buffer once it&rsquo;s been loaded and decoded asynchronously.

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

