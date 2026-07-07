import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const TranscribeInput = z.object({
  // base64 audio (no data: prefix) + mime
  audioBase64: z.string().min(1),
  mime: z.string().min(1),
});

function getAiConfig() {
  const lovableKey =
    process.env.LOVABLE_API_KEY?.trim() || process.env.VITE_LOVABLE_API_KEY?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim() || process.env.VITE_GEMINI_API_KEY?.trim();

  const isPlaceholder = (k: string) => !k || /demo|placeholder|changeme/i.test(k);

  if (lovableKey && !isPlaceholder(lovableKey)) {
    return { type: "lovable" as const, key: lovableKey };
  }
  if (geminiKey && !isPlaceholder(geminiKey)) {
    if (geminiKey.startsWith("sk_")) {
      return { type: "lovable" as const, key: geminiKey };
    }
    return { type: "gemini" as const, key: geminiKey };
  }
  return undefined;
}

export const transcribeAudio = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => TranscribeInput.parse(d))
  .handler(async ({ data }): Promise<{ text: string }> => {
    const config = getAiConfig();
    if (!config) {
      return {
        text: "Voice input received. Add GEMINI_API_KEY or LOVABLE_API_KEY to enable real transcription.",
      };
    }

    let text = "";
    if (config.type === "lovable") {
      const bin = Uint8Array.from(atob(data.audioBase64), (c) => c.charCodeAt(0));
      const ext =
        data.mime.includes("mp4") || data.mime.includes("m4a")
          ? "mp4"
          : data.mime.includes("wav")
            ? "wav"
            : data.mime.includes("mpeg") || data.mime.includes("mp3")
              ? "mp3"
              : "webm";

      const blob = new Blob([bin], { type: data.mime });
      const form = new FormData();
      form.append("file", blob, `recording.${ext}`);
      form.append("model", "openai/whisper-1");

      const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          "Lovable-API-Key": config.key,
        },
        body: form,
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        if (res.status === 429) throw new Error("Rate limited. Try again shortly.");
        if (res.status === 402) throw new Error("AI credits exhausted.");
        throw new Error(`Transcription failed (${res.status}): ${msg.slice(0, 200)}`);
      }
      const json = (await res.json()) as { text?: string };
      text = json.text ?? "";
    } else {
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=" +
          config.key,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inlineData: {
                      mimeType: data.mime,
                      data: data.audioBase64,
                    },
                  },
                  {
                    text: "Transcribe this audio to plain text. Return only the transcription.",
                  },
                ],
              },
            ],
          }),
        },
      );

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        if (res.status === 429) throw new Error("Rate limited. Try again shortly.");
        if (res.status === 402) throw new Error("AI credits exhausted.");
        throw new Error(`Transcription failed (${res.status}): ${msg.slice(0, 200)}`);
      }
      const json = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      text = json.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
    }

    return { text };
  });
