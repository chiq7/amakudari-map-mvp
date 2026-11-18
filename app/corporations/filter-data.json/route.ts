import { directoryCorporations } from "@/lib/directory-data";

export const dynamic = "force-static";

export function GET() {
  return Response.json(directoryCorporations);
}
