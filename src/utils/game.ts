import { Card, CardType, GameState, Team } from '../types';
import { MAX_CARDS, WORD_POOL } from '../constants';

export const shuffle = <T,>(items: T[]): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export const generateGame = (): GameState => {
  const firstTeam: Team = Math.random() > 0.5 ? 'red' : 'blue';
  const firstCount = 9;
  const secondCount = 8;
  const secondTeam: Team = firstTeam === 'red' ? 'blue' : 'red';

  const words = shuffle([...new Set(WORD_POOL)]).slice(0, MAX_CARDS);
  const roles = shuffle<CardType>([
    ...Array<CardType>(firstCount).fill(firstTeam),
    ...Array<CardType>(secondCount).fill(secondTeam),
    ...Array<CardType>(7).fill('neutral'),
    'assassin',
  ]);

  const board: Card[] = words.map((word, index) => ({
    id: index,
    word,
    type: roles[index],
  }));

  return {
    board,
    firstTeam,
    currentTeam: firstTeam,
    remaining: {
      red: firstTeam === 'red' ? firstCount : secondCount,
      blue: firstTeam === 'blue' ? firstCount : secondCount,
    },
  };
};
