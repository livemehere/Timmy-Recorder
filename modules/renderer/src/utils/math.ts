// A 범위 의 값을 B 범위로 변환
export function map(v: number, min: number, max: number, newMin: number, newMax: number): number {
  if (min === max) {
    console.error('The original range cannot have the same lower and upper bounds');
    return 0;
  }
  // Calculate the ratio of the value within the original range
  const ratio = (v - min) / (max - min);
  // Map this ratio to the target range
  const mappedValue = newMin + ratio * (newMax - newMin);
  return mappedValue;
}
