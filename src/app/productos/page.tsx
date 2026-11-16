import { getErpSnapshotAction } from "@/app/actions/erp-actions";
import { ProductosClient } from "@/components/erp/productos-client";

export const dynamic = "force-dynamic";

export default async function ProductosPage() {
  const snapshot = await getErpSnapshotAction();
  return <ProductosClient initialData={snapshot} />;
}
