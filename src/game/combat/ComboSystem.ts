export class ComboSystem {
  next(previousHits: number, landed: boolean) {
    return landed ? previousHits + 1 : 0;
  }
}
