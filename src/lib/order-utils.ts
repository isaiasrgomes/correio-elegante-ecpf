import { EXTRAS, LETTER_TYPES } from "./constants";

export function getLetterById(id: string) {
  return LETTER_TYPES.find((l) => l.id === id);
}

export function calculateTotal(
  letterTypeId: string,
  extras: { id: string; quantity: number }[] = []
) {
  const letter = getLetterById(letterTypeId);
  if (!letter) return 0;

  const extrasTotal = extras.reduce((sum, extra) => {
    const item = EXTRAS.find((e) => e.id === extra.id);
    if (!item) return sum;
    return sum + item.price * extra.quantity;
  }, 0);

  return letter.price + extrasTotal;
}
