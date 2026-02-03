import React, { useState, useRef, useEffect } from "react";
import { Interpolation } from "@react-spring/web";
import { useAnimationFrame } from "../hooks/useAnimationFrame";
import { usePerlinNoise } from "../hooks/usePerlinNoise";
import styles from "./waves.module.css";

interface WavesPropTypes {
    points: number;
    speed: number | Interpolation<number, number>;
    amplitude: number | Interpolation<number, number>;
    height: number | Interpolation<number, number>;
    paused: boolean;
    svgId?: string;
    svgPathId?: string;
}

type WaveProps = WavesPropTypes & React.SVGProps<SVGPathElement>;

interface Point {
    x: number;
    y: number;
}

/**
 * Wave component that renders animated SVG waves using Perlin noise.
 * Migrated from class component to functional component using custom hooks.
 */
const Wave = React.forwardRef<HTMLDivElement, WaveProps>(function Wave(
    props,
    ref
) {
    const {
        points = 3,
        speed = 0.1,
        amplitude = 10,
        height = 50,
        paused = false,
        svgId = "wave",
        svgPathId = "wave-path",
        style,
        fill,
        children,
        id,
        ...rest
    } = props;

    const [path, setPath] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const containerSize = useRef({ width: 0, height: 0 });

    // Stable Perlin noise instance
    const noise = usePerlinNoise();

    // Measure container on mount
    useEffect(() => {
        if (containerRef.current) {
            containerSize.current = {
                width: containerRef.current.offsetWidth,
                height: containerRef.current.offsetHeight,
            };
        }
    }, []);

    /**
     * Calculate wave points using Perlin noise.
     * Handles both raw numbers and Interpolation objects from react-spring.
     */
    const calculateWavePoints = (step: number): Point[] => {
        const scale = 100;
        const wavePoints: Point[] = [];
        const containerWidth = containerSize.current.width || 0;
        const pointStep = containerWidth / points;

        // Get actual values (handling Interpolation objects)
        const speedValue =
            typeof speed === "number" ? speed : speed.get();
        const heightValue =
            typeof height === "number" ? height : height.get();
        const amplitudeValue =
            typeof amplitude === "number" ? amplitude : amplitude.get();

        const stepFactor = (speedValue / scale) * pointStep;

        for (let i = 0; i <= points; i++) {
            const seed = step * i + stepFactor;
            const noiseValue = noise.perlin2(seed / scale, 1);
            const y = noiseValue * amplitudeValue + heightValue;
            wavePoints.push({ x: i * pointStep, y });
        }

        return wavePoints;
    };

    /**
     * Build SVG path string from wave points using cubic bezier curves.
     */
    const buildPath = (wavePoints: Point[]): string => {
        if (wavePoints.length < 2) return "";

        const containerWidth = containerSize.current.width;
        const containerHeight = containerSize.current.height;

        let svg = `M ${wavePoints[0].x} ${wavePoints[0].y}`;
        const initial = {
            x: (wavePoints[1].x - wavePoints[0].x) / 2,
            y:
                wavePoints[1].y -
                wavePoints[0].y +
                wavePoints[0].y +
                (wavePoints[1].y - wavePoints[0].y),
        };

        const cubic = (a: Point, b: Point) =>
            ` C ${a.x} ${a.y} ${a.x} ${a.y} ${b.x} ${b.y}`;

        svg += cubic(initial, wavePoints[1]);
        let point = initial;

        for (let i = 1; i < wavePoints.length - 1; i++) {
            point = {
                x: wavePoints[i].x - point.x + wavePoints[i].x,
                y: wavePoints[i].y - point.y + wavePoints[i].y,
            };
            svg += cubic(point, wavePoints[i + 1]);
        }

        svg += ` L ${containerWidth} ${containerHeight}`;
        svg += ` L 0 ${containerHeight} Z`;

        return svg;
    };

    // Animation loop using custom hook
    useAnimationFrame(
        (elapsed) => {
            const step = (elapsed * Math.PI) / 1000;
            const wavePoints = calculateWavePoints(step);
            const newPath = buildPath(wavePoints);
            setPath(newPath);
        },
        { fps: 30, paused }
    );

    return (
        <div
            id={id}
            ref={(node) => {
                // Handle both refs
                (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
                if (typeof ref === "function") {
                    ref(node);
                } else if (ref) {
                    (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
                }
            }}
            className={styles.hologramWave}
            style={{
                width: "100%",
                display: "inline-block",
                ...style,
            }}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                height="100%"
                version="1.1"
                id={svgId}
            >
                {children}
                <path
                    {...Object.assign(
                        {},
                        { d: path, fill, id: svgPathId },
                        rest
                    )}
                />
            </svg>
        </div>
    );
});

export default Wave;
export type { WaveProps, WavesPropTypes };
