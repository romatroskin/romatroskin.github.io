import { useRef, useMemo, useState, useEffect, useCallback, lazy, Suspense } from "react";
import { config, useTrail, useSpring } from "@react-spring/web";
import { IParallax, Parallax, ParallaxLayer } from "@react-spring/parallax";
import WavyBackground from "./components/WavyBackground";
import { useWindowSize } from "usehooks-ts";

import "./App.css";
import Header from "./components/Header/Header";
import { SkipLink } from "./components/SkipLink/SkipLink";
import { ThemeToggle } from "./components/ThemeToggle/ThemeToggle";
import { useTheme } from "./hooks/useTheme";
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import { useAdaptiveFrameRate } from './hooks/useAdaptiveFrameRate';
import { PerformanceIndicator } from './components/PerformanceIndicator';
import { ErrorBoundary, WaveAnimationFallback, AppFallback } from './components/ErrorBoundary';

// Lazy load below-fold sections (pages 2-3)
const ServicesSection = lazy(() => import('./sections/ServicesSection'));
const AboutSection = lazy(() => import('./sections/AboutSection'));

const TOTAL_PAGES = 3;

function randomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

function SectionLoader() {
    return (
        <div className="section-loader content-card" aria-busy="true" aria-label="Loading section">
            <div className="loader-text">Loading...</div>
        </div>
    );
}

function App() {
    const parallaxRef = useRef<IParallax>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [scrollProgress, setScrollProgress] = useState(0);
    const isNavigatingRef = useRef(false);
    const { theme } = useTheme();

    const { height } = useWindowSize();

    // Accessibility and performance hooks
    const prefersReducedMotion = usePrefersReducedMotion();
    const qualityLevel = useAdaptiveFrameRate(60);

    // Animation parameters based on performance and accessibility
    const animationParams = useMemo(() => {
        // Reduced motion: 10x slower animation, minimal movement
        if (prefersReducedMotion) {
            return {
                fps: 3,           // Very slow update rate
                speedMultiplier: 0.1,  // 10x slower speed
                numWaves: 3,      // Fewer waves for simplicity
                parallaxSpeedMultiplier: 0.1, // Almost static parallax
            };
        }

        // Adaptive based on detected frame rate
        switch (qualityLevel) {
            case 'low':
                return {
                    fps: 15,
                    speedMultiplier: 0.5,
                    numWaves: 3,
                    parallaxSpeedMultiplier: 0.5,
                };
            case 'medium':
                return {
                    fps: 24,
                    speedMultiplier: 0.75,
                    numWaves: 4,
                    parallaxSpeedMultiplier: 0.75,
                };
            case 'high':
            default:
                return {
                    fps: 30,
                    speedMultiplier: 1,
                    numWaves: 5,
                    parallaxSpeedMultiplier: 1,
                };
        }
    }, [prefersReducedMotion, qualityLevel]);

    // Track scroll position directly for immediate response
    useEffect(() => {
        const container = parallaxRef.current?.container?.current;
        if (!container) return;

        const handleScroll = () => {
            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight - container.clientHeight;
            const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

            setScrollProgress(progress);

            // Update current page for header
            const pageHeight = container.clientHeight;
            const newPage = Math.round(scrollTop / pageHeight);
            if (newPage >= 0 && newPage < TOTAL_PAGES) {
                setCurrentPage(newPage);
            }
        };

        container.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll(); // Initial call
        return () => container.removeEventListener("scroll", handleScroll);
    }, []);

    // Snap to page after scroll ends (only for manual scrolling, not programmatic navigation)
    useEffect(() => {
        const container = parallaxRef.current?.container?.current;
        if (!container) return;

        let snapTimeout: NodeJS.Timeout;

        const handleScrollEnd = () => {
            clearTimeout(snapTimeout);
            snapTimeout = setTimeout(() => {
                // Skip snap if we're in the middle of programmatic navigation
                if (isNavigatingRef.current) return;

                const pageHeight = container.clientHeight;
                const currentScroll = container.scrollTop;
                const nearestPage = Math.round(currentScroll / pageHeight);
                if (nearestPage >= 0 && nearestPage < TOTAL_PAGES) {
                    parallaxRef.current?.scrollTo(nearestPage);
                }
            }, 100);
        };

        container.addEventListener("scroll", handleScrollEnd, { passive: true });
        return () => {
            container.removeEventListener("scroll", handleScrollEnd);
            clearTimeout(snapTimeout);
        };
    }, []);

    // Smooth spring animation driven by scroll progress
    // Lower tension = more fluid, higher friction = less bounce
    const waveSpring = useSpring({
        progress: scrollProgress,
        config: {
            tension: 120,
            friction: 26,
            mass: 1,
            precision: 0.0001,
        },
    });

    const waveConfigs = useTrail(animationParams.numWaves, {
        from: { opacity: 0.3 },
        to: { opacity: 0.7 },
        config: config.gentle,
    });

    const waveNoiseOffsets = useMemo(() => {
        return Array.from({ length: animationParams.numWaves }, () => ({
            amplitude: randomRange(-15, 15),
            speed: randomRange(-0.003, 0.003),
            points: randomRange(-0.5, 0.5),
        }));
    }, [animationParams.numWaves]);

    const scrollToPage = useCallback((page: number) => {
        // Disable snap-to-page during programmatic navigation
        isNavigatingRef.current = true;
        parallaxRef.current?.scrollTo(page);
        // Re-enable snap after animation completes (react-spring default ~500ms)
        setTimeout(() => {
            isNavigatingRef.current = false;
        }, 600);
    }, []);

    return (
        <ErrorBoundary FallbackComponent={AppFallback}>
            <SkipLink href="#main-content" />
            <Header onNavigate={scrollToPage} currentPage={currentPage}>
                <ThemeToggle />
            </Header>
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
                    zIndex: 1,
                }}
            >
                {/* Animated waves background - wrapped in error boundary for graceful fallback */}
                <ErrorBoundary
                    FallbackComponent={WaveAnimationFallback}
                    resetKeys={[theme, qualityLevel]}
                >
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

                            // Each wave has different parallax depth - back waves move less
                            const depth = (animationParams.numWaves - index) / animationParams.numWaves; // 1.0 for back, 0.2 for front
                            const parallaxMultiplier = 0.4 + depth * 0.6; // 0.4 to 1.0

                            return (
                                <WavyBackground
                                    key={index}
                                    options={{
                                        height: waveSpring.progress.to(
                                            (p) => height * (0.35 + p * 0.35) + index * 50 * parallaxMultiplier
                                        ),
                                        amplitude: waveSpring.progress.to(
                                            (p) => 50 + p * 50 * parallaxMultiplier + amplitudeNoise
                                        ),
                                        speed: waveSpring.progress.to(
                                            (p) => (0.015 + p * 0.03 * parallaxMultiplier + speedNoise) * animationParams.speedMultiplier
                                        ),
                                        points: 5 + index + pointsNoise,
                                        paused: false,
                                        fps: animationParams.fps,
                                    }}
                                    style={{
                                        transform: waveSpring.progress.to(
                                            (p) => {
                                                // Back waves move more slowly (parallax effect)
                                                const yOffset = p * (index + 1) * -25 * parallaxMultiplier;
                                                const scale = 1 + p * 0.08 * (index + 1);
                                                return `translateY(${yOffset}px) scaleY(${scale})`;
                                            }
                                        ),
                                        opacity: springProps.opacity,
                                    }}
                                    fill={waveSpring.progress.to(
                                        (p) => {
                                            // Theme-aware wave colors
                                            const hue = 235 - index * 10 - p * 25;
                                            const sat = theme === 'light' ? 40 - index * 3 : 60 - index * 4;
                                            // Light theme: lighter waves (70-85%), Dark theme: darker waves (20-35%)
                                            const light = theme === 'light'
                                                ? 85 - index * 3 - p * 5
                                                : 30 - index * 4 - p * 8;
                                            return `hsl(${hue}, ${sat}%, ${light}%)`;
                                        }
                                    )}
                                />
                            );
                        })}
                    </div>
                </ErrorBoundary>

                {/* Parallax content */}
                <main id="main-content" role="main">
                    <Parallax pages={TOTAL_PAGES} ref={parallaxRef}>
                        {/* Page 1: Hero - Logo and tagline */}
                        <ParallaxLayer
                            offset={0}
                            speed={0.2 * animationParams.parallaxSpeedMultiplier}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <section id="hero-section" aria-labelledby="hero-heading">
                                <div className="hero-container content-card">
                                    <a href="#" target="_blank" rel="noreferrer">
                                        <img
                                            src="https://raw.githubusercontent.com/PuffPuffDev/puff_puff_brand/main/logos/logo_white.svg"
                                            srcSet="
                                                https://raw.githubusercontent.com/PuffPuffDev/puff_puff_brand/main/logos/logo_white.svg 1x,
                                                https://raw.githubusercontent.com/PuffPuffDev/puff_puff_brand/main/logos/logo_white.svg 2x
                                            "
                                            className="logo"
                                            alt="Puff Puff logo"
                                            width="200"
                                            height="200"
                                        />
                                    </a>
                                    <h1 id="hero-heading" className="hero-title">
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
                            </section>
                        </ParallaxLayer>

                        {/* Page 2: Introduction */}
                        <ParallaxLayer
                            offset={1}
                            speed={0.3 * animationParams.parallaxSpeedMultiplier}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Suspense fallback={<SectionLoader />}>
                                <ServicesSection onNavigate={scrollToPage} />
                            </Suspense>
                        </ParallaxLayer>

                        {/* Page 3: About */}
                        <ParallaxLayer
                            offset={2}
                            speed={0.4 * animationParams.parallaxSpeedMultiplier}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Suspense fallback={<SectionLoader />}>
                                <AboutSection />
                            </Suspense>
                        </ParallaxLayer>
                    </Parallax>
                </main>
            </div>
            <PerformanceIndicator
                qualityLevel={qualityLevel}
                prefersReducedMotion={prefersReducedMotion}
            />
        </ErrorBoundary>
    );
}

export default App;
