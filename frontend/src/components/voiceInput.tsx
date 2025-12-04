import { useState } from "react";
import { IconButton, useToast } from "@chakra-ui/react";
import { FaMicrophone } from "react-icons/fa";
import { createMovement } from "../api/movements";

const SpeechRecognition =
  (window as any).webkitSpeechRecognition ||
  (window as any).SpeechRecognition;

interface VoiceInputProps {
  onSuccess?: () => void;
}

export default function VoiceInput({ onSuccess }: VoiceInputProps) {
  const toast = useToast();
  const [listening, setListening] = useState(false);
  const [lastCommand, setLastCommand] = useState("");

  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "he-IL"; // זיהוי עברית 🔥
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript.trim();
      setLastCommand(transcript);
      console.log("🎤 Heard:", transcript);

      const action = parseCommand(transcript);

      if (!action) {
        toast({
          title: "לא הצלחתי להבין את הפקודה 😕",
          description: transcript,
          status: "warning",
          duration: 3000,
        });
        return;
      }

      await sendCommandToServer(action);
    };

    recognition.onerror = (e: any) => {
      console.error(e);
      toast({
        title: "שגיאה בזיהוי קול",
        status: "error",
        duration: 3000,
      });
    };

    recognition.onend = () => setListening(false);

    recognition.start();
  };

    // 🧠 ===== ניתוח פקודות בעברית ======
    function parseCommand(text: string) {
      const original = text;
      text = text.toLowerCase();
    
      // מילים לפעולות
      const addWords = ["הוסף", "להוסיף", "תוסיף", "הוספה", "פלוס"];
      const removeWords = ["הורד", "להוריד", "תוריד", "הורדה", "מינוס"];
    
      let type: "add" | "remove" | null = null;
    
      if (addWords.some((w) => text.includes(w))) type = "add";
      if (removeWords.some((w) => text.includes(w))) type = "remove";
    
      if (!type) return null;
    
      // מציאת מספר (ברירת מחדל: 1)
      const numberMatch = text.match(/\d+/);
      const amount = numberMatch ? parseInt(numberMatch[0]) : 1;
    
      // נקה את הטקסט ממספרים ומילים מיותרות
      let cleaned = text;
    
      cleaned = cleaned.replace(/\d+/g, " "); // להסיר מספרים
    
      // להסיר מילים של הוספה/הורדה
      [...addWords, ...removeWords].forEach((word) => {
        cleaned = cleaned.replace(word, " ");
      });
    
      // ניקוי רווחים כפולים
      cleaned = cleaned.replace(/\s+/g, " ").trim();
    
      const product = cleaned;
    
      if (!product) return null;
    
      return {
        raw: original,
        product,
        quantity: amount,
        type,
      };
    }
    

  // 🔄 שליחת פקודה לשרת
  async function sendCommandToServer(cmd: any) {
    const { product, quantity, type, raw } = cmd;

    try {
      await createMovement({
        itemName: product,
        quantity,
        type: type.toLowerCase(),
        rawText: raw || "",
      });

      toast({
        title: "הפעולה בוצעה בהצלחה ✔",
        description: `${type === "add" ? "+" : "-"}${quantity} ${product}`,
        status: "success",
        duration: 3000,
      });

      // רענון נתונים לאחר הצלחה
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error sending voice command:", err);
      toast({
        title: "שגיאה בעדכון המלאי",
        status: "error",
        duration: 3000,
      });
    }
  }

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




