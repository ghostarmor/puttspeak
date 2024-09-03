// components/Scorecard.js

import React from "react";
import { StyleSheet, View, Text, TextInput, ScrollView } from "react-native";

export default function Scorecard({
  players,
  totalHoles,
  scores,
  onScoreUpdate,
}) {
  return (
    <ScrollView horizontal contentContainerStyle={styles.container}>
      <View style={styles.scorecardContainer}>
        <View style={styles.headerRow}>
          <View style={styles.nameCell}>
            <Text style={styles.headerText}>Player</Text>
          </View>
          {Array.from({ length: totalHoles }).map((_, index) => (
            <View key={index} style={styles.headerCell}>
              <Text style={styles.headerText}>{index + 1}</Text>
            </View>
          ))}
        </View>
        {players.map((player) => (
          <View key={player} style={styles.row}>
            <View style={styles.nameCell}>
              <Text style={styles.nameText}>{player}</Text>
            </View>
            {Array.from({ length: totalHoles }).map((_, hole) => (
              <View key={hole} style={styles.cell}>
                <TextInput
                  style={styles.input}
                  value={
                    scores[player] && scores[player][hole] !== undefined
                      ? scores[player][hole].toString()
                      : ""
                  }
                  keyboardType="numeric"
                  onChangeText={(text) =>
                    onScoreUpdate(`${player} ${text} hole ${hole + 1}`)
                  }
                  placeholder="-"
                  placeholderTextColor="#ccc"
                />
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#f7f7f7",
  },
  scorecardContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 10,
    paddingBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  nameCell: {
    width: 100,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 5,
    borderRightWidth: 1,
    borderRightColor: "#ddd",
  },
  headerCell: {
    width: 58,
    justifyContent: "center",
    alignItems: "center",
  },
  cell: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  nameText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
  },
  input: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    padding: 5,
  },
});
