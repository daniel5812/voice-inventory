import { Box, Heading, Input } from "@chakra-ui/react";
import { useState, useRef, useCallback } from "react";
import InventoryTable from "../components/InventoryTable";

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const tableRefreshRef = useRef<(() => void) | null>(null);

  const handleAction = useCallback(() => {
    tableRefreshRef.current?.();
  }, []);

  return (
    <Box>
      <Heading mb={6}>Inventory</Heading>

      <Input
        placeholder="חיפוש פריטים..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        mb={6}
        size="lg"
        bg="white"
        borderRadius="md"
        maxW="400px"
        shadow="sm"
      />

      <InventoryTable
        search={search}
        onRefreshRef={tableRefreshRef}
        onAction={handleAction}
      />
    </Box>
  );
}
