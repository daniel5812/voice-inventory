// frontend/src/api/voice.ts
export async function sendVoiceCommand(text: string) {
  const response = await fetch("http://localhost:5000/api/voice/command", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return {
      success: false,
      message: error.error || "Server error",
    };
  }

  const data = await response.json();
  return data; // מכיל success, message וכו'
}
