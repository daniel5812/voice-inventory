import { SimpleGrid, Box, Text, useColorModeValue } from "@chakra-ui/react";

interface AnalyticsProps {
  totalItems: number;
  lowStock: number;
  products: number;
}

export default function AnalyticsCards({ totalItems, lowStock, products }: AnalyticsProps) {
  const cardBg = useColorModeValue("white", "gray.800");

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
      <Box p={6} bg={cardBg} borderRadius="lg" shadow="sm">
        <Text color="gray.500" fontWeight="semibold">סה״כ מלאי</Text>
        <Text fontSize="3xl" fontWeight="bold">{totalItems}</Text>
      </Box>

      <Box p={6} bg={cardBg} borderRadius="lg" shadow="sm">
        <Text color="gray.500" fontWeight="semibold">פריטים במלאי נמוך</Text>
        <Text fontSize="3xl" fontWeight="bold">{lowStock}</Text>
      </Box>

      <Box p={6} bg={cardBg} borderRadius="lg" shadow="sm">
        <Text color="gray.500" fontWeight="semibold">מספר מוצרים</Text>
        <Text fontSize="3xl" fontWeight="bold">{products}</Text>
      </Box>
    </SimpleGrid>
  );
}
