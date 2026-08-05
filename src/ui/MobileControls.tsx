'use client';

import { useEffect } from 'react';
import {
  MobileInputController,
  type MobileControl,
} from '@/src/input/mobile-controller';
import { useHudStore } from '@/src/store/hudStore';
import styles from './CombatHud.module.css';

const mobileController = new MobileInputController();

interface ControlButton {
  readonly control: MobileControl;
  readonly label: string;
  readonly ariaLabel: string;
  readonly tone?: 'utility' | 'power';
}

const movementControls: readonly ControlButton[] = [
  { control: 'up', label: 'W', ariaLabel: 'Прыжок' },
  { control: 'left', label: 'A', ariaLabel: 'Движение влево' },
  { control: 'down', label: 'S', ariaLabel: 'Присесть' },
  { control: 'right', label: 'D', ariaLabel: 'Движение вправо' },
];

const combatControls: readonly ControlButton[] = [
  { control: 'lp', label: 'ПР', ariaLabel: 'Удар передней рукой' },
  { control: 'lk', label: 'ЗР', ariaLabel: 'Удар задней рукой' },
  { control: 'hp', label: 'ПН', ariaLabel: 'Удар передней ногой' },
  { control: 'hk', label: 'ЗН', ariaLabel: 'Удар задней ногой' },
  { control: 'block', label: 'БЛК', ariaLabel: 'Блок', tone: 'utility' },
  { control: 'dash', label: 'РЫВ', ariaLabel: 'Рывок', tone: 'utility' },
  { control: 'taunt', label: 'Т', ariaLabel: 'Насмешка', tone: 'utility' },
  { control: 'super', label: 'SUP', ariaLabel: 'Супер', tone: 'power' },
  { control: 'ultimate', label: 'ULT', ariaLabel: 'Ультимейт', tone: 'power' },
];

const mimControls: readonly ControlButton[] = [
  { control: 'mimQ', label: 'Q', ariaLabel: 'Приём MIM Q', tone: 'utility' },
  { control: 'mimE', label: 'E', ariaLabel: 'Приём MIM E', tone: 'utility' },
  { control: 'mimR', label: 'R', ariaLabel: 'Приём MIM R', tone: 'utility' },
  { control: 'mimF', label: 'F', ariaLabel: 'Приём MIM F', tone: 'utility' },
];

export function MobileControls({ visible }: { readonly visible: boolean }) {
  const isMim = useHudStore((state) => state.fighterSelection[0] === 'mim');

  useEffect(() => {
    const release = () => mobileController.releaseAll();
    window.addEventListener('blur', release);
    document.addEventListener('visibilitychange', release);
    return () => {
      window.removeEventListener('blur', release);
      document.removeEventListener('visibilitychange', release);
      release();
    };
  }, []);

  useEffect(() => {
    if (!visible) mobileController.releaseAll();
  }, [visible]);

  return (
    <section
      aria-label="Сенсорное управление боем"
      className={styles.mobileControls}
      data-visible={visible}
    >
      <div className={styles.movementPad} aria-label="Крестовина движения">
        {movementControls.map((button) => (
          <MobileButton key={button.control} {...button} />
        ))}
        <span className={styles.movementPadCenter} aria-hidden="true" />
      </div>
      <div className={styles.combatPad}>
        {isMim && (
          <div className={styles.characterPad} aria-label="Особые приёмы MIM">
            {mimControls.map((button) => (
              <MobileButton key={button.control} {...button} />
            ))}
          </div>
        )}
        <div className={styles.attackPad}>
          {combatControls.map((button) => (
            <MobileButton key={button.control} {...button} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function readMobileControls(): ReadonlySet<MobileControl> {
  return mobileController.read();
}

export function resetMobileInput(): void {
  mobileController.releaseAll();
}

function MobileButton({ control, label, ariaLabel, tone }: ControlButton) {
  const release = (event: React.PointerEvent<HTMLButtonElement>): void => {
    mobileController.release(event.pointerId);
    delete event.currentTarget.dataset.pressed;
  };

  return (
    <button
      aria-label={ariaLabel}
      className={styles.mobileButton}
      data-control={control}
      data-tone={tone}
      type="button"
      onContextMenu={(event) => event.preventDefault()}
      onPointerCancel={release}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.dataset.pressed = 'true';
        mobileController.press(event.pointerId, control);
      }}
      onPointerUp={release}
    >
      {label}
    </button>
  );
}
