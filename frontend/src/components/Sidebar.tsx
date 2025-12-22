import {
    Box,
    VStack,
    Text,
    HStack,
    Divider,
    useColorModeValue
  } from "@chakra-ui/react";
  import { NavLink, useLocation } from "react-router-dom";
  import { FiHome, FiDatabase, FiActivity, FiSettings } from "react-icons/fi";
  import SidebarItem from "./SidebarItem";
  
  export default function Sidebar() {
    const location = useLocation();
  
    const bg = useColorModeValue("white", "gray.900");
    const border = useColorModeValue("gray.200", "gray.700");
  
    return (
      <Box
        w="250px"
        h="100vh"
        bg={bg}
        borderRight="1px solid"
        borderColor={border}
        position="fixed"
        px={4}
        py={6}
        display={{ base: "none", md: "block" }}
      >
        {/* Logo */}
        <HStack mb={10} px={2}>
          <Box w="12px" h="12px" bg="blue.500" borderRadius="full" />
          <Text fontSize="xl" fontWeight="bold">
            VocaStore
          </Text>
        </HStack>
  
        {/* Main Section */}
        <Text fontSize="sm" fontWeight="bold" color="gray.500" mb={2} px={1}>
          MAIN
        </Text>
  
        <VStack spacing={1} align="stretch">
          <NavLink to="/">
            <SidebarItem icon={FiHome} label="Dashboard" active={location.pathname === "/"} />
          </NavLink>
  
          <NavLink to="/inventory">
            <SidebarItem
              icon={FiDatabase}
              label="Inventory"
              active={location.pathname === "/inventory"}
            />
          </NavLink>
  
          <NavLink to="/activity">
            <SidebarItem
              icon={FiActivity}
              label="Activity Log"
              active={location.pathname === "/activity"}
            />
          </NavLink>
        </VStack>
  
        <Divider my={6} />
  
        <Text fontSize="sm" fontWeight="bold" color="gray.500" mb={2} px={1}>
          SETTINGS
        </Text>
  
        <VStack spacing={1} align="stretch">
          <NavLink to="/settings">
            <SidebarItem
              icon={FiSettings}
              label="Settings"
              active={location.pathname === "/settings"}
            />
          </NavLink>
        </VStack>
      </Box>
    );
  }
  