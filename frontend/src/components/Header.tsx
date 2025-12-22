import { Flex, Box, Text, Spacer, Avatar } from "@chakra-ui/react";
import VoiceInput from "./voiceInput";

export default function Header() {
  return (
    <Flex
      w="100%"
      bg="white"
      px={8}
      py={4}
      align="center"
      shadow="sm"
      borderBottom="1px solid #eee"
      position="sticky"
      top={0}
      zIndex={10}
    >
      {/* Logo */}
      <Flex align="center" gap={2}>
        <Box w="10px" h="10px" bg="blue.500" borderRadius="full" />
        <Text fontSize="xl" fontWeight="bold">
          VocaStore
        </Text>
      </Flex>

      <Spacer />

      {/* Voice button */}
      <VoiceInput />

      {/* Avatar */}
      <Avatar size="sm" bg="gray.300" ml={4} cursor="pointer" />
    </Flex>
  );
}
