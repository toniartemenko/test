export type Team = 'red' | 'blue';
export type CardType = Team | 'neutral' | 'assassin';
export type RevealedBy = Team | 'neutral' | 'assassin';

export interface Card {
  id: number;
  word: string;
  type: CardType;
  revealedBy?: RevealedBy;
}

export interface Hint {
  word: string;
  number: number;
}

export interface GameState {
  board: Card[];
  firstTeam: Team;
  currentTeam: Team;
  remaining: Record<Team, number>;
}
