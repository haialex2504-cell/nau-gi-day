/**
 * Maps any raw difficulty to a standard DB key (de, trung-binh, kho).
 */
export function getStandardizedDifficulty(rawDifficulty: string | undefined): 'de' | 'trung-binh' | 'kho' {
  if (!rawDifficulty) return 'trung-binh';
  const normalized = rawDifficulty.toLowerCase().trim();
  if (['de', 'dễ', 'easy', 'de~'].includes(normalized)) return 'de';
  if (['kho', 'khó', 'hard'].includes(normalized)) return 'kho';
  return 'trung-binh';
}

/**
 * Gets the localized difficulty label.
 * @param rawDifficulty The raw value from database
 * @param tAddRecipe The dictionary object (dict.addRecipe)
 */
export function getDifficultyLabel(rawDifficulty: string | undefined, tAddRecipe: any): string {
  const std = getStandardizedDifficulty(rawDifficulty);
  if (std === 'de') return tAddRecipe.difficultyEasy;
  if (std === 'kho') return tAddRecipe.difficultyHard;
  return tAddRecipe.difficultyMedium;
}
