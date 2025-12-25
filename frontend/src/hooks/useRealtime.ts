import { useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

export function useRealtime(onUpdate: () => void) {
  // Use a ref to keep the callback stable without triggering effect re-runs
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    // Create a unique channel ID for this specific component instance
    const channelId = `db-changes-${Math.random().toString(36).slice(2, 9)}`;
    let debounceTimer: ReturnType<typeof setTimeout>;

    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public" },
        (payload) => {
          console.log("🔄 Realtime update received:", payload);
          
          // Debounce: Wait 300ms before refreshing to group multiple updates
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            onUpdateRef.current();
          }, 300);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`✅ Realtime connected (${channelId})`);
        }
      });

    return () => {
      clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, []);
}