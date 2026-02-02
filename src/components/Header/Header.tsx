import { animated } from "react-spring";
import styles from "./Header.module.css";

function Header() {
    return (
        <animated.header className={styles.header}>
            <nav className={styles.menu}>
                <a href="#" className={styles.logo} aria-label="Puff Puff Dev Home" />
                <ul className={styles.navList}>
                    <li className={styles.navItem}>
                        <a href="#" className={`${styles.navLink} ${styles.navLinkActive}`}>
                            Home
                        </a>
                    </li>
                    <li className={styles.navItem}>
                        <a href="#" className={styles.navLink}>
                            About
                        </a>
                    </li>
                    <li className={styles.navItem}>
                        <a href="#" className={styles.navLink}>
                            Services
                        </a>
                    </li>
                    <li className={styles.navItem}>
                        <a href="#" className={styles.navLink}>
                            Contact
                        </a>
                    </li>
                </ul>
            </nav>
        </animated.header>
    );
}

export default Header;
