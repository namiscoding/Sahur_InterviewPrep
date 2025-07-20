import axios from 'axios';

const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// 1. Định nghĩa một interface cho response của Whisper
interface WhisperApiResponse {
  text: string;
}

export const transcribeAudio = async (audioBlob: Blob, language: 'vi' | 'en'): Promise<string> => {
  const formData = new FormData();
  
  formData.append('file', audioBlob, 'recording.webm');
  formData.append('model', 'whisper-1');
  formData.append('language', language);

  try {
    const response = await axios.post<WhisperApiResponse>(
      WHISPER_API_URL,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.text;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error("Failed to transcribe audio.");
  }
};