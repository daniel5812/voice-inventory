import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import App from "./App.tsx";
import system from "./theme.ts";
import { registerSW } from 'virtual:pwa-register';

registerSW();


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider theme={system}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
