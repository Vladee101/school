import { SCHOOL } from "@/lib/school";

export const metadata = { title: "О школе" };

export default function AboutPage() {
  const rows = [
    ["Адрес", SCHOOL.address],
    ["Телефон", SCHOOL.phone],
    ["Email", SCHOOL.email],
    ["Режим работы", SCHOOL.hours],
  ];
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-3xl font-bold">О школе</h1>
      <p className="mb-6 text-gray-700">{SCHOOL.description}</p>
      <dl className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 p-4 sm:grid-cols-[10rem_1fr]">
            <dt className="font-medium text-gray-600">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
