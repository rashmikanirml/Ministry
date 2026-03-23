import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { authCookieName, readSessionFromToken } from "@/lib/auth";
import { includeRequestDetails } from "@/lib/request-mappers";
import AdminDashboardClient, { AppRequest, SessionUser } from "./AdminDashboardClient";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(authCookieName)?.value;
  const session = readSessionFromToken(token);

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "ADMIN") {
    redirect("/user");
  }

  const requests = await prisma.request.findMany({
    include: includeRequestDetails,
    orderBy: { dateSubmitted: "desc" },
  });

  const initialAdmin: SessionUser = {
    id: session.userId,
    name: session.name,
    username: session.username,
    role: session.role,
    division: session.division,
  };

  const initialRequests: AppRequest[] = requests.map((item) => ({
    ...item,
    dateSubmitted: item.dateSubmitted.toISOString(),
    multimedia: item.multimedia
      ? {
          ...item.multimedia,
          dateTime: item.multimedia.dateTime.toISOString(),
        }
      : null,
  }));

  return <AdminDashboardClient initialAdmin={initialAdmin} initialRequests={initialRequests} />;
}
