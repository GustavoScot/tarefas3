import { StyleSheet, View } from 'react-native';

export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

type DiceFaceProps = { value: DiceValue };

const PIP_POSITIONS: Record<DiceValue, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export function DiceFace({ value }: DiceFaceProps) {
  const visiblePips = new Set(PIP_POSITIONS[value]);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.die}
    >
      {Array.from({ length: 9 }, (_, index) => (
        <View style={styles.cell} key={index}>
          {visiblePips.has(index) && <View style={styles.pip} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  die: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    elevation: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    height: 174,
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    width: 174,
  },
  cell: {
    alignItems: 'center',
    height: '33.333%',
    justifyContent: 'center',
    width: '33.333%',
  },
  pip: {
    backgroundColor: '#211B45',
    borderRadius: 11,
    height: 22,
    width: 22,
  },
});
