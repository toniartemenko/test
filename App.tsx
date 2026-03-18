import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import { Banner } from './src/components/Banner';
import { GameBoard } from './src/components/GameBoard';
import { GameHeader } from './src/components/GameHeader';
import { HintPanel } from './src/components/HintPanel';
import { ScoreBoard } from './src/components/ScoreBoard';
import { TEAM_COLORS } from './src/constants';
import { useGame } from './src/hooks/useGame';

export default function App() {
  const {
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
  } = useGame();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <GameHeader onNewGame={startNewGame} />

        <Text style={styles.subtitle}>
          Перший хід:{' '}
          <Text style={[styles.bold, { color: TEAM_COLORS[game.firstTeam] }]}>
            {game.firstTeam.toUpperCase()}
          </Text>
        </Text>

        <ScoreBoard remaining={game.remaining} />

        <Banner
          currentTeam={game.currentTeam}
          winner={winner}
          loserByAssassin={loserByAssassin}
        />

        <HintPanel
          hint={hint}
          hintWord={hintWord}
          hintNumber={hintNumber}
          guessesLeft={guessesLeft}
          isCaptainView={isCaptainView}
          gameEnded={gameEnded}
          onChangeHintWord={setHintWord}
          onChangeHintNumber={setHintNumber}
          onSubmitHint={submitHint}
          onEndTurn={endTurn}
          onToggleCaptainView={setIsCaptainView}
        />

        <GameBoard
          board={game.board}
          isCaptainView={isCaptainView}
          hint={hint}
          gameEnded={gameEnded}
          onReveal={revealCard}
        />
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
  subtitle: {
    fontSize: 14,
    color: '#394b61',
  },
  bold: {
    fontWeight: '700',
  },
});
