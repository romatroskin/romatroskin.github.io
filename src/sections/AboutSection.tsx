export default function AboutSection() {
  return (
    <section id="about-section" aria-labelledby="about-heading">
      <div className="about-container content-card">
        <h2 id="about-heading" className="section-title">About Us</h2>
        <div className="about-content">
          <p className="about-text">
            At Puff Puff Dev, we are dedicated to crafting exceptional
            mobile applications that bring your ideas to life. With a
            team of experienced developers and designers, we leverage
            the latest technologies, primarily focusing on Flutter and
            Dart, to deliver seamless user experiences and innovative
            solutions.
          </p>
          <p className="about-text">
            Our mission is to transform your dreams into reality
            through creative coding, attention to detail, and a
            commitment to quality. Whether you're a startup looking to
            build your first app or an established business seeking to
            enhance your digital presence, we are here to help you
            every step of the way.
          </p>
          <p className="about-text highlight">
            Join us on this exciting journey as we explore the endless
            possibilities of mobile development together!
          </p>
        </div>
      </div>
    </section>
  );
}
