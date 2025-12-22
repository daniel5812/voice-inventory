import { Box, Flex, Text } from "@chakra-ui/react";

export default function KpiCard({
  label,
  value,
  color = "blue.500",
}: {
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <Box
      bg="white"
      borderRadius="lg"
      p={5}
      minW="200px"
      boxShadow="sm"
      border="1px solid"
      borderColor="gray.100"
    >
      <Flex direction="column" gap={1}>
        <Text fontSize="sm" color="gray.500" fontWeight="500">
          {label}
        </Text>
        <Text fontSize="2xl" fontWeight="bold" color={color}>
          {value}
        </Text>
      </Flex>
    </Box>
  );
}
