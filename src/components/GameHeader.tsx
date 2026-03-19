import { Pressable, StyleSheet, Text, View } from 'react-native';

interface GameHeaderProps {
  onNewGame: () => void;
}

export const GameHeader = ({ onNewGame }: GameHeaderProps) => (
  <View style={styles.headerRow}>
    <Text style={styles.title}>Codenames UA</Text>
    <Pressable onPress={onNewGame} style={styles.restartButton}>
      <Text style={styles.restartButtonText}>Нова гра</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#182230',
  },
  restartButton: {
    backgroundColor: '#182230',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  restartButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
