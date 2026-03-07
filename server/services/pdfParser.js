import pdfParse from 'pdf-parse'

const parseResume = async (fileBuffer) => {
  const data = await pdfParse(fileBuffer)
  return data.text
}

export default parseResume