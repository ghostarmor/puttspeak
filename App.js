import React, { useContext } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
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

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.micButton,
          isRecording && styles.micButtonActive, // Change style when recording
        ]}
        onPressIn={startRecording}
        onPressOut={stopRecording}
        disabled={isTranscribing}
      >
        <MaterialIcons
          name="mic"
          size={48}
          color={isRecording ? "#ff0000" : "#fff"} // Change icon color when recording
        />
      </TouchableOpacity>
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
