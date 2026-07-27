export type TrainingSettings = {
  infiniteHealth: boolean;
  showFrameData: boolean;
};

export class TrainingController {
  private settings: TrainingSettings = {
    infiniteHealth: true,
    showFrameData: false,
  };

  update(next: Partial<TrainingSettings>) {
    this.settings = { ...this.settings, ...next };
  }

  snapshot(): TrainingSettings {
    return { ...this.settings };
  }
}
