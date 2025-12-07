import { useState } from "react";
import { IconButton, useToast } from "@chakra-ui/react";
import { FaMicrophone } from "react-icons/fa";
import { sendVoiceCommand } from "../api/voice";

const SpeechRecognition =
  (window as any).webkitSpeechRecognition ||
  (window as any).SpeechRecognition;

export default function VoiceInput({ onSuccess }: { onSuccess?: () => void }) {
  const toast = useToast();
  const [listening, setListening] = useState(false);
  const [lastCommand, setLastCommand] = useState("");

  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "he-IL"; // עברית
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript.trim();
      setLastCommand(transcript);
      console.log("🎤 Heard:", transcript);

      try {
        // שולח את הטקסט המקורי לשרת
        const result = await sendVoiceCommand(transcript);

        if (result.success) {
          toast({
            title: "בוצע בהצלחה ✔",
            description: result.message,
            status: "success",
            duration: 3000,
          });

          if (onSuccess) onSuccess();
        } else {
          toast({
            title: "לא הצלחתי להבין את הפקודה 😕",
            description: result.error || transcript,
            status: "warning",
            duration: 3000,
          });
        }
      } catch (err) {
        console.error("Error sending voice command:", err);
        toast({
          title: "שגיאה בתקשורת עם השרת",
          status: "error",
          duration: 3000,
        });
      }
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <IconButton
        colorScheme={listening ? "red" : "blue"}
        isRound
        size="lg"
        aria-label="voice"
        icon={<FaMicrophone />}
        onClick={startListening}
      />

      {lastCommand && (
        <p style={{ marginTop: "10px", fontSize: "18px" }}>
          🎤 זוהה: <b>{lastCommand}</b>
        </p>
      )}
    </div>
  );
}
