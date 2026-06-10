import Link from "next/link";
import organizationsData from "@/public/data/organizations.json";

type OrganizationRecord = {
  organization_slug: string;
  再就職先名称: string;
  受け入れ人数: number;
};

const organizations = organizationsData as OrganizationRecord[];

export default function OrganizationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-3xl font-bold text-primary md:text-4xl">
          再就職先組織一覧
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          公表資料に掲載された再就職先組織を一覧で確認できます。
        </p>
      </section>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {organizations.map((organization) => (
          <li key={organization.organization_slug}>
            <Link
              href={`/organizations/${organization.organization_slug}`}
              className="flex items-center justify-between gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-4 hover:border-secondary"
            >
              <span className="font-bold text-primary">
                {organization.再就職先名称}
              </span>
              <span className="shrink-0 text-sm text-on-surface-variant">
                {organization.受け入れ人数}人
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

