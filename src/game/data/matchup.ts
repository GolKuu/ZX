export type LocalMatchup = {
  player1CharacterId: string;
  player2CharacterId: string;
  arenaId: string;
};

export const defaultMatchup: LocalMatchup = {
  player1CharacterId: 'granite',
  player2CharacterId: 'shira',
  arenaId: 'sunny-rooftop',
};
