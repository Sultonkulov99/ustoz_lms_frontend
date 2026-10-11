type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;

  return (
    <main>
      <h1>Kurs sahifasi</h1>
      <p>Slug: {slug}</p>
    </main>
  );
}