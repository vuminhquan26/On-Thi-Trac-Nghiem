<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { subjectService } from '@/core/services/subject.service'
import { questionSetService } from '@/core/services/questionSet.service'
import { questionService } from '@/core/services/question.service'
import type { Subject, QuestionSet, Question } from '@/core/database/types'
import { extractQuestionsFromPdf } from '@/core/utils/pdfParser'

const route = useRoute()
const router = useRouter()

const setId = route.params.setId as string

const subject = ref<Subject | null>(null)
const questionSet = ref<QuestionSet | null>(null)
const questions = ref<Question[]>([])

const newQuestionContent = ref('')
const newOptionText = ref<Record<string, string>>({})

// --- BẮT ĐẦU: KHAI BÁO BIẾN IMPORT PDF ---
const fileInput = ref<HTMLInputElement | null>(null)
const isImporting = ref(false)
// --- KẾT THÚC: KHAI BÁO BIẾN IMPORT PDF ---

const loadData = async () => {
  const foundSet = await questionSetService.getById(setId)
  if (!foundSet) {
    alert('Không tìm thấy bộ đề!')
    router.push('/')
    return
  }
  questionSet.value = foundSet

  const foundSubject = await subjectService.getById(foundSet.subjectId)
  if (foundSubject) {
    subject.value = foundSubject
  }

  await loadQuestions()
}

const loadQuestions = async () => {
  questions.value = await questionService.getByQuestionSetId(setId)
}

const handleAddQuestion = async () => {
  if (!newQuestionContent.value.trim() || !questionSet.value || !subject.value) return
  await questionService.create(questionSet.value.id, subject.value.id, newQuestionContent.value)
  newQuestionContent.value = ''
  await loadQuestions()
}

// --- BẮT ĐẦU: LOGIC IMPORT PDF KÈM NHẬN DIỆN ĐÁP ÁN ĐÚNG ---
const triggerPdfImport = () => {
  fileInput.value?.click()
}

const handlePdfUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !questionSet.value || !subject.value) return

  isImporting.value = true
  try {
    const parsedData = await extractQuestionsFromPdf(file)
    
    if (parsedData.length === 0) {
      alert('Không tìm thấy câu hỏi nào! Hãy kiểm tra lại định dạng PDF.')
      return
    }

    if (!confirm(`Tìm thấy ${parsedData.length} câu hỏi. Bạn có muốn thêm tất cả vào bộ đề này không?`)) return

    // Duyệt qua từng câu hỏi quét được từ PDF
    for (const q of parsedData) {
      // 1. Tạo thân câu hỏi
      const newQuestion = await questionService.create(questionSet.value.id, subject.value.id, q.content)
      
      // 2. Tạo các đáp án tương ứng và lọc ra đáp án đúng
      if (newQuestion && newQuestion.id && q.options.length > 0) {
        const correctIds: string[] = [] // Mảng lưu ID của các đáp án đúng
        
        for (const opt of q.options) {
          const addedOption = await questionService.addOption(newQuestion.id, opt.text)
          
          // Kiểm tra cờ isCorrect (cần đảm bảo interface của parser đã có trường này)
          if ((opt as any).isCorrect && addedOption) {
            correctIds.push(addedOption.id)
          }
        }

        // Cập nhật lại câu hỏi với danh sách ID đáp án đúng
        if (correctIds.length > 0) {
          await questionService.update(newQuestion.id, { correctOptionIds: correctIds })
        }
      }
    }
    
    alert('Import thành công!')
    await loadQuestions()
  } catch (error) {
    console.error(error)
    alert('Có lỗi xảy ra khi đọc file PDF.')
  } finally {
    isImporting.value = false
    target.value = '' // Reset input
  }
}
// --- KẾT THÚC: LOGIC IMPORT PDF ---

const handleDeleteQuestion = async (id: string) => {
  if (!confirm('Bạn có chắc muốn xóa câu hỏi này?')) return
  await questionService.delete(id)
  await loadQuestions()
}

const handleAddOption = async (questionId: string) => {
  const text = newOptionText.value[questionId]
  if (!text?.trim()) return
  await questionService.addOption(questionId, text)
  newOptionText.value[questionId] = ''
  await loadQuestions()
}

const handleToggleCorrect = async (questionId: string, optionId: string) => {
  await questionService.toggleCorrectAnswer(questionId, optionId)
  await loadQuestions()
}

const handleDeleteOption = async (questionId: string, optionId: string) => {
  if (!confirm('Xóa đáp án này?')) return
  await questionService.deleteOption(questionId, optionId)
  await loadQuestions()
}

// --- LOGIC XÓA TOÀN BỘ ĐỀ ---
const handleDeleteQuestionSet = async () => {
  if (!subject.value) return
  
  const isConfirm = confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa TOÀN BỘ bộ đề này và tất cả câu hỏi bên trong? Hành động này không thể hoàn tác!')
  
  if (isConfirm) {
    try {
      await questionSetService.delete(setId)
      alert('Đã xóa bộ đề thành công!')
      router.push({ name: 'question-sets', params: { subjectId: subject.value.id } })
    } catch (error) {
      console.error(error)
      alert('Có lỗi xảy ra khi xóa bộ đề.')
    }
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="max-w-4xl mx-auto p-6 mt-8 bg-white rounded-xl shadow-sm border border-gray-100" v-if="questionSet && subject">
    
    <!-- ĐIỀU HƯỚNG BREADCRUMB -->
    <div class="mb-6 flex items-center gap-2 text-sm font-semibold text-gray-500">
      <router-link to="/" class="hover:text-indigo-600 transition-colors">🏠 Trang chủ</router-link>
      <span>/</span>
      <router-link :to="{ name: 'question-sets', params: { subjectId: subject.id } }" class="hover:text-indigo-600 transition-colors">
        {{ subject.name }}
      </router-link>
      <span>/</span>
      <span class="text-indigo-600">{{ questionSet.name }}</span>
    </div>

    <!-- TIÊU ĐỀ VÀ NÚT XÓA BỘ ĐỀ -->
    <div class="flex justify-between items-start mb-6">
      <div>
        <h1 class="text-2xl font-bold mb-2 text-indigo-600">Soạn thảo: {{ questionSet.name }}</h1>
        <p class="text-sm text-gray-500">Thêm nhanh câu hỏi vào bộ đề này.</p>
      </div>
      
      <button 
        @click="handleDeleteQuestionSet" 
        class="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold py-2 px-4 rounded-md transition-colors flex items-center gap-2 shadow-sm"
      >
        🗑️ Xóa bộ đề
      </button>
    </div>
    
    <!-- Form nhập câu hỏi -->
    <div class="flex flex-col gap-3 mb-8 p-5 bg-indigo-50/50 rounded-lg border border-indigo-100">
      <textarea 
        v-model="newQuestionContent" 
        placeholder="Nhập nội dung câu hỏi (hỗ trợ văn bản thuần tùy ý)..." 
        class="p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] resize-y"
      ></textarea>
      
      <!-- CỤM NÚT ĐÃ ĐƯỢC CHỈNH SỬA ĐỂ CHỨA NÚT IMPORT PDF -->
      <div class="flex gap-3">
        <button @click="handleAddQuestion" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-md w-fit transition-colors">
          Thêm Câu Hỏi
        </button>
        
        <input type="file" accept="application/pdf" ref="fileInput" @change="handlePdfUpload" class="hidden" />
        <button @click="triggerPdfImport" :disabled="isImporting" class="bg-white hover:bg-gray-50 text-indigo-600 border border-indigo-200 font-semibold py-2.5 px-6 rounded-md w-fit transition-colors flex items-center gap-2 shadow-sm">
          <span v-if="isImporting">⏳ Đang quét...</span>
          <span v-else>📄 Nhập từ PDF</span>
        </button>
      </div>
    </div>

    <!-- Danh sách câu hỏi và đáp án -->
    <div class="space-y-4">
      <div v-if="questions.length === 0" class="text-center text-gray-400 py-6 border-2 border-dashed rounded-lg">
        Bộ đề trống. Hãy thêm câu hỏi đầu tiên!
      </div>
      
      <div v-for="(question, index) in questions" :key="question.id" class="p-5 border border-gray-200 rounded-lg bg-white shadow-sm">
        
        <!-- Phần thân câu hỏi -->
        <div class="flex gap-3 mb-4 group/question">
          <div class="shrink-0 bg-indigo-100 text-indigo-700 font-bold h-8 w-8 rounded-full flex items-center justify-center">
            {{ index + 1 }}
          </div>
          <div class="flex-1 whitespace-pre-wrap text-gray-800 font-medium mt-1">
            {{ question.content }}
          </div>
          <button 
            @click="handleDeleteQuestion(question.id)"
            class="text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md opacity-0 group-hover/question:opacity-100 transition-opacity self-start text-sm font-semibold shrink-0"
          >
            Xóa câu hỏi
          </button>
        </div>

        <!-- Danh sách Đáp án -->
        <div class="ml-11 space-y-2">
          <div 
            v-for="opt in question.options" :key="opt.id" 
            class="flex items-center gap-3 p-2 rounded-md border transition-colors group"
            :class="question.correctOptionIds.includes(opt.id) ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'"
          >
            <input 
              type="checkbox" 
              :checked="question.correctOptionIds.includes(opt.id)"
              @change="handleToggleCorrect(question.id, opt.id)"
              class="w-5 h-5 text-green-600 rounded cursor-pointer border-gray-300 focus:ring-green-500"
              title="Đánh dấu là đáp án đúng"
            />
            
            <span class="flex-1 text-gray-700" :class="{'font-semibold text-green-700': question.correctOptionIds.includes(opt.id)}">
              {{ opt.text }}
            </span>

            <button 
              @click="handleDeleteOption(question.id, opt.id)"
              class="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 px-2 transition-opacity"
            >
              Xóa
            </button>
          </div>

          <!-- Ô nhập đáp án mới -->
          <div class="flex gap-2 mt-3">
            <input 
              v-model="newOptionText[question.id]" 
              @keyup.enter="handleAddOption(question.id)"
              type="text" 
              placeholder="Nhập thêm đáp án..." 
              class="flex-1 p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <button 
              @click="handleAddOption(question.id)"
              class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-semibold transition-colors"
            >
              Thêm
            </button>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>