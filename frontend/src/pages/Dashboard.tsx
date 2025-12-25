// -------------------------------------------------------------
// src/pages/Dashboard.tsx  — גרסה נקייה ומתוקנת
// -------------------------------------------------------------

import { Box, Flex, Heading } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";

import { useRealtime } from "../hooks/useRealtime";
import InventoryTable from "../components/InventoryTable";
import ActionHistory from "../components/ActionHistory";
import KpiCard from "../components/KpiCard";
import { getItems } from "../api/items";

const Dashboard = () => {

  const [items, setItems] = useState<any[]>([]);

  // ---- Load stats data ----
  const loadItemsForStats = useCallback(async () => {
    try {
      const res = await getItems();
      setItems(res.data || []);
    } catch (e) {
      console.error("Failed loading KPI items:", e);
    }
  }, []);


  useEffect(() => {
    loadItemsForStats();
  }, [loadItemsForStats]);

  useRealtime(loadItemsForStats);

  // ---- KPI Calculations ----
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const lowStock = items.filter((i) => i.quantity < 3).length;
  const uniqueItems = items.length;

  // ---- UI ----
  return (
    <Box p={8} maxW="1500px" mx="auto">
      
      {/* KPI CARDS */}
      <Flex gap={6} mb={10} wrap="wrap">
        <KpiCard label="סה״כ מלאי" value={totalQuantity} color="blue.600" />
        <KpiCard label="פריטים במלאי נמוך" value={lowStock} color="red.500" />
        <KpiCard label="מספר מוצרים" value={uniqueItems} color="purple.600" />
      </Flex>

      {/* TITLE */}
      <Heading mb={6} fontWeight="600" color="gray.700">
        Dashboard
      </Heading>

      {/* MAIN CONTENT */}
      <Flex
        gap={8}
        align="flex-start"
        direction={{ base: "column", md: "row" }}
      >
        {/* Inventory Table */}
        <Box flex="2">
          <InventoryTable />
        </Box>

        {/* Activity Log */}
        <Box flex="1">
          <ActionHistory />
        </Box>
      </Flex>
    </Box>
  );
};

export default Dashboard;
