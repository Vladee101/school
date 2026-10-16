import { SCHOOL } from "@/lib/school";

export function SiteFooter() {
  return (
    <footer className="mt-12 bg-gray-900 px-4 py-8 text-center text-sm text-gray-300">
      <p>{SCHOOL.name}</p>
      <p>
        {SCHOOL.address} · {SCHOOL.phone}
      </p>
    </footer>
  );
}
