export function getTodayAsString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export function removeZeros(date: string):string{
  return date.replace('T00:00:00', '')
}
