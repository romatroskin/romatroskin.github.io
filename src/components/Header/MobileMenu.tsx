import { useEffect } from 'react';
import FocusTrap from 'focus-trap-react';
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import styles from './MobileMenu.module.css';

interface NavItem {
  label: string;
  page: number;
  isExternal?: boolean;
  href?: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  onNavigate: (page: number) => void;
  currentPage: number;
}

export function MobileMenu({ isOpen, onClose, navItems, onNavigate, currentPage }: MobileMenuProps) {
  // Prevent body scroll when menu is open (iOS Safari compatible)
  useEffect(() => {
    if (isOpen) {
      disableBodyScroll(document.body);
    } else {
      enableBodyScroll(document.body);
    }
    return () => clearAllBodyScrollLocks();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNavClick = (e: React.MouseEvent, item: NavItem) => {
    if (item.isExternal) return; // Let external links work normally
    e.preventDefault();
    onNavigate(item.page);
    onClose();
  };

  return (
    <FocusTrap
      focusTrapOptions={{
        escapeDeactivates: true,
        clickOutsideDeactivates: true,
        onDeactivate: onClose,
        initialFocus: '#mobile-menu-close',
        returnFocusOnDeactivate: true,
      }}
    >
      <div className={styles.overlay} onClick={onClose} aria-hidden="true">
        <nav
          className={styles.menu}
          onClick={(e) => e.stopPropagation()}
          aria-label="Mobile navigation"
          role="dialog"
          aria-modal="true"
        >
          <button
            id="mobile-menu-close"
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close menu"
          >
            <span aria-hidden="true">&times;</span>
          </button>

          <ul className={styles.navList}>
            {navItems.map((item) => (
              <li key={item.label} className={styles.navItem}>
                {item.isExternal ? (
                  <a
                    href={item.href}
                    className={styles.navLink}
                    onClick={onClose}
                  >
                    {item.label}
                  </a>
                ) : (
                  <a
                    href="#"
                    className={`${styles.navLink} ${currentPage === item.page ? styles.navLinkActive : ''}`}
                    onClick={(e) => handleNavClick(e, item)}
                    aria-current={currentPage === item.page ? 'page' : undefined}
                  >
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </FocusTrap>
  );
}
