import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
// import Header from "./components/Header/Header.tsx";
import "./index.css";
import { initWebVitals } from './performance/vitals';
import { monitorLongAnimationFrames } from './performance/loafMonitor';

// Initialize performance monitoring
initWebVitals();
monitorLongAnimationFrames();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        {/* <Header /> */}
        <App />
    </StrictMode>
);
