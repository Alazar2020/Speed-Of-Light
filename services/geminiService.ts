import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

let chatSession: Chat | null = null;

const SYSTEM_INSTRUCTION = `
You are the Onboard Flight Computer (AI Core) of an experimental relativistic spacecraft. 
Your tone is precise, calm, and scientific, but accessible. 
The user is the pilot increasing speed from 0 to c (speed of light).

You have access to the current telemetry:
- Velocity (m/s and % of c)
- Gamma factor (Time dilation)
- Current visual phenomena (Doppler shift, Aberration, Tunneling)

Explain concepts like Time Dilation, Lorentz Contraction, and Relativistic Aberration when asked.
Keep responses concise (under 100 words) to fit in the HUD.
`;

export const initializeChat = (): Chat => {
  if (chatSession) return chatSession;

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment.");
    // We return a dummy object or handle this gracefully in UI, 
    // but strict TS requires a return. We will throw if used without key 
    // effectively, but let's try to be safe.
    throw new Error("API Key missing");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });

  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<AsyncIterable<string>> => {
  try {
    const chat = initializeChat();
    const result = await chat.sendMessageStream({ message });
    
    // Generator function to yield text chunks
    async function* streamGenerator() {
      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          yield c.text;
        }
      }
    }
    return streamGenerator();

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};