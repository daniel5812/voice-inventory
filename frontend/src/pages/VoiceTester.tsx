import { useState } from "react";
import { Box, Button, Input, Text, VStack } from "@chakra-ui/react";
import { sendVoiceCommand } from "../api/voice";

export default function VoiceTester() {
  const [text, setText] = useState("");
  const [response, setResponse] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // משתמשים באותו API כמו VoiceInput – שולחים טקסט גולמי לשרת
      const res = await sendVoiceCommand(text.trim());
      setResponse(res);
    } catch (err) {
      console.error("Error sending voice command:", err);
      setError("שגיאה בשליחת הפקודה לשרת");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={4}>
        <Text fontSize="2xl" fontWeight="bold">
          🎤 Voice Agent Test (דרך השרת)
        </Text>
        <Text>
          כאן אפשר לכתוב פקודה טקסטואלית (במקום דיבור) ולבדוק איך ה-Voice Agent
          מפרש ומעדכן את המלאי דרך ה-API של השרת.
        </Text>

        <Input
          placeholder="לדוגמה: 'הוסף 3 בקבוקי קולה'..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <Button onClick={handleSend} isLoading={loading} colorScheme="blue">
          שלח פקודה לשרת
        </Button>

        {error && <Text color="red.500">{error}</Text>}

        {response && (
          <Box mt={4} p={4} borderWidth="1px" borderRadius="md">
            <Text fontWeight="bold">תשובת שרת:</Text>
            <pre style={{ whiteSpace: "pre-wrap" }}>
              {JSON.stringify(response, null, 2)}
            </pre>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
