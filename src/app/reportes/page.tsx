import { getErpSnapshotAction } from "@/app/actions/erp-actions";
import { ReportesClient } from "@/components/erp/reportes-client";

export const dynamic = "force-dynamic";

export default async function ReportesPage() {
  const snapshot = await getErpSnapshotAction();
  return <ReportesClient initialData={snapshot} />;
}
