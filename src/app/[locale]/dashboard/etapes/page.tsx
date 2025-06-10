"use client"

import { EtapesManagement } from "@/components/etapes/etapes"

export default function Page() {
  return (
    <div>
      <EtapesManagement mandatId="some-mandat-id" onBack={() => {}} />
    </div>
  )
}
