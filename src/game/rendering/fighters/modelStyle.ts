export const MODEL_OUTLINE = 0x201a36;
export const MODEL_OUTLINE_CSS = '#201a36';
export const MODEL_HIGHLIGHT = 0xfff8e8;
export const MODEL_EYE_GLOW = 0xcffff7;
export const GRANITE_CORE_GLOW = 0xffc857;

export type ModelStrokeRole = 'body' | 'limb' | 'joint' | 'accent' | 'detail';

export function getModelStrokeWidth(baseWidth: number, role: ModelStrokeRole) {
  switch (role) {
    case 'body':
      return Math.max(5, baseWidth);
    case 'limb':
      return Math.max(6, baseWidth + 2);
    case 'joint':
      return Math.max(4, baseWidth + 1);
    case 'accent':
      return Math.max(3, baseWidth);
    default:
      return Math.max(2, baseWidth);
  }
}
