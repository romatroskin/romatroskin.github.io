import { useRef, useMemo, useState, useEffect } from "react";
import { config, to, useScroll, useTrail } from "@react-spring/web";
import { IParallax, Parallax, ParallaxLayer } from "@react-spring/parallax";
import WavyBackground from "./components/WavyBackground";
import { useWindowSize } from "usehooks-ts";

import "./App.css";
import Header from "./components/Header/Header";

const numWaves = 5;

function randomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

function App() {
    const parallaxRef = useRef<IParallax>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const [, forceUpdate] = useState(0);

    // Get scroll container from Parallax after mount
    useEffect(() => {
        // Use requestAnimationFrame to ensure Parallax has fully mounted
        const raf = requestAnimationFrame(() => {
            if (parallaxRef.current?.container?.current && !scrollContainerRef.current) {
                scrollContainerRef.current = parallaxRef.current.container.current;
                forceUpdate(n => n + 1); // Trigger re-render to update useScroll
            }
        });
        return () => cancelAnimationFrame(raf);
    });

    const { height } = useWindowSize();
    const { scrollY } = useScroll({
        container: scrollContainerRef.current ? { current: scrollContainerRef.current } as React.MutableRefObject<HTMLDivElement> : undefined,
    });
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
    }, []); // Empty deps - compute once on mount

    const alignCenter = { display: "flex", alignItems: "center" };

    return (
        <>
            <Header />
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
                <div>
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
                                    height: to(
                                        [scrollY],
                                        [0, height],
                                        [
                                            height / 2 + index * 100,
                                            height - index * 10,
                                        ],
                                        "clamp"
                                    ),

                                    amplitude: scrollY.to({
                                        range: [0, height],
                                        output: [
                                            100 + index * amplitudeNoise,
                                            200 + index * amplitudeNoise,
                                        ],
                                        extrapolate: "clamp",
                                    }),
                                    speed: scrollY.to<number>(
                                        [0, height],
                                        [
                                            0.05 + index * speedNoise,
                                            0.1 + index * speedNoise,
                                        ],
                                        "clamp"
                                    ),
                                    points: 4 + index + pointsNoise,
                                    paused: false,
                                }}
                                style={{
                                    transform: scrollY
                                        .to(
                                            [0, height],
                                            [0, (index + 1) * 0.1],
                                            "clamp"
                                        )
                                        .to((value) => `scaleY(${1 + value})`),
                                }}
                                fill={scrollY.to<string>(
                                    [0, height],
                                    ["hsl(240, 56%, 30%)", "hsl(240, 30%, 25%)"]
                                )}
                            />
                        );
                    })}
                </div>
                <Parallax pages={2} ref={parallaxRef}>
                    <ParallaxLayer
                        offset={0}
                        speed={0.5}
                        style={{ ...alignCenter, justifyContent: "center" }}
                    >
                        <div className="splash-container">
                            <section className="splash">
                                <a href="#" target="_blank" rel="noreferrer">
                                    <img
                                        src="https://raw.githubusercontent.com/PuffPuffDev/puff_puff_brand/main/logos/logo_white.svg"
                                        className="logo"
                                        alt="Puff Puff logo"
                                    />
                                </a>
                                <h1 className="splash-head">
                                    Where Code Meets Creativity,
                                    <br /> Dreams Take Shape.
                                </h1>
                                <p className="splash-subhead">
                                    Welcome to the Craft Applications Workshop
                                    <br /> Are you seeking to bring your mobile
                                    application idea to life with seamless
                                    precision and stunning user experiences?
                                    <br /> Look no further than Puff Puff Dev,
                                    your dedicated partner in crafting
                                    exceptional mobile applications using the
                                    latest Flutter technologies.
                                </p>
                            </section>
                        </div>
                    </ParallaxLayer>
                    <ParallaxLayer
                        offset={1}
                        speed={0.5}
                        style={{ ...alignCenter, justifyContent: "center" }}
                    >
                        <div className="about-container">
                            <section className="about-section">
                                <h2 className="about-title">About Us</h2>
                                <p className="about-description">
                                    At Puff Puff Dev, we are dedicated to
                                    crafting exceptional mobile applications
                                    that bring your ideas to life. With a team
                                    of experienced developers and designers, we
                                    leverage the latest technologies, primarily
                                    focusing on Flutter and Dart, to deliver
                                    seamless user experiences and innovative
                                    solutions.
                                </p>
                                <p className="about-description">
                                    Our mission is to transform your dreams into
                                    reality through creative coding, attention
                                    to detail, and a commitment to quality.
                                    Whether you're a startup looking to build
                                    your first app or an established business
                                    seeking to enhance your digital presence, we
                                    are here to help you every step of the way.
                                </p>
                                <p className="about-description">
                                    Join us on this exciting journey as we
                                    explore the endless possibilities of mobile
                                    development together!
                                </p>
                            </section>
                        </div>
                    </ParallaxLayer>
                </Parallax>
            </div>
        </>
    );
}

export default App;
