export const SHADE_STEPS: number[] = [50];
for (let i = 100; i <= 900; i += 100) {
  SHADE_STEPS.push(i);
}
SHADE_STEPS.push(950);

export const OPACITIES_STEPS: number[] = [];
for (let i = 50; i <= 950; i += 50) {
  OPACITIES_STEPS.push(i);
}
