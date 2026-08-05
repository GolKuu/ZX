import { create } from 'zustand';
import {
  DEFAULT_BINDINGS,
  type Button,
  type KeyBindings,
} from '@/src/input/bindings';
import { migrateKeyBindings } from '@/src/input/bindingMigration';

export type ControlId = 'up' | 'down' | 'left' | 'right' | Button;

export interface ControlRow {
  readonly id: ControlId;
  readonly label: string;
  readonly detail: string;
}

export const CONTROL_ROWS: readonly ControlRow[] = [
  { id: 'up', label: 'Прыжок / вверх', detail: 'Движение' },
  { id: 'down', label: 'Присесть / вниз', detail: 'Движение' },
  { id: 'left', label: 'Назад', detail: 'Движение' },
  { id: 'right', label: 'Вперёд', detail: 'Движение' },
  { id: 'lp', label: 'J — передняя рука', detail: 'Обычный удар' },
  { id: 'lk', label: 'K — задняя рука', detail: 'Обычный удар' },
  { id: 'hp', label: 'I — передняя нога', detail: 'Обычный удар' },
  { id: 'hk', label: 'L — задняя нога', detail: 'Обычный удар' },
  { id: 'block', label: 'Блок', detail: 'Защита' },
  { id: 'dash', label: 'Рывок', detail: 'Движение' },
  { id: 'taunt', label: 'Насмешка', detail: 'Провокация' },
  { id: 'super', label: 'Супер', detail: 'Тратит шкалу энергии' },
  { id: 'ultimate', label: 'Ультимейт', detail: 'Только на низком HP' },
];

interface ControlState {
  readonly bindings: KeyBindings;
  readonly editing: ControlId | null;
  readonly hydrate: () => void;
  readonly reset: () => void;
  readonly startEditing: (id: ControlId | null) => void;
  readonly setKey: (id: ControlId, code: string) => void;
}

const STORAGE_KEY = 'cc-key-bindings-v1';

export const useControlStore = create<ControlState>((set) => ({
  bindings: cloneBindings(DEFAULT_BINDINGS),
  editing: null,
  hydrate: () => {
    const saved = readSavedBindings();
    if (saved !== null) set({ bindings: saved });
  },
  reset: () => {
    const bindings = cloneBindings(DEFAULT_BINDINGS);
    saveBindings(bindings);
    set({ bindings, editing: null });
  },
  startEditing: (editing) => set({ editing }),
  setKey: (id, code) =>
    set((state) => {
      const previousCode = bindingCode(state.bindings, id);
      const collision = CONTROL_ROWS.find(
        (row) => row.id !== id && bindingCode(state.bindings, row.id) === code,
      );
      let bindings = cloneBindings(state.bindings);
      if (collision !== undefined) {
        bindings = withBinding(bindings, collision.id, previousCode);
      }
      bindings = withBinding(bindings, id, code);
      saveBindings(bindings);
      return { bindings, editing: null };
    }),
}));

export function bindingCode(bindings: KeyBindings, id: ControlId): string {
  if (id === 'up' || id === 'down' || id === 'left' || id === 'right') {
    return bindings[id];
  }
  return bindings.buttons[id];
}

export function keyLabel(code: string): string {
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Numpad')) return `Num ${code.slice(6)}`;
  const named: Readonly<Record<string, string>> = {
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
    Space: 'Space',
    ShiftLeft: 'Shift',
    ShiftRight: 'R Shift',
    ControlLeft: 'Ctrl',
    ControlRight: 'R Ctrl',
    AltLeft: 'Alt',
    AltRight: 'R Alt',
  };
  return named[code] ?? code;
}

function withBinding(
  bindings: KeyBindings,
  id: ControlId,
  code: string,
): KeyBindings {
  if (id === 'up' || id === 'down' || id === 'left' || id === 'right') {
    return { ...bindings, [id]: code };
  }
  return { ...bindings, buttons: { ...bindings.buttons, [id]: code } };
}

function cloneBindings(bindings: KeyBindings): KeyBindings {
  return { ...bindings, buttons: { ...bindings.buttons } };
}

function saveBindings(bindings: KeyBindings): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bindings));
  }
}

function readSavedBindings(): KeyBindings | null {
  if (typeof window === 'undefined') return null;
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null');
    const migrated = migrateKeyBindings(value);
    if (migrated === null) return null;
    saveBindings(migrated);
    return cloneBindings(migrated);
  } catch {
    return null;
  }
}
