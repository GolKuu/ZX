import { Link } from 'wouter';

type MenuOptionProps = {
  title: string;
  description: string;
  icon: string;
  href?: string;
  primary?: boolean;
};

export function MenuOption({ title, description, icon, href, primary }: MenuOptionProps) {
  const className = primary ? 'menu-option menu-option--primary' : 'menu-option';
  const content = (
    <>
      <span className="menu-option__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="menu-option__copy">
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      {href ? (
        <span className="menu-option__arrow" aria-hidden="true">
          →
        </span>
      ) : (
        <span className="status-badge">В разработке</span>
      )}
    </>
  );

  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <button className={`${className} menu-option--disabled`} type="button" disabled>
      {content}
    </button>
  );
}
