// פעולה אפשרית על המלאי
export type VoiceAction = "add" | "remove";

// פקודה קולית מפורשת מהמודל (Groq)
export interface ParsedVoiceCommand {
  action: VoiceAction;   // add / remove
  itemName: string;      // שם המוצר
  quantity: number;      // כמות
  rawText: string;       // הטקסט המקורי שזוהה
}

// תגובה מהשרת
export interface VoiceCommandResponse {
  success: boolean;
  message: string;
  appliedQuantity?: number;
}
