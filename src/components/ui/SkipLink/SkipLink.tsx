import styles from './SkipLink.module.css';

interface SkipLinkProps {
  href: string;
  children?: React.ReactNode;
}

export function SkipLink({ href, children = 'Skip to main content' }: SkipLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      // Make target focusable temporarily
      target.setAttribute('tabindex', '-1');
      (target as HTMLElement).focus();
      // Remove tabindex after focus to avoid polluting tab order
      target.removeAttribute('tabindex');
    }
  };

  return (
    <a href={href} onClick={handleClick} className={styles.skipLink}>
      {children}
    </a>
  );
}
