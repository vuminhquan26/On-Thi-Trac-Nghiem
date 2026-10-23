<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { questionSetService } from '@/core/services/questionSet.service'
import { studySessionService } from '@/core/services/studySession.service'
import type { QuestionSet, StudySession } from '@/core/database/types'
import { db } from '@/core/database/db'
import MarkdownViewer from '@/components/MarkdownViewer.vue'

const route = useRoute()
const router = useRouter()
const setId = route.params.setId as string

const questionSet = ref<QuestionSet | null>(null)
const activeSession = ref<StudySession | null>(null)
const currentQuestionIndex = ref(0)

// --- LOGIC LOAD DỮ LIỆU & XÁO TRỘN ---
const loadData = async () => {
  const foundSet = await questionSetService.getById(setId)
  if (!foundSet) {
    alert('Không tìm thấy bộ đề!')
    router.push('/')
    return
  }
  questionSet.value = foundSet

  let session = await studySessionService.getActiveSession(setId)
  
  if (session) {
    const wantToResume = confirm('Bạn đang có một bài thi làm dở.\n\n- Bấm "OK" để LÀM TIẾP.\n- Bấm "Cancel / Hủy" để THI LẠI TỪ ĐẦU (Đề sẽ được xáo trộn mới).')
    if (!wantToResume) {
      await db.studySessions.delete(session.id)
      session = await studySessionService.createSession(setId)
    }
  } else {
    session = await studySessionService.createSession(setId)
  }
  
  if (!session) {
    alert('Bộ đề này chưa có câu hỏi nào để thi!')
    router.push({ name: 'question-sets', params: { subjectId: foundSet.subjectId } })
    return
  }
  
  activeSession.value = session
}

// --- LOGIC ĐIỀU HƯỚNG CÂU HỎI ---
const currentSessionQuestion = computed(() => {
  if (!activeSession.value) return null
  const qId = activeSession.value.questionOrderIds[currentQuestionIndex.value]
  return activeSession.value.responses[qId]
})

const isFirst = computed(() => currentQuestionIndex.value === 0)
const isLast = computed(() => {
  if (!activeSession.value) return true
  return currentQuestionIndex.value === activeSession.value.questionOrderIds.length - 1
})

const nextQuestion = () => { if (!isLast.value) currentQuestionIndex.value++ }
const prevQuestion = () => { if (!isFirst.value) currentQuestionIndex.value-- }
const jumpToQuestion = (index: number) => { currentQuestionIndex.value = index }

// --- LOGIC XỬ LÝ ĐÁP ÁN ---
const toggleOption = async (optionId: string) => {
  if (!activeSession.value || !currentSessionQuestion.value) return

  const currentSelected = [...currentSessionQuestion.value.selectedOptionIds]
  const idx = currentSelected.indexOf(optionId)
  
  if (idx > -1) {
    currentSelected.splice(idx, 1) // Bỏ chọn
  } else {
    // Trắc nghiệm 1 đáp án thì thay thế luôn
    currentSelected.splice(0, currentSelected.length, optionId) 
  }

  await studySessionService.recordAnswer(activeSession.value.id, currentSessionQuestion.value.questionId, currentSelected)
  
  activeSession.value.responses[currentSessionQuestion.value.questionId].selectedOptionIds = currentSelected
}

const isSelected = (optionId: string) => {
  return currentSessionQuestion.value?.selectedOptionIds.includes(optionId)
}

const isAnswered = (qId: string) => {
  return (activeSession.value?.responses[qId].selectedOptionIds.length || 0) > 0
}

const exitQuiz = () => {
  if (confirm('Bạn có chắc muốn thoát? Bài làm hiện tại sẽ được lưu tạm.')) {
    router.push({ name: 'question-sets', params: { subjectId: questionSet.value?.subjectId } })
  }
}

const submitQuiz = async () => {
  try {
    if (!activeSession.value) return
    const unansweredCount = activeSession.value.questionOrderIds.filter(id => !isAnswered(id)).length
    
    if (unansweredCount > 0) {
      if (!confirm(`Bạn còn ${unansweredCount} câu chưa làm. Vẫn muốn nộp bài?`)) return
    } else {
      if (!confirm('Bạn có chắc chắn muốn nộp bài?')) return
    }

    console.log("1. Bắt đầu lưu và chấm điểm...");
    await studySessionService.finishSession(activeSession.value.id)
    
    console.log("2. Chấm điểm xong! Đang chuyển hướng...");
    // LƯU Ý: Tên 'session-result' phải KHỚP CHÍNH XÁC với thuộc tính name trong file router/index.ts
    router.push({ name: 'quiz-result', params: { sessionId: activeSession.value.id } })
    
  } catch (error) {
    console.error("LỖI KHI NỘP BÀI:", error)
    alert("Có lỗi xảy ra, vui lòng bật F12 xem Console.")
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8" v-if="activeSession && currentSessionQuestion">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6 items-start">
      
      <!-- CỘT TRÁI: KHUNG LÀM BÀI CHÍNH -->
      <div class="flex-1 w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 flex flex-col">
        
        <!-- Header -->
        <div class="flex justify-between items-center border-b border-gray-100 pb-5 mb-8">
          <h1 class="text-xl font-bold text-indigo-600">Đang thi: {{ questionSet?.name }}</h1>
          <button @click="exitQuiz" class="text-gray-500 hover:text-gray-700 font-medium">Thoát</button>
        </div>

        <!-- Thân câu hỏi -->
        <div class="flex-1">
          <div class="flex gap-4 mb-8 group">
            <div class="shrink-0 bg-indigo-600 text-white font-bold h-12 w-12 rounded-full flex items-center justify-center text-lg shadow-sm">
              {{ currentQuestionIndex + 1 }}
            </div>
            <div class="flex-1 text-lg text-gray-800 mt-2">
              <MarkdownViewer :content="currentSessionQuestion.snapshot.content" />
            </div>
          </div>

          <!-- Lựa chọn đáp án -->
          <div class="space-y-4 pl-0 sm:pl-16">
            <label 
              v-for="opt in currentSessionQuestion.snapshot.options" :key="opt.id"
              class="flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200"
              :class="isSelected(opt.id) 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-gray-200 hover:bg-gray-50'"
            >
              <input 
                type="checkbox" 
                :checked="isSelected(opt.id)" 
                @change="toggleOption(opt.id)" 
                class="w-5 h-5 mt-1 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" 
              />
              <MarkdownViewer :content="opt.text" class="flex-1 text-gray-700" />
            </label>
          </div>
        </div>

        <!-- Footer Điều hướng dưới -->
        <div class="flex justify-between items-center border-t border-gray-100 pt-6 mt-10">
          <button @click="prevQuestion" :disabled="isFirst" class="px-6 py-3 rounded-lg border border-gray-200 font-semibold transition-colors disabled:opacity-50 text-gray-700 hover:bg-gray-50">
            &larr; Câu trước
          </button>
          
          <span class="font-bold text-gray-400 lg:hidden">
            {{ currentQuestionIndex + 1 }} / {{ activeSession.questionOrderIds.length }}
          </span>

          <button v-if="!isLast" @click="nextQuestion" class="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shadow-sm">
            Câu tiếp &rarr;
          </button>
          <button v-else @click="submitQuiz" class="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold transition-colors shadow-sm">
            Nộp bài
          </button>
        </div>

      </div>

      <!-- CỘT PHẢI: BẢNG CHUYỂN CÂU NHANH (Bám dính) -->
      <div class="w-full lg:w-80 shrink-0 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
        <h3 class="font-bold text-lg mb-5 text-gray-800 border-b border-gray-100 pb-3">Bảng câu hỏi</h3>
        
        <!-- Lưới số câu -->
        <div class="grid grid-cols-5 gap-2.5">
          <button 
            v-for="(qId, idx) in activeSession.questionOrderIds" :key="qId"
            @click="jumpToQuestion(idx)"
            class="w-10 h-10 rounded-lg font-bold flex items-center justify-center border-2 transition-all duration-200 text-sm"
            :class="[
              currentQuestionIndex === idx ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110 z-10' : 'hover:scale-105',
              isAnswered(qId) 
                ? 'bg-indigo-600 text-white border-indigo-600' 
                : 'bg-white text-gray-500 border-gray-200'
            ]"
          >
            {{ idx + 1 }}
          </button>
        </div>
        
        <!-- Chú thích -->
        <div class="mt-8 flex flex-col gap-3 text-sm font-medium text-gray-600 bg-gray-50 p-4 rounded-xl">
          <div class="flex items-center gap-3">
            <div class="w-5 h-5 rounded border-2 border-indigo-600 bg-indigo-600 shadow-sm"></div> 
            Đã chọn đáp án
          </div>
          <div class="flex items-center gap-3">
            <div class="w-5 h-5 rounded border-2 border-gray-200 bg-white"></div> 
            Chưa làm
          </div>
        </div>

        <!-- Nút nộp bài ở Sidebar -->
        <button @click="submitQuiz" class="w-full mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl uppercase tracking-wide transition-colors shadow-sm">
          Nộp Bài Ngay
        </button>
      </div>

    </div>
  </div>
</template>