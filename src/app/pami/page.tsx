import { getErpSnapshotAction } from "@/app/actions/erp-actions";
import { PamiClient } from "@/components/erp/pami-client";

export const dynamic = "force-dynamic";

export default async function PamiPage() {
  const snapshot = await getErpSnapshotAction();
  return <PamiClient initialData={snapshot} />;
}
