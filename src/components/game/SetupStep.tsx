import type { ReactNode } from 'react';

export function SetupStep({
  number,
  title,
  description,
  children,
}: {
  number: number;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="setup-step">
      <header>
        <span>{number}</span>
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
      </header>
      <div className="setup-step__content">{children}</div>
    </section>
  );
}
