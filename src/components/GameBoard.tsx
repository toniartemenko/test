import { StyleSheet, View } from 'react-native';
import { Card, Hint } from '../types';
import { CardTile } from './CardTile';

interface GameBoardProps {
  board: Card[];
  isCaptainView: boolean;
  hint: Hint | null;
  gameEnded: boolean;
  onReveal: (id: number) => void;
}

export const GameBoard = ({ board, isCaptainView, hint, gameEnded, onReveal }: GameBoardProps) => (
  <View style={styles.grid}>
    {board.map((card) => (
      <CardTile
        key={card.id}
        card={card}
        isCaptainView={isCaptainView}
        hint={hint}
        gameEnded={gameEnded}
        onReveal={onReveal}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
