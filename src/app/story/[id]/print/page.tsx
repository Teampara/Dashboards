type PrintPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PrintPage({ params }: PrintPageProps) {
  const { id } = await params;

  const pages = Array.from({ length: 10 }).map((_, i) => ({
    number: i + 1,
    content: `Story ${id}: printable page ${i + 1}. This layout is optimized for A4 PDF generation.`
  }));

  return (
    <div className="space-y-4">
      {pages.map((page) => (
        <article key={page.number} className="print-page rounded-xl bg-white p-8 shadow">
          <h1 className="mb-4 text-2xl font-bold">Page {page.number}</h1>
          <p className="text-lg leading-relaxed">{page.content}</p>
        </article>
      ))}
    </div>
  );
}
