import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function parseVoiceCommand(text: string) {
  const instructions = `
אתה מנתח פקודות קוליות לניהול מלאי.
הפקודות הן בעברית ותמיד יש להחזיר JSON בלבד:

{
  "action": "add" | "remove" | "set",
  "quantity": מספר,
  "itemName": מחרוזת
}

דוגמאות:
"תוסיף שלוש עגבניות" → { action: "add", quantity: 3, itemName: "עגבניות" }
"להוריד 2 קוקה קולה" → { action: "remove", quantity: 2, itemName: "קוקה קולה" }
"תקבע שיש 10 חבילות אורז" → { action: "set", quantity: 10, itemName: "אורז" }

אסור להחזיר טקסט חופשי. רק JSON תקין.
`;

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: `${instructions}\n\nפקודה: "${text}"`,
    text: {
      format: {
        type: "json_schema",
        name: "InventoryCommand",
        strict: true,
        schema: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["add", "remove", "set"] },
            quantity: { type: "integer", minimum: 1 },
            itemName: { type: "string" },
          },
          required: ["action", "quantity", "itemName"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.output_text;

  try {
    return JSON.parse(content);
  } catch (e) {
    console.error("Failed to parse JSON from OpenAI:", content);
    return null;
  }
}
