import { Box, Flex, Heading, useToast } from "@chakra-ui/react";
import { useRef } from "react";
import InventoryTable from "../components/InventoryTable";
import RecentMovements from "../components/RecentMovements";
import VoiceInput from "../components/voiceInput";

const Dashboard = () => {
  const inventoryRefreshRef = useRef<(() => void) | null>(null);
  const movementsRefreshRef = useRef<(() => void) | null>(null);

  const handleVoiceSuccess = () => {
    // Refresh both inventory and movements after voice command
    if (inventoryRefreshRef.current) {
      inventoryRefreshRef.current();
    }
    if (movementsRefreshRef.current) {
      movementsRefreshRef.current();
    }
  };

  return (
    <Box p={6}>
      <Heading mb={6}>Inventory Dashboard</Heading>
      <VoiceInput onSuccess={handleVoiceSuccess} />

      <Flex gap={6} direction={{ base: "column", md: "row" }}>
        <Box flex="2">
          <InventoryTable onRefreshRef={inventoryRefreshRef} />
        </Box>

        <Box flex="1">
          <RecentMovements onRefreshRef={movementsRefreshRef} />
        </Box>
      </Flex>
    </Box>
  );
};

export default Dashboard;
