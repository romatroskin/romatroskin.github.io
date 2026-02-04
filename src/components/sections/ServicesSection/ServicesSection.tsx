interface ServicesSectionProps {
  onNavigate: (page: number) => void;
}

export default function ServicesSection({ onNavigate }: ServicesSectionProps) {
  return (
    <section id="services-section" aria-labelledby="services-heading">
      <div className="intro-container content-card">
        <h2 id="services-heading" className="section-title">Craft Applications Workshop</h2>
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
            onClick={() => onNavigate(2)}
          >
            Learn More About Us
          </button>
        </div>
      </div>
    </section>
  );
}
