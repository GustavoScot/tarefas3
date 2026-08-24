import type { DiceValue } from '../components/DiceFace';

export function rollDie(): DiceValue {
  return (Math.floor(Math.random() * 6) + 1) as DiceValue;
}
