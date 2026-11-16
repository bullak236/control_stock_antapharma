import { getErpSnapshotAction } from "@/app/actions/erp-actions";
import { EntidadesClient } from "@/components/erp/entidades-client";

export const dynamic = "force-dynamic";

export default async function EntidadesPage() {
  const snapshot = await getErpSnapshotAction();
  return <EntidadesClient initialData={snapshot} />;
}
