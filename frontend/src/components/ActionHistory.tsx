import { Box, Text, Spinner, VStack, Flex } from "@chakra-ui/react";
import { useInventory } from "../context/InventoryContext";
import type { Movement } from "../types/Movement";

const ActionHistory = () => {
  const { movements, loading } = useInventory();

  const formatMovement = (m: Movement) => {
    switch (m.type) {
      case "create":
        return `🆕 נוצר מוצר חדש (${m.quantity})`;
      case "add":
        return `➕ נוסף ${m.quantity} יחידות`;
      case "remove":
        return `➖ הוסר ${Math.abs(m.quantity)} יחידות`;
      case "set":
        return `🔁 הוגדרה כמות חדשה (${m.quantity})`;
      default:
        return "פעולה לא מוכרת";
    }
  };

  return (
    <Box border="1px solid #eee" p={4} borderRadius={8} bg="white">
      <Text fontWeight="bold" mb={3} fontSize="lg">
        היסטוריית פעולות
      </Text>

      {loading ? (
        <Flex justify="center" py={4}>
          <Spinner />
        </Flex>
      ) : movements.length === 0 ? (
        <Text color="gray.500">אין פעולות להצגה</Text>
      ) : (
        <VStack align="start" spacing={3}>
          {movements.map((m) => (
            <Box
              key={m.id}
              p={3}
              borderWidth="1px"
              borderRadius={6}
              bg="gray.50"
              _hover={{ bg: "gray.100" }}
              w="100%"
            >
              <Flex justify="space-between" align="center">
                <Text>
                  {formatMovement(m)} — <b>{m.item.name}</b>
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {new Date(m.createdAt).toLocaleString()}
                </Text>
              </Flex>

              {m.rawText && (
                <Text fontSize="xs" mt={1} color="gray.500">
                  🎤 "{m.rawText}"
                </Text>
              )}
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default ActionHistory;
