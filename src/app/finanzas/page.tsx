import { getErpSnapshotAction } from "@/app/actions/erp-actions";
import { FinanzasClient } from "@/components/erp/finanzas-client";

export const dynamic = "force-dynamic";

export default async function FinanzasPage() {
  const snapshot = await getErpSnapshotAction();
  return <FinanzasClient initialData={snapshot} />;
}
