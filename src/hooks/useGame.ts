import { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { Card, Hint, Team } from '../types';
import { generateGame } from '../utils/game';

export const useGame = () => {
  const [game, setGame] = useState(generateGame);
  const [isCaptainView, setIsCaptainView] = useState(true);
  const [hintWord, setHintWord] = useState('');
  const [hintNumber, setHintNumber] = useState('');
  const [hint, setHint] = useState<Hint | null>(null);
  const [guessesThisTurn, setGuessesThisTurn] = useState(0);
  const [correctGuessesThisTurn, setCorrectGuessesThisTurn] = useState(0);
  const [winner, setWinner] = useState<Team | null>(null);
  const [loserByAssassin, setLoserByAssassin] = useState<Team | null>(null);

  const gameEnded = winner !== null || loserByAssassin !== null;
  const guessedAllHintWords = hint ? correctGuessesThisTurn >= hint.number : false;
  const maxGuesses = hint ? hint.number + (guessedAllHintWords ? 1 : 0) : 0;
  const guessesLeft = hint ? Math.max(0, maxGuesses - guessesThisTurn) : 0;

  const nextTeam = (team: Team): Team => (team === 'red' ? 'blue' : 'red');

  const hiddenWords = useMemo(
    () => game.board.map((card) => card.word.toLowerCase()),
    [game.board],
  );

  const startNewGame = () => {
    setGame(generateGame());
    setHintWord('');
    setHintNumber('');
    setHint(null);
    setGuessesThisTurn(0);
    setCorrectGuessesThisTurn(0);
    setWinner(null);
    setLoserByAssassin(null);
    setIsCaptainView(true);
  };

  const submitHint = () => {
    if (gameEnded) {
      return;
    }

    const trimmedWord = hintWord.trim();
    const oneWordPattern = /^\S+$/;
    if (!oneWordPattern.test(trimmedWord)) {
      Alert.alert('Підказка має бути одним словом');
      return;
    }

    const parsedNumber = Number.parseInt(hintNumber, 10);
    if (!Number.isInteger(parsedNumber) || parsedNumber <= 0 || parsedNumber > 9) {
      Alert.alert('Число має бути від 1 до 9');
      return;
    }

    const loweredHint = trimmedWord.toLowerCase();
    const includesBoardWord = hiddenWords.some(
      (word) => word.includes(loweredHint) || loweredHint.includes(word),
    );

    if (includesBoardWord) {
      Alert.alert('Підказка не може містити слово з поля або бути його частиною');
      return;
    }

    setHint({ word: trimmedWord, number: parsedNumber });
    setGuessesThisTurn(0);
    setCorrectGuessesThisTurn(0);
    setIsCaptainView(false);
  };

  const endTurn = () => {
    setGame((current) => ({
      ...current,
      currentTeam: nextTeam(current.currentTeam),
    }));
    setHint(null);
    setHintWord('');
    setHintNumber('');
    setGuessesThisTurn(0);
    setCorrectGuessesThisTurn(0);
    setIsCaptainView(true);
  };

  const revealCard = (cardId: number) => {
    if (!hint || gameEnded) {
      return;
    }

    const target = game.board.find((card) => card.id === cardId);
    if (!target || target.revealedBy) {
      return;
    }

    const currentTeam = game.currentTeam;
    const oppositeTeam = nextTeam(currentTeam);

    let localWinner: Team | null = null;
    let assassinLoser: Team | null = null;
    let shouldEndTurn = false;
    let updatedCorrectGuesses = correctGuessesThisTurn;

    const updatedBoard: Card[] = game.board.map((card): Card => {
      if (card.id !== cardId) {
        return card;
      }

      if (card.type === 'assassin') {
        assassinLoser = currentTeam;
        localWinner = oppositeTeam;
        return { ...card, revealedBy: 'assassin' };
      }

      if (card.type === 'neutral') {
        shouldEndTurn = true;
        return { ...card, revealedBy: 'neutral' };
      }

      if (card.type === currentTeam) {
        updatedCorrectGuesses += 1;
        return { ...card, revealedBy: currentTeam };
      }

      shouldEndTurn = true;
      return { ...card, revealedBy: oppositeTeam };
    });

    const newRemaining = {
      red: updatedBoard.filter((card) => card.type === 'red' && !card.revealedBy).length,
      blue: updatedBoard.filter((card) => card.type === 'blue' && !card.revealedBy).length,
    };

    if (newRemaining.red === 0) {
      localWinner = 'red';
    }
    if (newRemaining.blue === 0) {
      localWinner = 'blue';
    }

    const updatedGuesses = guessesThisTurn + 1;

    setGame((current) => ({
      ...current,
      board: updatedBoard,
      remaining: newRemaining,
    }));

    setGuessesThisTurn(updatedGuesses);
    setCorrectGuessesThisTurn(updatedCorrectGuesses);

    if (localWinner) {
      setWinner(localWinner);
      if (assassinLoser) {
        setLoserByAssassin(assassinLoser);
      }
      return;
    }

    if (shouldEndTurn) {
      endTurn();
      return;
    }

    const canTakeExtra = updatedCorrectGuesses >= hint.number;
    const updatedMaxGuesses = hint.number + (canTakeExtra ? 1 : 0);
    if (updatedGuesses >= updatedMaxGuesses) {
      endTurn();
    }
  };

  return {
    game,
    isCaptainView,
    setIsCaptainView,
    hintWord,
    setHintWord,
    hintNumber,
    setHintNumber,
    hint,
    guessesLeft,
    winner,
    loserByAssassin,
    gameEnded,
    startNewGame,
    submitHint,
    endTurn,
    revealCard,
  };
};
