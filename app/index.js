import React, { useContext, useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import stringSimilarity from "string-similarity";
import SpeechToTextProvider, {
  SpeechToTextContext,
} from "../components/SpeechToTextProvider";
import Scorecard from "../components/Scorecard";

export default function IndexWrapper() {
  const [players, setPlayers] = useState(["Jake", "Liam", "Ryan"]);
  const totalHoles = 18;

  const numberWordsToDigits = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
  };

  const normalizeName = (name) => name.trim().toLowerCase();

  const findClosestMatch = (name, existingNames) => {
    name = normalizeName(name);
    const normalizedNames = existingNames.map(normalizeName);
    const matches = stringSimilarity.findBestMatch(name, normalizedNames);
    if (matches.bestMatch.rating >= 0.2) {
      return existingNames[matches.bestMatchIndex];
    }
    return null;
  };

  const parseInput = (recognizedText) => {
    const regex =
      /(\w+)\s*(scored\s*(a|an)?\s*)?(\d+|one|two|three|four|five|six|seven|eight|nine|ten)?\s*(on\s*hole\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten))?/gi;
    let match;
    const commands = [];

    while ((match = regex.exec(recognizedText)) !== null) {
      const rawName = match[1];
      let score = match[4];
      let hole = match[6];

      score = isNaN(score)
        ? numberWordsToDigits[score?.toLowerCase()]
        : parseInt(score);
      hole = hole
        ? isNaN(hole)
          ? numberWordsToDigits[hole.toLowerCase()] - 1
          : parseInt(hole) - 1
        : null;

      commands.push({ name: rawName, score, hole });
    }

    return commands;
  };

  const [scores, setScores] = useState(
    players.reduce((acc, player) => {
      acc[player] = Array(totalHoles).fill("");
      return acc;
    }, {})
  );

  const updateScorecard = (recognizedText) => {
    const commands = parseInput(recognizedText);

    setScores((prevScores) => {
      const updatedScores = { ...prevScores };

      commands.forEach(({ name, score, hole }) => {
        name = findClosestMatch(name, players);

        if (name) {
          const playerScores = updatedScores[name] || Array(totalHoles).fill("");
          if (hole !== null) {
            playerScores[hole] = score.toString();
          } else {
            const nextHole = playerScores.indexOf("");
            if (nextHole !== -1) {
              playerScores[nextHole] = score.toString();
            }
          }

          updatedScores[name] = playerScores;
        } else {
          console.log(`No matching player found for name: ${name}`);
        }
      });

      console.log("Updated Scores:", updatedScores);
      return updatedScores;
    });
  };

  return (
    <SpeechToTextProvider>
      <ScrollView contentContainerStyle={styles.container}>
        <RecordingScreen onRecognizedText={updateScorecard} />
        <Scorecard players={players} totalHoles={totalHoles} scores={scores} onScoreUpdate={updateScorecard} />
      </ScrollView>
    </SpeechToTextProvider>
  );
}

function RecordingScreen({ onRecognizedText }) {
  const {
    startRecording,
    stopRecording,
    recognizedText,
    isRecording,
    isTranscribing,
  } = useContext(SpeechToTextContext);
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

  useEffect(() => {
    if (recognizedText) {
      onRecognizedText(recognizedText);
    }
  }, [recognizedText]);

  return (
    <View style={styles.recorderContainer}>
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
          style={[styles.micButton, isRecording && styles.micButtonActive]}
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
        <Text style={styles.recognizedText}>
          {recognizedText || "Press and hold to talk"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: '#f0f0f0',
  },
  recorderContainer: {
    marginBottom: 20,
  },
  visualizerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  micButton: {
    backgroundColor: "#1e90ff",
    borderRadius: 50,
    padding: 20,
    elevation: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  micButtonActive: {
    backgroundColor: "#ffcccc",
  },
  visualizer: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ffcccc",
  },
  textContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  recognizedText: {
    fontSize: 18,
    textAlign: "center",
    color: "#333",
  },
});

