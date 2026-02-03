import { useEffect, useRef, useCallback } from 'react';
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
  const menuRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Prevent body scroll when menu is open (iOS Safari compatible)
  useEffect(() => {
    if (isOpen) {
      disableBodyScroll(document.body);
      // Focus the close button when menu opens
      closeButtonRef.current?.focus();
    } else {
      enableBodyScroll(document.body);
    }
    return () => clearAllBodyScrollLocks();
  }, [isOpen]);

  // Handle Escape key to close menu
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Manual focus trap
  const handleKeyDownTrap = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !menuRef.current) return;

    const focusableElements = menuRef.current.querySelectorAll<HTMLElement>(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement?.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
  }, []);

  if (!isOpen) return null;

  const handleNavClick = (e: React.MouseEvent, item: NavItem) => {
    if (item.isExternal) return; // Let external links work normally
    e.preventDefault();
    // Close menu first to unlock body scroll, then navigate
    // Small delay ensures scroll lock is fully released before navigation
    onClose();
    requestAnimationFrame(() => {
      onNavigate(item.page);
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <nav
        ref={menuRef}
        className={styles.menu}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDownTrap}
        aria-label="Mobile navigation"
        role="dialog"
        aria-modal="true"
      >
        <button
          ref={closeButtonRef}
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
  );
}
