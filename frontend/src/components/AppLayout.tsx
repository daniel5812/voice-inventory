import { Outlet } from "react-router-dom";
import { Box, Flex, Text, Button } from "@chakra-ui/react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useCurrentUser } from "../hooks/useCurrentUser";


const SIDEBAR_WIDTH = "260px";



export default function AppLayout() {
  const { displayName, logout, loading } = useCurrentUser();
  if (loading) return null;


  return (
    <Box minH="100vh" bg="gray.50">
      <Sidebar />

      <Box ml={SIDEBAR_WIDTH}>
        <Header />

        <Flex
          px={8}
          py={3}
          bg="gray.100"
          borderBottom="1px solid"
          borderColor="gray.200"
          justify="space-between"
          align="center"
        >
          <Text fontSize="sm" color="gray.600">
            Connected as: <strong>{displayName}</strong>
          </Text>

          <Button
            size="sm"
            colorScheme="red"
            variant="outline"
            onClick={logout}
          >
            Logout
          </Button>
        </Flex>

        <Box p={8}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
