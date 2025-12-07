import { extendTheme } from "@chakra-ui/react";

const system = extendTheme({
  fonts: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
  },
  styles: {
    global: {
      body: {
        bg: "#f7f9fc",
      },
    },
  },
});

export default system;
