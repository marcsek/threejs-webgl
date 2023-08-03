export const wrap = (input: number, min: number, max: number) => {
  const range = max - min;
  return (input + range) % range;
};

export const oscilate = (input: number, min: number, max: number) => {
  const range = max - min;
  return min + Math.abs(((input + range) % (range * 2)) - range);
};

export const clamp = (min: number, max: number, a: number) => {
  return Math.min(Math.max(a, min), max);
};
