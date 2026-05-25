import pdfParse from 'pdf-parse';
import fs from 'fs';

export const extractTextFromPdf = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF Parsing Service Error:', error);
    throw new Error('Failed to parse PDF file');
  }
};
