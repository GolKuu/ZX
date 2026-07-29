export type LocalMatchup = {
  player1CharacterId: string;
  player2CharacterId: string;
  arenaId: string;
};

export const defaultMatchup: LocalMatchup = {
  player1CharacterId: 'comet',
  player2CharacterId: 'pulse',
  arenaId: 'sunny-rooftop',
};
