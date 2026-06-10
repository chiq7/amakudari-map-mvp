import Link from "next/link";
import { persons } from "@/lib/static-content";

export default function PersonsPage() {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-3xl font-bold text-primary md:text-4xl">
          公表再就職者一覧
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          公表資料に掲載された再就職者を一覧で確認できます。
        </p>
      </section>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {persons.map((person) => (
          <li key={person.slug}>
            <Link
              href={`/persons/${person.slug}`}
              className="block rounded-lg border border-outline-variant bg-surface-container-lowest p-4 hover:border-secondary"
            >
              <span className="font-bold text-primary">{person.name}</span>
              <span className="mt-1 block text-sm text-on-surface-variant">
                {person.ministry}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

