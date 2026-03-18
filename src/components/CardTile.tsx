import { Pressable, StyleSheet, Text } from 'react-native';
import { Card, Hint } from '../types';

interface CardTileProps {
  card: Card;
  isCaptainView: boolean;
  hint: Hint | null;
  gameEnded: boolean;
  onReveal: (id: number) => void;
}

export const CardTile = ({ card, isCaptainView, hint, gameEnded, onReveal }: CardTileProps) => {
  const isRevealed = Boolean(card.revealedBy);
  const shouldRevealRole = isCaptainView || isRevealed || gameEnded;

  const baseBackground = shouldRevealRole
    ? card.type === 'red'
      ? '#ffcdd2'
      : card.type === 'blue'
        ? '#bbdefb'
        : card.type === 'assassin'
          ? '#424242'
          : '#eceff1'
    : '#ffffff';

  const textColor = card.type === 'assassin' && shouldRevealRole ? '#ffffff' : '#111111';

  return (
    <Pressable
      style={[styles.card, { backgroundColor: baseBackground }, isRevealed && styles.revealedCard]}
      onPress={() => onReveal(card.id)}
      disabled={isRevealed || !hint || gameEnded}
    >
      <Text style={[styles.cardText, { color: textColor }]}>{card.word}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '18%',
    minHeight: 64,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d7dde8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  revealedCard: {
    borderColor: '#556070',
  },
  cardText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
});
