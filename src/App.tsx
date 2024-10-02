import { useRef } from "react";
import { config, to, useScroll, useTrail } from "@react-spring/web";
import { IParallax, Parallax, ParallaxLayer } from "@react-spring/parallax";
import WavyBackground from "./components/WavyBackground";
import { random } from "lodash";
import { useWindowSize } from "usehooks-ts";

import "./App.css";
import Header from "./components/Header/Header";

const numWaves = 5;

function App() {
    const parallaxRef = useRef<IParallax>(null);

    const { height } = useWindowSize();
    const { scrollY } = useScroll({
        container: parallaxRef?.current?.container,
    });
    const waveConfigs = useTrail(numWaves, {
        from: { opacity: 0.3, transform: "scale(0)" },
        to: { opacity: 0.7, transform: "scale(1)" },
        config: config.wobbly,
    });

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
                        const amplitudeNoise = random(-20, 20); // Add amplitude noise
                        const speedNoise = random(-0.005, 0.005); // Add speed noise
                        const pointsNoise = random(-1, 1); // Add points noise

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
                <Parallax pages={1} ref={parallaxRef}>
                    <ParallaxLayer
                        offset={0}
                        speed={0.5}
                        style={{ ...alignCenter, justifyContent: "center" }}
                    >
                        <div className="splash-container">
                            <div className="splash">
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
                                {/* <Quotes /> */}
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
                            </div>
                        </div>
                        {/* <div>
                            <a href="https://puffpuff.dev" target="_blank">
                                <img
                                    src={viteLogo}
                                    // className="logo"
                                    className="logo react"
                                    alt="Vite logo"
                                />
                            </a>
                        </div>
                        <h1>Puff Puff Dev</h1>
                        <div className="card">
                            <button
                                onClick={() => setCount((count) => count + 1)}
                            >
                                count is {count}
                            </button>
                        </div> */}
                    </ParallaxLayer>
                    <ParallaxLayer
                        offset={1}
                        speed={0.5}
                        style={{ ...alignCenter, justifyContent: "center" }}
                    ></ParallaxLayer>
                </Parallax>
            </div>
        </>
    );
}

export default App;
