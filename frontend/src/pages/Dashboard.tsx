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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <Spinner size="lg" />
      </Box>
    );
  }

  /* ---------- KPI calculations ---------- */

  const totalItems = items.length;

  const totalQuantity = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const lastMovement = movements[0];

  return (
    <Box p={4}>
      {/* KPI */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Stat bg="white" p={4} borderRadius="lg" shadow="sm">
          <StatLabel>מספר פריטים</StatLabel>
          <StatNumber>{totalItems}</StatNumber>
        </Stat>

        <Stat bg="white" p={4} borderRadius="lg" shadow="sm">
          <StatLabel>כמות כוללת במלאי</StatLabel>
          <StatNumber>{totalQuantity}</StatNumber>
        </Stat>

        <Stat bg="white" p={4} borderRadius="lg" shadow="sm">
          <StatLabel>פעולה אחרונה</StatLabel>
          <StatNumber fontSize="md">
            {lastMovement
              ? `${lastMovement.type} – ${lastMovement.item.name}`
              : "אין נתונים"}
          </StatNumber>
        </Stat>
      </SimpleGrid>

      {/* Inventory Table */}
      <Box mb={10}>
        <Heading size="md" mb={4}>
          מלאי נוכחי
        </Heading>
        <InventoryTable />
      </Box>

      {/* Activity Log */}
      <ActionHistory />
    </Box>
  );
};

export default Dashboard;
