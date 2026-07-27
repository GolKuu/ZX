export class ComboEscapeSystem {
  canEscape(hitstunTicks: number, meter: number) {
    return hitstunTicks > 0 && meter >= 100;
  }
}
