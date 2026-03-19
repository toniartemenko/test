import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Hint } from '../types';

interface HintPanelProps {
  hint: Hint | null;
  hintWord: string;
  hintNumber: string;
  guessesLeft: number;
  isCaptainView: boolean;
  gameEnded: boolean;
  onChangeHintWord: (text: string) => void;
  onChangeHintNumber: (text: string) => void;
  onSubmitHint: () => void;
  onEndTurn: () => void;
  onToggleCaptainView: (value: boolean) => void;
}

export const HintPanel = ({
  hint,
  hintWord,
  hintNumber,
  guessesLeft,
  isCaptainView,
  gameEnded,
  onChangeHintWord,
  onChangeHintNumber,
  onSubmitHint,
  onEndTurn,
  onToggleCaptainView,
}: HintPanelProps) => (
  <>
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>Режим капітана</Text>
      <Switch value={isCaptainView} onValueChange={onToggleCaptainView} disabled={gameEnded} />
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
            onChangeText={onChangeHintWord}
            placeholder="Одне слово"
            style={styles.input}
            editable={!gameEnded}
          />
          <TextInput
            value={hintNumber}
            onChangeText={onChangeHintNumber}
            placeholder="Число"
            style={styles.input}
            keyboardType="number-pad"
            editable={!gameEnded}
            maxLength={1}
          />
          <Pressable style={styles.primaryButton} onPress={onSubmitHint} disabled={gameEnded}>
            <Text style={styles.primaryButtonText}>Передати підказку</Text>
          </Pressable>
        </>
      )}
      {hint && !gameEnded ? (
        <Pressable style={styles.secondaryButton} onPress={onEndTurn}>
          <Text style={styles.secondaryButtonText}>Завершити хід</Text>
        </Pressable>
      ) : null}
    </View>
  </>
);

const styles = StyleSheet.create({
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
});
