import styles from './ContactSection.module.css';

export default function ContactSection() {
  return (
    <section id="contact-section" aria-labelledby="contact-heading">
      <div className={`${styles.contactCard} content-card`}>
        <h2 id="contact-heading" className="section-title">Get In Touch</h2>
        {/* Form will be implemented in next plan */}
        <p className={styles.placeholder}>Contact form coming soon...</p>
      </div>
    </section>
  );
}
