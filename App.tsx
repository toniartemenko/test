import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

type Team = 'red' | 'blue';
type CardType = Team | 'neutral' | 'assassin';

type RevealedBy = Team | 'neutral' | 'assassin';

interface Card {
  id: number;
  word: string;
  type: CardType;
  revealedBy?: RevealedBy;
}

interface Hint {
  word: string;
  number: number;
}

const WORD_POOL = [
  'Ліс', 'Хмара', 'Річка', 'Книга', 'Кавун', 'Міст', 'Птах', 'Зірка', 'Пошта',
  'Музика', 'Фільм', 'Сонце', 'Ключ', 'Дорога', 'Пошта', 'Космос', 'Море', 'Сад',
  'Вітер', 'Гора', 'Лампа', 'Стіл', 'Острів', 'Театр', 'Парк', 'Ракета', 'Пляж',
  'Кава', 'Час', 'Телефон', 'Місто', 'Прапор', 'Папір', 'Сніг', 'Дзвін', 'Озеро',
  'Мед', 'Корабель', 'Камінь', 'Машина', 'Школа', 'Торт', 'Мишка', 'Кішка', 'Якір',
];

const TEAM_COLORS: Record<Team, string> = {
  red: '#e53935',
  blue: '#1e88e5',
};

const MAX_CARDS = 25;

const shuffle = <T,>(items: T[]): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const generateGame = () => {
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

export default function App() {
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
    const includesBoardWord = hiddenWords.some((word) =>
      word.includes(loweredHint) || loweredHint.includes(word),
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Codenames UA</Text>
          <Pressable onPress={startNewGame} style={styles.restartButton}>
            <Text style={styles.restartButtonText}>Нова гра</Text>
          </Pressable>
        </View>

        <Text style={styles.subtitle}>
          Перший хід: <Text style={[styles.bold, { color: TEAM_COLORS[game.firstTeam] }]}>{game.firstTeam.toUpperCase()}</Text>
        </Text>

        <View style={styles.scoreRow}>
          <Text style={[styles.scoreCard, { borderColor: TEAM_COLORS.red }]}>Червоні: {game.remaining.red}</Text>
          <Text style={[styles.scoreCard, { borderColor: TEAM_COLORS.blue }]}>Сині: {game.remaining.blue}</Text>
        </View>

        {winner ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              Перемогла команда {winner.toUpperCase()}
              {loserByAssassin ? ` (суперник відкрив вбивцю)` : ''}
            </Text>
          </View>
        ) : (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Хід команди {game.currentTeam.toUpperCase()}</Text>
          </View>
        )}

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Режим капітана</Text>
          <Switch value={isCaptainView} onValueChange={setIsCaptainView} disabled={gameEnded} />
        </View>

        <View style={styles.hintCard}>
          <Text style={styles.sectionTitle}>Підказка</Text>
          {hint ? (
            <Text style={styles.activeHint}>
              {hint.word}: {hint.number} · Залишилось спроб: {guessesLeft}
            </Text>
          ) : (
            <>
              <TextInput
                value={hintWord}
                onChangeText={setHintWord}
                placeholder="Одне слово"
                style={styles.input}
                editable={!gameEnded}
              />
              <TextInput
                value={hintNumber}
                onChangeText={setHintNumber}
                placeholder="Число"
                style={styles.input}
                keyboardType="number-pad"
                editable={!gameEnded}
                maxLength={1}
              />
              <Pressable style={styles.primaryButton} onPress={submitHint} disabled={gameEnded}>
                <Text style={styles.primaryButtonText}>Передати підказку</Text>
              </Pressable>
            </>
          )}
          {hint && !gameEnded ? (
            <Pressable style={styles.secondaryButton} onPress={endTurn}>
              <Text style={styles.secondaryButtonText}>Завершити хід</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.grid}>
          {game.board.map((card) => {
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
                key={card.id}
                style={[styles.card, { backgroundColor: baseBackground }, isRevealed && styles.revealedCard]}
                onPress={() => revealCard(card.id)}
                disabled={isRevealed || !hint || gameEnded}
              >
                <Text style={[styles.cardText, { color: textColor }]}>{card.word}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  container: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
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
  subtitle: {
    fontSize: 14,
    color: '#394b61',
  },
  bold: {
    fontWeight: '700',
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
  switchRow: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontWeight: '600',
    color: '#1f2937',
  },
  hintCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#182230',
  },
  activeHint: {
    fontSize: 16,
    fontWeight: '600',
    color: '#182230',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d7dde8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fafcff',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1f2937',
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
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
