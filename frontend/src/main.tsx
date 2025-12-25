import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import App from "./App";
import system from "./theme";
import { AuthProvider } from "./context/AuthContext";
import { registerSW } from "virtual:pwa-register";
import { InventoryProvider } from "./context/InventoryContext";

registerSW();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider theme={system}>
      <AuthProvider>
        <InventoryProvider>
        <App />
        </InventoryProvider>
      </AuthProvider>
    </ChakraProvider>
  </React.StrictMode>
);
