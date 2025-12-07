import { useEffect, useRef, useState } from "react";

export default function VoiceTester() {
  const wsRef = useRef<WebSocket | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);

  const addLog = (txt: string) =>
    setLogs((l) => [...l, txt].slice(-50));

  useEffect(() => {
    // התחברות ל־OpenAI Realtime
    const ws = new WebSocket(
      "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview",
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
          "OpenAI-Beta": "realtime=v1",
        },
      }
    );

    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      addLog("🎤 Connected to Realtime Voice API");
    };

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "response.output_text.delta") {
        addLog("🤖 Model: " + data.delta);
      }

      if (data.type === "response.reflection.delta") {
        addLog("📦 Intent: " + JSON.stringify(data.delta));

        // שליחת ה־intent לשרת שלך
        await fetch("http://localhost:5000/voice/command", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ intent: data.delta }),
        });
      }
    };

    ws.onerror = (e) => addLog("❌ Error: " + e);
    ws.onclose = () => addLog("🔌 Disconnected");

    return () => ws.close();
  }, []);

  // הפעלת מיקרופון
  const startMic = async () => {
    if (!wsRef.current) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      const float32 = new Float32Array(input);
      wsRef.current?.send(
        JSON.stringify({
          type: "input_audio_buffer.append",
          audio: Array.from(float32),
        })
      );
    };

    source.connect(processor);
    processor.connect(audioContext.destination);

    addLog("🎙️ Microphone streaming started");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🎤 Voice Agent Test</h1>

      <button
        disabled={!connected}
        onClick={startMic}
        style={{ padding: 10, fontSize: 18 }}
      >
        🎙️ התחל הקלטה
      </button>

      <div style={{ marginTop: 20 }}>
        <h3>Logs:</h3>
        <pre style={{ height: 300, overflow: "auto", background: "#eee" }}>
          {logs.join("\n")}
        </pre>
      </div>
    </div>
  );
}
