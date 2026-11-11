"use client"; // Client: Aprovisionamiento de sobres de prueba para cuentas demo

import { useEffect } from "react";
import { toast } from "@/lib/ui/toast";
import { addPacksToInventory, loadUserPackInventory } from "@/lib/cards/pack-storage";
import type { UserPackInventory } from "@/lib/cards/types";

export function useAlbumTesterSeed(
  userId: string | undefined,
  isDemo: boolean,
  setPackInventory: (inv: UserPackInventory) => void
) {
  useEffect(() => {
    if (userId && isDemo) {
      const seededKey = `mareona_tester_packs_seeded_${userId}`;
      if (!window.localStorage.getItem(seededKey)) {
        addPacksToInventory("aficionado", 3, userId);
        addPacksToInventory("rojiblanco", 3, userId);
        addPacksToInventory("leyenda", 3, userId);
        setPackInventory(loadUserPackInventory(userId));
        window.localStorage.setItem(seededKey, "true");
        toast.success("¡Lote de prueba otorgado!", {
          description: "3 sobres Aficionado, 3 Rojiblanco y 3 Leyenda añadidos a tu cuenta.",
        });
      }
    }
  }, [userId, isDemo, setPackInventory]);
}
