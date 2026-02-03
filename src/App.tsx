import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { config, useSpring, useTrail } from "@react-spring/web";
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
    const [scrollProgress, setScrollProgress] = useState(0);

    const { height } = useWindowSize();

    // Track scroll position from Parallax container
    useEffect(() => {
        const container = parallaxRef.current?.container?.current;
        if (!container) return;

        const handleScroll = () => {
            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight - container.clientHeight;
            const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
            setScrollProgress(progress);
        };

        container.addEventListener("scroll", handleScroll, { passive: true });
        return () => container.removeEventListener("scroll", handleScroll);
    }, []);

    // Animated scroll value for wave effects
    const [{ scroll }] = useSpring(
        () => ({
            scroll: scrollProgress,
            config: { tension: 280, friction: 60 },
        }),
        [scrollProgress]
    );

    const waveConfigs = useTrail(numWaves, {
        from: { opacity: 0.3, transform: "scale(0)" },
        to: { opacity: 0.7, transform: "scale(1)" },
        config: config.wobbly,
    });

    const waveNoiseOffsets = useMemo(() => {
        return Array.from({ length: numWaves }, () => ({
            amplitude: randomRange(-20, 20),
            speed: randomRange(-0.005, 0.005),
            points: randomRange(-1, 1),
        }));
    }, []);

    const scrollToPage = useCallback((page: number) => {
        parallaxRef.current?.scrollTo(page);
    }, []);

    return (
        <>
            <Header onNavigate={scrollToPage} />
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
                    {waveConfigs.map((_, index) => {
                        const {
                            amplitude: amplitudeNoise,
                            speed: speedNoise,
                            points: pointsNoise,
                        } = waveNoiseOffsets[index];

                        return (
                            <WavyBackground
                                key={index}
                                options={{
                                    height: scroll.to(
                                        [0, 1],
                                        [
                                            height / 2 + index * 80,
                                            height - index * 20,
                                        ]
                                    ),
                                    amplitude: scroll.to(
                                        [0, 1],
                                        [
                                            80 + index * amplitudeNoise,
                                            150 + index * amplitudeNoise,
                                        ]
                                    ),
                                    speed: scroll.to(
                                        [0, 1],
                                        [
                                            0.03 + index * speedNoise,
                                            0.08 + index * speedNoise,
                                        ]
                                    ),
                                    points: 4 + index + pointsNoise,
                                    paused: false,
                                }}
                                style={{
                                    transform: scroll.to(
                                        [0, 1],
                                        [1, 1 + (index + 1) * 0.05]
                                    ).to((v) => `scaleY(${v})`),
                                }}
                                fill={scroll.to(
                                    [0, 0.5, 1],
                                    [
                                        `hsl(${240 - index * 5}, 56%, ${30 - index * 2}%)`,
                                        `hsl(${250 - index * 5}, 50%, ${25 - index * 2}%)`,
                                        `hsl(${260 - index * 5}, 45%, ${20 - index * 2}%)`,
                                    ]
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
                        speed={0.2}
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
                        speed={0.3}
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
                        speed={0.4}
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
