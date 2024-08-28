import React, { useContext } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import SpeechToTextProvider, { SpeechToTextContext } from './SpeechToTextProvider';

const RecordingScreen = () => {
  const { startRecording, stopRecording, recognizedText, isRecording } = useContext(SpeechToTextContext);

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button
          title={isRecording ? "Stop Recording" : "Start Recording"}
          onPress={isRecording ? stopRecording : startRecording}
          color={isRecording ? "#d9534f" : "#5cb85c"}
        />
      </View>
      <View style={styles.transcriptionContainer}>
        <Text style={styles.transcriptionText}>{recognizedText || "Transcription will appear here..."}</Text>
      </View>
    </View>
  );
};

const App = () => {
  return (
    <SpeechToTextProvider>
      <RecordingScreen />
    </SpeechToTextProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  transcriptionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    width: '80%',
  },
  transcriptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});

export default App;
