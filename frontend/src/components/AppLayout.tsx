import { Outlet } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const SIDEBAR_WIDTH = "260px";

export default function Layout() {
  return (
    <Box minH="100vh" bg="gray.50">
      
      {/* Sidebar תמיד מוצג */}
      <Sidebar />

      {/* אזור התוכן */}
      <Box ml={SIDEBAR_WIDTH}>
        <Header />
        
        {/* כאן יוצגו כל הדפים הפנימיים */}
        <Box p={8}>
          <Outlet />
        </Box>
      </Box>

    </Box>
  );
}
