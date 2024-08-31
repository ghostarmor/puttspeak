import React, { useContext, useRef, useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Animated, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import stringSimilarity from 'string-similarity';
import SpeechToTextProvider, { SpeechToTextContext } from '../components/SpeechToTextProvider';

export default function IndexWrapper() {
  const [scorecard, setScorecard] = useState(new Map());
  const [players, setPlayers] = useState(['Aryan', 'Emily', 'John']); // Initial players

  const numberWordsToDigits = {
    'one': 1,
    'two': 2,
    'three': 3,
    'four': 4,
    'five': 5,
    'six': 6,
    'seven': 7,
    'eight': 8,
    'nine': 9,
    'ten': 10,
  };

  const normalizeName = (name) => {
    return name.trim().toLowerCase();
  };

  const findClosestMatch = (name, existingNames) => {
    name = normalizeName(name);
    const normalizedNames = existingNames.map(normalizeName);
    const matches = stringSimilarity.findBestMatch(name, normalizedNames);
    if (matches.bestMatch.rating >= 0.4) {  // Lowered the threshold for better matching
      return existingNames[matches.bestMatchIndex]; // Return the original (non-normalized) closest match
    }
    return null; // If no close match, return null
  };

  const updateScorecard = (recognizedText) => {
    // Regular expression to extract name, score (number or word), and optional hole (number or word)
    const regex = /(\w+)\s+scored\s+a\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)(?:\s+on\s+hole\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten))?/i;
    const match = recognizedText.match(regex);

    if (match) {
      let name = match[1]; // Player's name
      let score = match[2]; // Score for the hole
      let hole = match[3]; // Hole number (optional)

      // Convert spelled-out numbers to digits if necessary
      score = isNaN(score) ? numberWordsToDigits[score.toLowerCase()] : parseInt(score);
      hole = hole ? (isNaN(hole) ? numberWordsToDigits[hole.toLowerCase()] - 1 : parseInt(hole) - 1) : null; // Convert hole to 0-based index

      // Find the closest match to the recognized name in the list of declared players
      name = findClosestMatch(name, players);

      if (name) {
        setScorecard((prevScorecard) => {
          const updatedScorecard = new Map(prevScorecard);

          // Get the player's current scores or initialize an empty array
          const playerScores = updatedScorecard.get(name) || [];

          // If the hole is specified, update that specific hole
          if (hole !== null) {
            playerScores[hole] = score;
          } else {
            // If the hole is not specified, add the score to the next available hole
            playerScores.push(score);
          }

          // Update the scorecard with the player's scores
          updatedScorecard.set(name, playerScores);

          // Log the updated scorecard to the console
          console.log("Updated Scorecard:", updatedScorecard);

          return updatedScorecard;
        });
      } else {
        console.log(`No matching player found for name: ${match[1]}`);
      }
    } else {
      console.log("Unrecognized command:", recognizedText);
    }
  };

  return (
    <SpeechToTextProvider>
      <RecordingScreen onRecognizedText={updateScorecard} />
    </SpeechToTextProvider>
  );
}

function RecordingScreen({ onRecognizedText }) {
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

  // Call onRecognizedText whenever recognizedText updates
  useEffect(() => {
    if (recognizedText) {
      onRecognizedText(recognizedText);
    }
  }, [recognizedText]);

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
}

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
    backgroundColor: '#ffcccc',
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
