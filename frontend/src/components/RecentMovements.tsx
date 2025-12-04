import { useEffect, useState, useImperativeHandle } from "react";
import { Box, Text, VStack, Spinner } from "@chakra-ui/react";
import type { Movement } from "../types/Movement";
import { getMovements } from "../api/movements";

interface RecentMovementsProps {
  onRefreshRef?: React.MutableRefObject<(() => void) | null>;
}

const RecentMovements = ({ onRefreshRef }: RecentMovementsProps) => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await getMovements(5);
    setMovements(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  useImperativeHandle(onRefreshRef, () => load, []);

  if (loading) return <Spinner />;

  return (
    <Box border="1px solid #eee" p={4} borderRadius={6}>
      <Text fontWeight="bold" mb={3}>
        Recent Movements
      </Text>

      <VStack align="start" spacing={2}>
        {movements.map((m) => (
          <Box key={m.id}>
            <Text>
              <b>{m.type === "add" ? "+" : "-"}</b>
              {m.quantity} {m.item.name}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {new Date(m.createdAt).toLocaleString()}
            </Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default RecentMovements;
