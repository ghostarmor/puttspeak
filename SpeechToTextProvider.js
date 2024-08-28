import React, { useState, useEffect, createContext, useCallback, useMemo, useRef } from 'react';
import { Audio } from 'expo-av';
import RNFS from 'react-native-fs';
import { FFmpegKit } from 'ffmpeg-kit-react-native';
import { Platform } from 'react-native';
import { initWhisper } from 'whisper.rn';

export const SpeechToTextContext = createContext();

export const SpeechToTextProvider = ({ children }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const whisper = useRef();
  const [recording, setRecording] = useState();
  const [isTranscribing, setIsTranscribing] = useState(false);

  useEffect(() => {
    const setupWhisper = async () => {
      const context = await initWhisper({
        filePath: require('./assets/ggml-tiny.en.bin'), // Adjust path as necessary
      });
      whisper.current = context;
    };

    setupWhisper();
  }, []);

  const clearText = useCallback(() => setRecognizedText(''), []);

  const transcribeWithWhisper = async (uri) => {
    try {
      if (Platform.OS === 'android') {
        const targetFile = `${RNFS.DocumentDirectoryPath}/newFile.wav`;
        await FFmpegKit.execute(`-y -i ${uri} -ar 16000 -ac 1 -c:a pcm_s16le ${targetFile}`);
        uri = targetFile;
      }

      const transcription = whisper.current.transcribe(uri, {
        language: 'en',
        maxLen: 1,
        onProgress: (cur) => {
          setIsTranscribing(cur < 100);
        },
      });

      const result = await transcription.promise;
      if (result) {
        console.log(result['result']);
        setRecognizedText(result['result'].trim().replaceAll("[BLANK_AUDIO]", ""));
      }
    } catch (error) {
      console.error('Transcription error:', error);
    }
  };

  const startRecording = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
        console.error("Permission to access microphone is required!");
        return;
    }

    clearText();
    setIsRecording(true);
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

    const recordingOptions = {
      android: {
        extension: '.wav',
        outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
        audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
        sampleRate: 16000,
        numberOfChannels: 1,
        bitRate: 256000,
      },
      ios: {
        extension: '.wav',
        outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
        audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
        sampleRate: 16000,
        numberOfChannels: 1,
        bitRate: 256000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
    };

    try {
        const { recording } = await Audio.Recording.createAsync(recordingOptions);
        setRecording(recording);
    } catch (error) {
        console.error("Failed to start recording:", error);
        setIsRecording(false); // Reset the recording state if it fails
    }
};

  const stopRecording = async () => {
    await recording?.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    const uri = recording.getURI();
    setIsRecording(false);

    await transcribeWithWhisper(uri);
  };

  const contextValue = useMemo(() => ({
    recognizedText,
    startRecording,
    stopRecording,
    isRecording,
    clearText,
    isTranscribing,
  }), [recognizedText, isTranscribing, startRecording, stopRecording, isRecording, clearText]);

  return (
    <SpeechToTextContext.Provider value={contextValue}>
      {children}
    </SpeechToTextContext.Provider>
  );
};

export default SpeechToTextProvider;
