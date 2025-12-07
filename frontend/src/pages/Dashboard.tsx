import { Box, Flex, Heading } from "@chakra-ui/react";
import { useRef } from "react";
import InventoryTable from "../components/InventoryTable";
import ActionHistory from "../components/ActionHistory";
import VoiceInput from "../components/voiceInput";

const Dashboard = () => {
  const inventoryRefreshRef = useRef<(() => void) | null>(null);
  const historyRefreshRef = useRef<(() => void) | null>(null);

  const handleSuccess = () => {
    if (inventoryRefreshRef.current) inventoryRefreshRef.current();
    if (historyRefreshRef.current) historyRefreshRef.current();
  };

  return (
    <Box p={6}>
      <Heading mb={6}>Inventory Dashboard</Heading>
      <VoiceInput onSuccess={handleSuccess} />

      <Flex gap={6} direction={{ base: "column", md: "row" }}>
        <Box flex="2">
          <InventoryTable
            onRefreshRef={inventoryRefreshRef}
            onAction={handleSuccess}
          />
        </Box>

        <Box flex="1">
          <ActionHistory onRefreshRef={historyRefreshRef} />
        </Box>
      </Flex>
    </Box>
  );
};

export default Dashboard;
