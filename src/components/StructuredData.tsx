import React from 'react';

export const OrganizationSchema: React.FC = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Puff Puff Dev",
    "url": "https://puffpuff.dev/",
    "logo": "https://puffpuff.dev/logo.png",
    "sameAs": [
      "https://github.com/romatroskin"
    ],
    "description": "Turning your ideas into polished software that users love."
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
