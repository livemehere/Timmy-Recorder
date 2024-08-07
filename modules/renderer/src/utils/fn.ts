export function getKeyByValue(object: Record<any, any>, value: any) {
  return Object.keys(object).find((key) => object[key] === value);
}
