import { Outlet } from "react-router-dom";
import { Box, Flex, Text, Button } from "@chakra-ui/react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "../context/AuthContext";

const SIDEBAR_WIDTH = "260px";

export default function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Sidebar */}
      <Sidebar />

      {/* אזור התוכן */}
      <Box ml={SIDEBAR_WIDTH}>
        {/* Header קיים שלך */}
        <Header />

        {/* User Debug Bar – קריטי להפרדה בין פרופילים */}
        <Flex
          px={8}
          py={3}
          bg="gray.100"
          borderBottom="1px solid"
          borderColor="gray.200"
          justify="space-between"
          align="center"
        >
          <Text fontSize="sm">
            מחובר כ: <b>{user?.email}</b>
            <br />
            <Text as="span" fontSize="xs" color="gray.500">
              user_id: {user?.id}
            </Text>
          </Text>

          <Button
            size="sm"
            colorScheme="red"
            variant="outline"
            onClick={logout}
          >
            התנתק
          </Button>
        </Flex>

        {/* תוכן הדפים */}
        <Box p={8}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
