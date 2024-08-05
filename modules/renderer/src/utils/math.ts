// A 범위 의 값을 B 범위로 변환
export function map(v: number, a: number, b: number, c: number, d: number): number {
  if (a === b) {
    throw new Error('The original range cannot have the same lower and upper bounds');
  }
  // Calculate the ratio of the value within the original range
  const ratio = (v - a) / (b - a);
  // Map this ratio to the target range
  const mappedValue = c + ratio * (d - c);
  return mappedValue;
}
