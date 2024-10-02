import { animated } from "react-spring";
import "./header.css";

// function rem(rem: number) {
//     return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
// }

function Header() {
    // const pinned = useHeadroom({ fixedAt: 120 });
    return (
        <animated.div
            className="header"
            style={{
                // transform: `translate3d(0, ${pinned ? 0 : -rem(110)},})`,
                transition: "transform 400ms ease",
                // position: pinned ? 'fixed' : 'absolute',
            }}
        >
            <div className="home-menu pure-menu pure-menu-horizontal pure-menu-fixed">
                <a href="#" className="puff-puff-logo pure-menu-heading" />
                <ul className="pure-menu-list">
                    <li className="pure-menu-item pure-menu-selected">
                        <a href="#" className="pure-menu-link">
                            Home
                        </a>
                    </li>
                    <li className="pure-menu-item">
                        <a href="#" className="pure-menu-link">
                            About
                        </a>
                    </li>
                    <li className="pure-menu-item">
                        <a href="#" className="pure-menu-link">
                            Services
                        </a>
                    </li>
                    <li className="pure-menu-item">
                        <a href="#" className="pure-menu-link">
                            Contact
                        </a>
                    </li>
                </ul>
            </div>
        </animated.div>
    );
}

Header.propTypes = {};

export default Header;
