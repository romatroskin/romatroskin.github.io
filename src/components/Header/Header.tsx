import { animated } from "react-spring";
import styles from "./Header.module.css";

interface HeaderProps {
    onNavigate?: (page: number) => void;
}

function Header({ onNavigate }: HeaderProps) {
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
                    <li className={styles.navItem}>
                        <a
                            href="#"
                            className={`${styles.navLink} ${styles.navLinkActive}`}
                            onClick={(e) => handleNavClick(e, 0)}
                        >
                            Home
                        </a>
                    </li>
                    <li className={styles.navItem}>
                        <a
                            href="#"
                            className={styles.navLink}
                            onClick={(e) => handleNavClick(e, 1)}
                        >
                            Services
                        </a>
                    </li>
                    <li className={styles.navItem}>
                        <a
                            href="#"
                            className={styles.navLink}
                            onClick={(e) => handleNavClick(e, 2)}
                        >
                            About
                        </a>
                    </li>
                    <li className={styles.navItem}>
                        <a href="mailto:contact@puffpuff.dev" className={styles.navLink}>
                            Contact
                        </a>
                    </li>
                </ul>
            </nav>
        </animated.header>
    );
}

export default Header;
