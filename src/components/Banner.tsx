import { StyleSheet, Text, View } from 'react-native';
import { Team } from '../types';

interface BannerProps {
  currentTeam: Team;
  winner: Team | null;
  loserByAssassin: Team | null;
}

export const Banner = ({ currentTeam, winner, loserByAssassin }: BannerProps) => (
  <View style={styles.banner}>
    {winner ? (
      <Text style={styles.bannerText}>
        Перемогла команда {winner.toUpperCase()}
        {loserByAssassin ? ` (суперник відкрив вбивцю)` : ''}
      </Text>
    ) : (
      <Text style={styles.bannerText}>Хід команди {currentTeam.toUpperCase()}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 12,
  },
  bannerText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
  },
});
