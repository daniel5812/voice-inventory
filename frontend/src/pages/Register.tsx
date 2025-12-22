import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Box, Button, Input, Heading, Text } from "@chakra-ui/react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else alert("נרשמת בהצלחה! בדוק אימייל לאימות");
  };

  return (
    <Box maxW="400px" mx="auto" mt="100px" p={6} bg="white" borderRadius="md" shadow="md">
      <Heading size="lg" mb={4}>יצירת משתמש</Heading>

      <Input
        placeholder="אימייל"
        mb={3}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        placeholder="סיסמה"
        type="password"
        mb={3}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <Text color="red.500">{error}</Text>}

      <Button colorScheme="green" w="100%" onClick={handleRegister}>
        הרשמה
      </Button>
    </Box>
  );
}
