import { extendTheme } from "@chakra-ui/react";

const system = extendTheme({
  styles: {
    global: {
      body: {
        bg: "gray.50",
      },
    },
  },
});

export default system;
