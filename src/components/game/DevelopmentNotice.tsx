export function DevelopmentNotice({ children }: { children: string }) {
  return (
    <section className="development-notice">
      <span aria-hidden="true">🛠️</span>
      <div>
        <strong>В разработке</strong>
        <p>{children}</p>
      </div>
    </section>
  );
}
