// import { Interpolation, animated } from 'react-spring';
import { animated, Interpolation } from "@react-spring/web";
import Wave, { WavesPropTypes } from "./Waves";
import React, { memo } from "react";

const AnimatedWave = animated(Wave);

interface WavyBackgroundPropTypes {
    options: WavesPropTypes;
    fill?: Interpolation<number, string>;
    style?: {
        transform?: Interpolation<number, string>;
    };
    id?: string;
}

// const StaticDefs = () => (
//     <defs>
//         <filter id="glitch" x="0" y="0">
//             <feColorMatrix
//                 in="SourceGraphic"
//                 mode="matrix"
//                 values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
//                 result="r"
//             />

//             <feOffset in="r" result="r" dx="-5">
//                 <animate
//                     attributeName="dx"
//                     attributeType="XML"
//                     values="0; -5; 0; -18; -2; -4; 0 ;-3; 0"
//                     dur="3s"
//                     repeatCount="indefinite"
//                 />
//             </feOffset>
//             <feColorMatrix
//                 in="SourceGraphic"
//                 mode="matrix"
//                 values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
//                 result="g"
//             />
//             <feOffset in="g" result="g" dx="-5" dy="1">
//                 <animate
//                     attributeName="dx"
//                     attributeType="XML"
//                     values="0; 0; 0; -3; 0; 8; 0 ;-1; 0"
//                     dur="6s"
//                     repeatCount="indefinite"
//                 />
//             </feOffset>
//             <feColorMatrix
//                 in="SourceGraphic"
//                 mode="matrix"
//                 values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
//                 result="b"
//             />
//             <feOffset in="b" result="b" dx="5" dy="2">
//                 <animate
//                     attributeName="dx"
//                     attributeType="XML"
//                     values="0; 3; -1; 4; 0; 2; 0 ;18; 0"
//                     dur="8s"
//                     repeatCount="indefinite"
//                 />
//             </feOffset>
//             <feBlend in="r" in2="g" mode="screen" result="blend" />
//             <feBlend in="blend" in2="b" mode="screen" result="blend" />
//         </filter>
//     </defs>
// );

const WavyBackground = memo(
    React.forwardRef<Wave, WavyBackgroundPropTypes>(
        ({ options, style, fill, id }, ref) => {
            // Type assertion needed: react-spring's AnimatedProps creates complex intersection types
            // that conflict with SVG's native 'points' attribute vs Wave's custom 'points' prop
            const animatedProps = {
                ...options,
                fill,
                style,
                id,
                ref: ref as React.Ref<Wave>,
            } as React.ComponentProps<typeof AnimatedWave>;

            return <AnimatedWave {...animatedProps} />;
        }
    )
);

export default WavyBackground;
