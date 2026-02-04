interface HeroSectionProps {
  onNavigate: (page: number) => void;
}

export default function HeroSection({ onNavigate }: HeroSectionProps) {
  return (
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
          onClick={() => onNavigate(1)}
          aria-label="Scroll to next section"
        >
          <span className="scroll-arrow">↓</span>
          <span className="scroll-text">Discover More</span>
        </button>
      </div>
    </section>
  );
}
