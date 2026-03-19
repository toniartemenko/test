import { StyleSheet, Text, View } from 'react-native';
import { TEAM_COLORS } from '../constants';
import { Team } from '../types';

interface ScoreBoardProps {
  remaining: Record<Team, number>;
}

export const ScoreBoard = ({ remaining }: ScoreBoardProps) => (
  <View style={styles.scoreRow}>
    <Text style={[styles.scoreCard, { borderColor: TEAM_COLORS.red }]}>
      Червоні: {remaining.red}
    </Text>
    <Text style={[styles.scoreCard, { borderColor: TEAM_COLORS.blue }]}>
      Сині: {remaining.blue}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  scoreRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scoreCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
});
