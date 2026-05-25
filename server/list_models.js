import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function checkModels() {
  try {
    const list = await groq.models.list();
    console.log(list.data.map(m => m.id));
  } catch (error) {
    console.error(error);
  }
}
checkModels();
