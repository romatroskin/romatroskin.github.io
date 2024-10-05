import React from "react";
import Perlin from "../components/Perlin";
import { random } from "lodash";
import styles from "./waves.module.css";
import { Interpolation } from "@react-spring/web";

interface WavesPropTypes {
    points: number;
    speed: number | Interpolation<number, number>;
    amplitude: number | Interpolation<number, number>;
    height: number | Interpolation<number, number>;
    paused: boolean;
    svgId?: string;
    svgPathId?: string;
}

const targetFrameRate = 30; // Adjust this to your desired frame rate
const frameInterval = 1000 / targetFrameRate; // Calculate the interval between frames

type WaveProps = WavesPropTypes & React.SVGProps<SVGPathElement>;

class Wave extends React.Component<WaveProps, { path: string }> {
    _elapsed: number;
    _step: number;
    _noise: Perlin;
    _containerWidth?: number;
    _containerHeight?: number;
    _lastUpdate?: number;
    container: React.RefObject<HTMLDivElement>;
    _frameId?: number;

    static defaultProps = {
        points: 3,
        speed: 0.1,
        amplitude: 10,
        height: 50,
        paused: false,
        svgId: "wave",
        svgPathId: "wave-path",
    };
    constructor(props: WaveProps) {
        super(props);
        this.state = { path: "" };
        this._elapsed = 0;
        this._step = 0;
        this._noise = new Perlin(random(true));
        this.container = React.createRef();

        console.log("Wave", { props });
    }

    componentDidMount() {
        this._containerWidth = this.container.current?.offsetWidth;
        this._containerHeight = this.container.current?.offsetHeight;
        this._lastUpdate = performance.now();
        this._frameId = window.requestAnimationFrame(this._update);
    }

    componentWillUnmount() {
        if (typeof this._frameId !== "undefined") {
            window.cancelAnimationFrame(this._frameId);
        }
    }

    // _calculateWavePoints = () => {
    //     const points = [];
    //     const scale = 100;

    //     for (let i = 0; i <= Math.max(this.props.points, 1); i++) {
    //         const x = (i / this.props.points) * this._containerWidth;
    //         const seed =
    //             this._step * i +
    //             (i % this.props.points) * this.props.speed * scale;
    //         const height = Math.sin(seed / scale) * this.props.amplitude;
    //         const y = Math.sin(seed / scale) * height + this.props.height;
    //         points.push({ x, y });
    //     }

    //     return points;
    // };

    _calculateWavePoints = () => {
        const scale = 100;
        const points = [];
        const step = (this?._containerWidth ?? 0) / this.props.points;

        const speed =
            typeof this.props.speed === "number"
                ? this.props.speed
                : this.props.speed.get();
        const height =
            typeof this.props.height === "number"
                ? this.props.height
                : this.props.height.get();

        const amplitudeFactor =
            typeof this.props.amplitude === "number"
                ? this.props.amplitude
                : this.props.amplitude.get();
        const stepFactor = (speed / scale) * step;

        for (let i = 0; i <= this.props.points; i++) {
            const seed = this._step * i + stepFactor;
            const noiseValue = this._noise.perlin2(seed / scale, 1);
            const y = noiseValue * amplitudeFactor + height;
            points.push({ x: i * step, y });
        }

        return points;
    };

    _buildPath = (points: { x: number; y: number }[]) => {
        let svg = `M ${points[0].x} ${points[0].y}`;
        const initial = {
            x: (points[1].x - points[0].x) / 2,
            y:
                points[1].y -
                points[0].y +
                points[0].y +
                (points[1].y - points[0].y),
        };
        const cubic = (
            a: { x: number; y: number },
            b: { x: number; y: number }
        ) => ` C ${a.x} ${a.y} ${a.x} ${a.y} ${b.x} ${b.y}`;
        svg += cubic(initial, points[1]);
        let point = initial;
        for (let i = 1; i < points.length - 1; i++) {
            point = {
                x: points[i].x - point.x + points[i].x,
                y: points[i].y - point.y + points[i].y,
            };
            svg += cubic(point, points[i + 1]);
        }
        svg += ` L ${this._containerWidth} ${this._containerHeight}`;
        svg += ` L 0 ${this._containerHeight} Z`;
        return svg;
    };

    _draw = () => {
        if (!this.props.paused) {
            const now = performance.now();
            this._elapsed += now - (this?._lastUpdate ?? 0);
            this._lastUpdate = now;
        }

        const scale = 1000;
        this._step = (this._elapsed * Math.PI) / scale;
        this._redraw();
    };

    _redraw = () => {
        const path = this._buildPath(this._calculateWavePoints());
        this.setState({ path });
    };

    _update = (timestamp: number) => {
        if (!this.props.paused) {
            const elapsed = timestamp - (this._lastUpdate ?? timestamp);

            if (elapsed >= frameInterval) {
                // Only update the animation when enough time has passed
                this._elapsed += elapsed;
                this._lastUpdate = timestamp;

                const scale = 1000;
                this._step = (this._elapsed * Math.PI) / scale;
                this._redraw();
            }
        }

        this._frameId = window.requestAnimationFrame(this._update);
    };

    render() {
        const {
            style,
            // className,
            fill,
            // paused,
            children,
            id,
            svgId,
            svgPathId,
            // d,
            // height,
            // amplitude,
            // speed,
            // points,
            ...rest
        } = this.props;

        return (
            <div
                id={id}
                ref={this.container}
                className={styles.hologramWave}
                style={{
                    width: "100%",
                    display: "inline-block",
                    ...style,
                    ...{ styles },
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
                            { d: this.state.path, fill, id: svgPathId },
                            rest
                        )}
                    />
                </svg>
            </div>
        );
    }
}

export default Wave;
export type { WaveProps, WavesPropTypes };
