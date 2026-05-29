import { Suspense } from "react";
import { PurchaseFlow } from "@/components/purchase/purchase-flow";

function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-rose-200 border-t-rose-600" />
    </div>
  );
}

export default function ComprarPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PurchaseFlow />
    </Suspense>
  );
}
