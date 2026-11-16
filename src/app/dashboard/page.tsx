import { getErpSnapshotAction } from "@/app/actions/erp-actions";
import { DashboardClient } from "@/components/erp/dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const snapshot = await getErpSnapshotAction();
  return <DashboardClient initialData={snapshot} />;
}
