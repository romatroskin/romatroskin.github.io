import { animated } from "react-spring";
import styles from "./Header.module.css";

interface HeaderProps {
    onNavigate?: (page: number) => void;
    currentPage?: number;
}

interface NavItem {
    label: string;
    page: number;
    isExternal?: boolean;
    href?: string;
}

const navItems: NavItem[] = [
    { label: "Home", page: 0 },
    { label: "Services", page: 1 },
    { label: "About", page: 2 },
    { label: "Contact", page: -1, isExternal: true, href: "mailto:contact@puffpuff.dev" },
];

function Header({ onNavigate, currentPage = 0 }: HeaderProps) {
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
                                >
                                    {item.label}
                                </a>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        </animated.header>
    );
}

export default Header;
