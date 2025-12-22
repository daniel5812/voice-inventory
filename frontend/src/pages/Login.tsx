import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  VStack,
  Divider,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  // אם כבר מחובר – אין מה לחפש כאן
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate("/");
      }
    });
  }, [navigate]);

  // -------------------------------
  // Google OAuth
  // -------------------------------
  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      console.error("Google login failed:", error);
      alert("Google login failed");
      return;
    }

    // Supabase מחזיר URL – חייבים ניווט מלא
    if (data?.url) {
      window.location.href = data.url;
    }
  };

  // -------------------------------
  // Email / Password
  // -------------------------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signInWithEmail = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(error);
      alert("Login failed: " + error.message);
    } else {
      navigate("/");
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.100"
      p={4}
    >
      <Box
        bg="white"
        p={8}
        borderRadius="lg"
        boxShadow="lg"
        width="100%"
        maxW="420px"
      >
        <Heading textAlign="center" mb={6}>
          התחברות
        </Heading>

        {/* Google */}
        <Button
          colorScheme="red"
          size="lg"
          width="100%"
          onClick={signInWithGoogle}
        >
          התחבר עם Google
        </Button>

        <Divider my={5} />

        {/* Email / Password */}
        <VStack spacing={4}>
          <Input
            placeholder="אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button colorScheme="blue" width="100%" onClick={signInWithEmail}>
            התחבר
          </Button>
        </VStack>

        <Text mt={4} textAlign="center">
          אין לך חשבון?{" "}
          <Button
            variant="link"
            colorScheme="blue"
            onClick={() => navigate("/register")}
          >
            הרשם עכשיו
          </Button>
        </Text>
      </Box>
    </Box>
  );
}
