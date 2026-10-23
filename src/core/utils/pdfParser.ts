import * as pdfjsLib from 'pdfjs-dist'
// Cấu hình Worker cho Vite để không bị lỗi môi trường
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

export interface ParsedQuestion {
  content: string
  options: { id: string, text: string }[]
}

export const extractQuestionsFromPdf = async (file: File): Promise<ParsedQuestion[]> => {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ''

  // Đọc toàn bộ chữ từ tất cả các trang
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    // Ghép các khối text lại. Nếu chênh lệch trục Y (xuống dòng), thêm ký tự \n
    let lastY, text = ''
    for (const item of textContent.items as any[]) {
      if (lastY !== item.transform[5]) {
        text += '\n'
        lastY = item.transform[5]
      }
      text += item.str
    }
    fullText += text + '\n'
  }

  return parseTextToQuestions(fullText)
}

const parseTextToQuestions = (text: string): ParsedQuestion[] => {
  const questions: ParsedQuestion[] = []
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)

  let currentQuestion: ParsedQuestion | null = null

  // Regex bắt đầu câu: "1.", "1:", "Câu 1.", "Câu 1:"
  const questionRegex = /^(?:Câu\s*\d+|\d+)\s*[:\.]\s*(.+)/i
  // Regex bắt đầu đáp án: "a.", "b)", "A.", "B)"
  const optionRegex = /^[a-d]\s*[\.\)]\s*(.+)/i

  for (const line of lines) {
    const qMatch = line.match(questionRegex)
    if (qMatch) {
      if (currentQuestion) questions.push(currentQuestion)
      currentQuestion = { content: qMatch[1], options: [] }
      continue
    }

    const oMatch = line.match(optionRegex)
    if (oMatch && currentQuestion) {
      currentQuestion.options.push({ id: crypto.randomUUID(), text: oMatch[1] })
      continue
    }

    // Nếu không khớp Regex (thường là do câu hỏi/đáp án dài bị rớt dòng)
    if (currentQuestion) {
      if (currentQuestion.options.length > 0) {
        // Nối vào đáp án cuối cùng
        currentQuestion.options[currentQuestion.options.length - 1].text += ' ' + line
      } else {
        // Nối vào thân câu hỏi
        currentQuestion.content += '\n' + line
      }
    }
  }
  
  if (currentQuestion) questions.push(currentQuestion)
  return questions
}