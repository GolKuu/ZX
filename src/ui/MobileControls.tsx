'use client';

import { useEffect } from 'react';
import {
  MobileInputController,
  type MobileControl,
} from '@/src/input/mobile-controller';
import styles from './CombatHud.module.css';

const mobileController = new MobileInputController();

const leftControls: readonly ControlButton[] = [
  { control: 'back', label: '◀', ariaLabel: 'Move back' },
  { control: 'guard', label: 'G', ariaLabel: 'Guard' },
  { control: 'forward', label: '▶', ariaLabel: 'Move forward' },
];

const attackControls: readonly ControlButton[] = [
  { control: 'light', label: 'L', ariaLabel: 'Light attack' },
  { control: 'medium', label: 'M', ariaLabel: 'Medium attack' },
  { control: 'heavy', label: 'H', ariaLabel: 'Heavy attack' },
  { control: 'special', label: 'S', ariaLabel: 'Special attack' },
];

interface ControlButton {
  readonly control: MobileControl;
  readonly label: string;
  readonly ariaLabel: string;
}

interface MobileControlsProps {
  readonly forcedVisible: boolean;
}

export function MobileControls({ forcedVisible }: MobileControlsProps) {
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

  return (
    <section
      aria-label="Mobile combat controls"
      className={`${styles.mobileControls} ${
        forcedVisible ? styles.mobileControlsForced : ''
      }`}
    >
      <div className={styles.movementPad}>
        {leftControls.map((button) => (
          <MobileButton key={button.control} {...button} />
        ))}
      </div>
      <div className={styles.attackPad}>
        {attackControls.map((button) => (
          <MobileButton key={button.control} {...button} />
        ))}
      </div>
    </section>
  );
}

export function readMobileInput() {
  return mobileController.read();
}

export function resetMobileInput(): void {
  mobileController.releaseAll();
}

function MobileButton({ control, label, ariaLabel }: ControlButton) {
  const release = (
    event: React.PointerEvent<HTMLButtonElement>,
  ): void => {
    mobileController.release(event.pointerId);
    delete event.currentTarget.dataset.pressed;
  };

  return (
    <button
      aria-label={ariaLabel}
      className={styles.mobileButton}
      data-control={control}
      type="button"
      onContextMenu={(event) => event.preventDefault()}
      onPointerCancel={release}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.dataset.pressed = 'true';
        mobileController.press(event.pointerId, control);
      }}
      onPointerLeave={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          return;
        }
        release(event);
      }}
      onPointerUp={release}
    >
      <span>{label}</span>
      <small>{control}</small>
    </button>
  );
}
