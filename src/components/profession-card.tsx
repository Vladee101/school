type Profession = { id: number; name: string; description: string; subjects: string | null; howToExplore: string | null };

/** Карточка профессии: название, направление, описание, полезные предметы, как познакомиться. */
export function ProfessionCard({ profession, typeName }: { profession: Profession; typeName: string }) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5">
      <h4 className="text-lg font-bold text-gray-900">{profession.name}</h4>
      <dl className="mt-3 space-y-2 text-sm leading-relaxed text-gray-800">
        <div><dt className="inline font-semibold">Направление: </dt><dd className="inline">{typeName}.</dd></div>
        <div><dt className="inline font-semibold">Описание: </dt><dd className="inline whitespace-pre-line">{profession.description}</dd></div>
        {profession.subjects && (
          <div><dt className="inline font-semibold">Полезные школьные предметы: </dt><dd className="inline">{profession.subjects}</dd></div>
        )}
        {profession.howToExplore && (
          <div><dt className="inline font-semibold">Как познакомиться с профессией: </dt><dd className="inline whitespace-pre-line">{profession.howToExplore}</dd></div>
        )}
      </dl>
    </article>
  );
}
