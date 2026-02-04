import React, { useState, useRef, useEffect, useCallback } from "react";
import { Interpolation } from "@react-spring/web";
import { useAnimationFrame } from "@/hooks/useAnimationFrame";
import { usePerlinNoise } from "@/hooks/usePerlinNoise";
import styles from "./waves.module.css";

interface WavesPropTypes {
    points: number;
    speed: number | Interpolation<number, number>;
    amplitude: number | Interpolation<number, number>;
    height: number | Interpolation<number, number>;
    paused: boolean;
    fps?: number;
    svgId?: string;
    svgPathId?: string;
}

type WaveProps = WavesPropTypes & React.SVGProps<SVGPathElement>;

interface Point {
    x: number;
    y: number;
}

/**
 * Get the current value from either a raw number or an Interpolation object.
 * This must be called inside the animation loop to get the current animated value.
 */
function getAnimatedValue(value: number | Interpolation<number, number>): number {
    return typeof value === "number" ? value : value.get();
}

/**
 * Wave component that renders animated SVG waves using Perlin noise.
 * Migrated from class component to functional component using custom hooks.
 *
 * Key implementation notes:
 * - Props like speed, height, amplitude can be Interpolation objects from react-spring
 * - These values are read via .get() inside the animation loop to get current animated values
 * - Container is measured on mount and on window resize for responsive behavior
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
        fps = 30,
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

    // Store animated props in refs so animation callback can access current values
    const animatedPropsRef = useRef({ speed, height, amplitude, points });
    animatedPropsRef.current = { speed, height, amplitude, points };

    // Stable Perlin noise instance
    const noise = usePerlinNoise();

    // Measure container on mount and observe size changes with ResizeObserver
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) {
                containerSize.current = {
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                };
            }
        });

        observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, []);

    /**
     * Calculate wave points using Perlin noise.
     * Reads animated values via .get() to get current interpolated values.
     */
    const calculateWavePoints = useCallback(
        (step: number): Point[] => {
            const scale = 100;
            const wavePoints: Point[] = [];
            const containerWidth = containerSize.current.width || 0;

            // Guard against 0-width (initial render before ResizeObserver fires)
            if (containerWidth <= 0) return [];

            // Get current animated values from refs (allows animation loop to read fresh values)
            const { speed: speedProp, height: heightProp, amplitude: amplitudeProp, points: pointsProp } = animatedPropsRef.current;
            const speedValue = getAnimatedValue(speedProp);
            const heightValue = getAnimatedValue(heightProp);
            const amplitudeValue = getAnimatedValue(amplitudeProp);

            const pointStep = containerWidth / pointsProp;
            const stepFactor = (speedValue / scale) * pointStep;

            for (let i = 0; i <= pointsProp; i++) {
                const seed = step * i + stepFactor;
                const noiseValue = noise.cachedPerlin2(seed / scale, 1);
                const y = noiseValue * amplitudeValue + heightValue;
                wavePoints.push({ x: i * pointStep, y });
            }

            return wavePoints;
        },
        [noise]
    );

    /**
     * Build SVG path string from wave points using cubic bezier curves.
     */
    const buildPath = useCallback((wavePoints: Point[]): string => {
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

        // Add buffer to ensure full coverage (no visible cutoff at edges)
        svg += ` L ${containerWidth + 1} ${containerHeight}`;
        svg += ` L -1 ${containerHeight} Z`;

        return svg;
    }, []);

    // Animation loop using custom hook
    useAnimationFrame(
        (elapsed) => {
            const step = (elapsed * Math.PI) / 1000;
            const wavePoints = calculateWavePoints(step);
            const newPath = buildPath(wavePoints);
            setPath(newPath);
        },
        { fps, paused }
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
