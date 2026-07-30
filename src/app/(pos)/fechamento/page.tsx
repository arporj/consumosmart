import { Suspense } from "react";
import { FechamentoClient } from "./FechamentoClient";

export default function FechamentoPage() {
  return (
    <Suspense>
      <FechamentoClient />
    </Suspense>
  );
}
