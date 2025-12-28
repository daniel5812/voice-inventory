import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Spinner,
  Heading,
} from "@chakra-ui/react";

import { useInventory } from "../context/InventoryContext";
import InventoryTable from "../components/InventoryTable";
import ActionHistory from "../components/ActionHistory";

const Dashboard = () => {
  const { items, movements, loading } = useInventory();

  /* ---------- Loading state ---------- */
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <Spinner size="lg" />
      </Box>
    );
  }

  /* ---------- SAFE DATA ---------- */

  const safeItems = Array.isArray(items)
    ? items.filter((i) => i && typeof i.id === "number")
    : [];

  const safeMovements = Array.isArray(movements)
  ? movements.filter(
      (m) =>
        m &&
        m.item &&
        typeof m.item.id === "number"
    )
  : [];


  /* ---------- KPI calculations ---------- */

  const totalItems = safeItems.length;

  const totalQuantity = safeItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const lastMovement = safeMovements[0] ?? null;

  const lastItem =
    lastMovement &&
    safeItems.find((item) => item.id === lastMovement.item.id);

  return (
    <Box p={4}>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Stat bg="white" p={4} borderRadius="lg" shadow="sm">
          <StatLabel>Total Items</StatLabel>
          <StatNumber>{totalItems}</StatNumber>
        </Stat>

        <Stat bg="white" p={4} borderRadius="lg" shadow="sm">
          <StatLabel>Total Quantity</StatLabel>
          <StatNumber>{totalQuantity}</StatNumber>
        </Stat>

        <Stat bg="white" p={4} borderRadius="lg" shadow="sm">
          <StatLabel>Last Action</StatLabel>
          <StatNumber fontSize="md">
            {lastMovement && lastItem
              ? `${lastMovement.type} – ${lastItem.name}`
              : "No recent activity"}
          </StatNumber>
        </Stat>
      </SimpleGrid>

      <Box mb={10}>
        <Heading size="md" mb={4}>
          Current Inventory
        </Heading>
        <InventoryTable />
      </Box>

      <ActionHistory />
    </Box>
  );
};

export default Dashboard;
