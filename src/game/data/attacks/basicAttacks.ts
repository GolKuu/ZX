export type AttackDefinition = {
  id: string;
  name: string;
  startupTicks: number;
  activeTicks: number;
  recoveryTicks: number;
  damage: number;
};

export const lightStrike: AttackDefinition = {
  id: 'light-strike',
  name: 'Круговой удар',
  startupTicks: 5,
  activeTicks: 3,
  recoveryTicks: 16,
  damage: 8,
};
