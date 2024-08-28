import React, { useContext, useRef, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Animated, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SpeechToTextProvider, SpeechToTextContext } from './SpeechToTextProvider';

const App = () => {
  return (
    <SpeechToTextProvider>
      <RecordingScreen />
    </SpeechToTextProvider>
  );
};

const RecordingScreen = () => {
  const { startRecording, stopRecording, recognizedText, isRecording, isTranscribing } = useContext(SpeechToTextContext);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.5,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [isRecording]);

  return (
    <View style={styles.container}>
      <View style={styles.visualizerContainer}>
        <Animated.View
          style={[
            styles.visualizer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: isRecording ? 1 : 0,
            },
          ]}
        />
        <TouchableOpacity
          style={[
            styles.micButton,
            isRecording && styles.micButtonActive,
          ]}
          onPressIn={startRecording}
          onPressOut={stopRecording}
          disabled={isTranscribing}
        >
          <MaterialIcons
            name="mic"
            size={48}
            color={isRecording ? "#ff0000" : "#fff"}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.recognizedText}>{recognizedText || 'Press and hold to talk'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  visualizerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    backgroundColor: '#1e90ff',
    borderRadius: 50,
    padding: 20,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonActive: {
    backgroundColor: '#ffcccc', // Change background color when recording
  },
  visualizer: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffcccc',
  },
  textContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  recognizedText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
  },
});

export default App;
