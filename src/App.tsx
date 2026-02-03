import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { config, useTrail, useSpring } from "@react-spring/web";
import { IParallax, Parallax, ParallaxLayer } from "@react-spring/parallax";
import WavyBackground from "./components/WavyBackground";
import { useWindowSize } from "usehooks-ts";

import "./App.css";
import Header from "./components/Header/Header";

const numWaves = 5;
const TOTAL_PAGES = 3;

function randomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

function App() {
    const parallaxRef = useRef<IParallax>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [scrollY, setScrollY] = useState(0);

    const { height } = useWindowSize();

    // Track scroll position directly (no spring delay for immediate response)
    useEffect(() => {
        const container = parallaxRef.current?.container?.current;
        if (!container) return;

        const handleScroll = () => {
            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight - container.clientHeight;
            const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

            setScrollY(progress);

            // Update current page for header highlighting
            const pageHeight = container.clientHeight;
            const newPage = Math.round(scrollTop / pageHeight);
            if (newPage >= 0 && newPage < TOTAL_PAGES) {
                setCurrentPage(newPage);
            }
        };

        // Initial measurement
        handleScroll();

        container.addEventListener("scroll", handleScroll, { passive: true });
        return () => container.removeEventListener("scroll", handleScroll);
    }, []);

    // Smooth spring for wave properties (separate from scroll tracking)
    const waveSpring = useSpring({
        progress: scrollY,
        config: { mass: 0.5, tension: 120, friction: 14 },
    });

    const waveConfigs = useTrail(numWaves, {
        from: { opacity: 0.3 },
        to: { opacity: 0.7 },
        config: config.gentle,
    });

    const waveNoiseOffsets = useMemo(() => {
        return Array.from({ length: numWaves }, () => ({
            amplitude: randomRange(-15, 15),
            speed: randomRange(-0.003, 0.003),
            points: randomRange(-0.5, 0.5),
        }));
    }, []);

    const scrollToPage = useCallback((page: number) => {
        parallaxRef.current?.scrollTo(page);
    }, []);

    // Handle scroll end for snap effect
    useEffect(() => {
        const container = parallaxRef.current?.container?.current;
        if (!container) return;

        let scrollTimeout: NodeJS.Timeout;

        const handleScrollEnd = () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                // Snap to nearest page
                const pageHeight = container.clientHeight;
                const currentScroll = container.scrollTop;
                const nearestPage = Math.round(currentScroll / pageHeight);

                if (nearestPage >= 0 && nearestPage < TOTAL_PAGES) {
                    parallaxRef.current?.scrollTo(nearestPage);
                }
            }, 150); // Snap after 150ms of no scrolling
        };

        container.addEventListener("scroll", handleScrollEnd, { passive: true });
        return () => {
            container.removeEventListener("scroll", handleScrollEnd);
            clearTimeout(scrollTimeout);
        };
    }, []);

    return (
        <>
            <Header onNavigate={scrollToPage} currentPage={currentPage} />
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    right: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                }}
            >
                {/* Animated waves background */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 0,
                        pointerEvents: "none",
                    }}
                >
                    {waveConfigs.map((springProps, index) => {
                        const {
                            amplitude: amplitudeNoise,
                            speed: speedNoise,
                            points: pointsNoise,
                        } = waveNoiseOffsets[index];

                        // Each wave has different parallax depth
                        const parallaxFactor = 1 - index * 0.15;

                        return (
                            <WavyBackground
                                key={index}
                                options={{
                                    height: waveSpring.progress.to(
                                        (p) => height * (0.4 + p * 0.3) + index * 60 * parallaxFactor
                                    ),
                                    amplitude: waveSpring.progress.to(
                                        (p) => 60 + p * 40 + amplitudeNoise * parallaxFactor
                                    ),
                                    speed: waveSpring.progress.to(
                                        (p) => 0.02 + p * 0.04 + speedNoise
                                    ),
                                    points: 5 + index + pointsNoise,
                                    paused: false,
                                }}
                                style={{
                                    transform: waveSpring.progress.to(
                                        (p) => `translateY(${p * index * -20}px) scaleY(${1 + p * 0.1 * (index + 1)})`
                                    ),
                                    opacity: springProps.opacity,
                                }}
                                fill={waveSpring.progress.to(
                                    (p) => {
                                        const hue = 240 - index * 8 - p * 20;
                                        const sat = 55 - index * 3;
                                        const light = 28 - index * 3 - p * 5;
                                        return `hsl(${hue}, ${sat}%, ${light}%)`;
                                    }
                                )}
                            />
                        );
                    })}
                </div>

                {/* Parallax content */}
                <Parallax pages={TOTAL_PAGES} ref={parallaxRef}>
                    {/* Page 1: Hero - Logo and tagline */}
                    <ParallaxLayer
                        offset={0}
                        speed={0.1}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <div className="hero-container">
                            <a href="#" target="_blank" rel="noreferrer">
                                <img
                                    src="https://raw.githubusercontent.com/PuffPuffDev/puff_puff_brand/main/logos/logo_white.svg"
                                    className="logo"
                                    alt="Puff Puff logo"
                                />
                            </a>
                            <h1 className="hero-title">
                                Where Code Meets Creativity,
                                <br />
                                <span className="hero-highlight">Dreams Take Shape.</span>
                            </h1>
                            <button
                                className="scroll-indicator"
                                onClick={() => scrollToPage(1)}
                                aria-label="Scroll to next section"
                            >
                                <span className="scroll-arrow">↓</span>
                                <span className="scroll-text">Discover More</span>
                            </button>
                        </div>
                    </ParallaxLayer>

                    {/* Page 2: Introduction */}
                    <ParallaxLayer
                        offset={1}
                        speed={0.2}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <div className="intro-container">
                            <h2 className="section-title">Craft Applications Workshop</h2>
                            <p className="intro-text">
                                Are you seeking to bring your mobile application idea to life
                                with seamless precision and stunning user experiences?
                            </p>
                            <p className="intro-text">
                                Look no further than <strong>Puff Puff Dev</strong>, your
                                dedicated partner in crafting exceptional mobile applications
                                using the latest Flutter technologies.
                            </p>
                            <div className="cta-buttons">
                                <button
                                    className="cta-primary"
                                    onClick={() => scrollToPage(2)}
                                >
                                    Learn More About Us
                                </button>
                            </div>
                        </div>
                    </ParallaxLayer>

                    {/* Page 3: About */}
                    <ParallaxLayer
                        offset={2}
                        speed={0.3}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <div className="about-container">
                            <h2 className="section-title">About Us</h2>
                            <div className="about-content">
                                <p className="about-text">
                                    At Puff Puff Dev, we are dedicated to crafting exceptional
                                    mobile applications that bring your ideas to life. With a
                                    team of experienced developers and designers, we leverage
                                    the latest technologies, primarily focusing on Flutter and
                                    Dart, to deliver seamless user experiences and innovative
                                    solutions.
                                </p>
                                <p className="about-text">
                                    Our mission is to transform your dreams into reality
                                    through creative coding, attention to detail, and a
                                    commitment to quality. Whether you're a startup looking to
                                    build your first app or an established business seeking to
                                    enhance your digital presence, we are here to help you
                                    every step of the way.
                                </p>
                                <p className="about-text highlight">
                                    Join us on this exciting journey as we explore the endless
                                    possibilities of mobile development together!
                                </p>
                            </div>
                        </div>
                    </ParallaxLayer>
                </Parallax>
            </div>
        </>
    );
}

export default App;
