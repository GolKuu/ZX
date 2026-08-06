const applicationData = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'YZX',
  description:
    'A browser-based 3D fighting game with cel-shaded combat and cinematic impact effects.',
  applicationCategory: 'GameApplication',
  operatingSystem: 'Web browser',
  playMode: 'SinglePlayer',
  genre: ['Fighting', 'Action'],
};

export function StructuredData() {
  const json = JSON.stringify(applicationData).replaceAll('<', '\\u003c');

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
