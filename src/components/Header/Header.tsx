import { useState } from 'react';
import { animated } from "react-spring";
import { MobileMenu } from './MobileMenu';
import styles from "./Header.module.css";

interface HeaderProps {
    onNavigate?: (page: number) => void;
    currentPage?: number;
    children?: React.ReactNode;
}

interface NavItem {
    label: string;
    page: number;
    isExternal?: boolean;
    href?: string;
}

export const navItems: NavItem[] = [
    { label: "Home", page: 0 },
    { label: "Services", page: 1 },
    { label: "About", page: 2 },
    { label: "Contact", page: -1, isExternal: true, href: "mailto:contact@puffpuff.dev" },
];

function Header({ onNavigate, currentPage = 0, children }: HeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleNavClick = (e: React.MouseEvent, page: number) => {
        e.preventDefault();
        onNavigate?.(page);
    };

    return (
        <animated.header className={styles.header}>
            <nav className={styles.menu}>
                <a
                    href="#"
                    className={styles.logo}
                    aria-label="Puff Puff Dev Home"
                    onClick={(e) => handleNavClick(e, 0)}
                />
                <ul className={styles.navList}>
                    {navItems.map((item) => (
                        <li key={item.label} className={styles.navItem}>
                            {item.isExternal ? (
                                <a href={item.href} className={styles.navLink}>
                                    {item.label}
                                </a>
                            ) : (
                                <a
                                    href="#"
                                    className={`${styles.navLink} ${currentPage === item.page ? styles.navLinkActive : ""}`}
                                    onClick={(e) => handleNavClick(e, item.page)}
                                    aria-current={currentPage === item.page ? 'page' : undefined}
                                >
                                    {item.label}
                                </a>
                            )}
                        </li>
                    ))}
                </ul>
                {children && (
                    <div className={styles.headerActions}>
                        {children}
                    </div>
                )}
                <button
                    className={styles.hamburger}
                    onClick={() => setIsMobileMenuOpen(true)}
                    aria-label="Open menu"
                    aria-expanded={isMobileMenuOpen}
                    aria-controls="mobile-menu"
                >
                    <span className={styles.hamburgerLine} aria-hidden="true" />
                    <span className={styles.hamburgerLine} aria-hidden="true" />
                    <span className={styles.hamburgerLine} aria-hidden="true" />
                </button>
            </nav>
            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                navItems={navItems}
                onNavigate={(page) => {
                    onNavigate?.(page);
                }}
                currentPage={currentPage}
            />
        </animated.header>
    );
}

export default Header;
