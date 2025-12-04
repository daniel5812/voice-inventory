import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function parseHebrewCommand(text: string) {
  const response = await groq.chat.completions.create({
    model: "llama3-70b-8192",
    messages: [
      {
        role: "system",
        content: `
        אתה מנתח פקודות מלאי בעברית. 
        תפקידך לזהות מהטקסט:
        1. פעולה: "add" (הוספה) או "remove" (הסרה/הורדה)
        2. כמות: מספר (אם לא מוזכר, ברירת מחדל היא 1)
        3. שם הפריט: שם הפריט בעברית
        
        דוגמאות:
        - "הוסף 5 חלב" -> {"action": "add", "quantity": 5, "itemName": "חלב"}
        - "הורד 3 לחם" -> {"action": "remove", "quantity": 3, "itemName": "לחם"}
        - "תוסיף ביצים" -> {"action": "add", "quantity": 1, "itemName": "ביצים"}
        - "מינוס 2 סוכר" -> {"action": "remove", "quantity": 2, "itemName": "סוכר"}
        
        מילות מפתח להוספה: הוסף, תוסיף, להוסיף, הוספה, פלוס, +
        מילות מפתח להסרה: הורד, תוריד, להוריד, הורדה, מינוס, -
        
        החזר תמיד JSON בלבד במבנה:
        {
          "action": "add" | "remove",
          "quantity": מספר (חיובי),
          "itemName": "שם הפריט"
        }
        
        אם לא הצלחת לזהות את הפעולה או הפריט, החזר quantity: 0 ו-itemName: "".
        `
      },
      { role: "user", content: text }
    ],
    response_format: { type: "json_object" },
    temperature: 0.3, // פחות יצירתיות, יותר דיוק
  });

  const content = response.choices?.[0]?.message?.content;

  if (!content) {
    console.error("Groq error: empty response", response);
    throw new Error("Groq returned null content");
  }

  try {
    const parsed = JSON.parse(content);
    
    // ולידציה בסיסית
    if (!parsed.action || !parsed.itemName || !parsed.quantity) {
      throw new Error("Invalid parsed structure");
    }
    
    // נרמול
    parsed.action = parsed.action.toLowerCase();
    parsed.quantity = Math.max(1, parseInt(parsed.quantity) || 1);
    parsed.itemName = parsed.itemName.trim();
    
    return parsed;
  } catch (parseError) {
    console.error("Error parsing Groq response:", parseError, "Content:", content);
    throw new Error("Failed to parse Groq response");
  }
}
