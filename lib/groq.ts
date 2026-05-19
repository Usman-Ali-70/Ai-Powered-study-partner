import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export default groq;
export const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';
