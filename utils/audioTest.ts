export const testMicrophone = async () => {
  try {
    console.log('Testing microphone access...');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Create an audio context
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);
    
    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 1024;
    
    microphone.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(audioContext.destination);
    
    scriptProcessor.onaudioprocess = function() {
      const array = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);
      const values = array.reduce((a, b) => a + b) / array.length;
      console.log('Microphone input level:', values);
      
      if (values > 0) {
        console.log('✅ Microphone is picking up audio');
      }
    };
    
    // Stop the test after 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Cleanup
    stream.getTracks().forEach(track => track.stop());
    scriptProcessor.disconnect();
    analyser.disconnect();
    microphone.disconnect();
    audioContext.close();
    
    return true;
  } catch (error) {
    console.error('❌ Microphone test failed:', error);
    return false;
  }
}; 