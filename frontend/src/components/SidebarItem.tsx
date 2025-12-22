import { HStack, Text, Icon, useColorModeValue } from "@chakra-ui/react";

interface SidebarItemProps {
  icon: any;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function SidebarItem({ icon, label, active, onClick }: SidebarItemProps) {
  const bgActive = useColorModeValue("blue.50", "blue.900");
  const colorActive = useColorModeValue("blue.600", "blue.300");
  const colorInactive = useColorModeValue("gray.600", "gray.400");

  return (
    <HStack
      spacing={3}
      px={3}
      py={2}
      borderRadius="md"
      cursor="pointer"
      bg={active ? bgActive : "transparent"}
      color={active ? colorActive : colorInactive}
      _hover={{ bg: active ? bgActive : "gray.50" }}
      transition="background 0.15s ease"
      onClick={onClick}
    >
      <Icon as={icon} boxSize={4} />
      <Text display={{ base: "none", md: "block" }} fontWeight={active ? "semibold" : "normal"}>
        {label}
      </Text>
    </HStack>
  );
}
