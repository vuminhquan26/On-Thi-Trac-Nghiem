<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { studySessionService } from '@/core/services/studySession.service'
import { questionSetService } from '@/core/services/questionSet.service'
import type { StudySession, QuestionSet } from '@/core/database/types'

const route = useRoute()
const router = useRouter()

const sessionId = route.params.sessionId as string

const session = ref<StudySession | null>(null)
const questionSet = ref<QuestionSet | null>(null)

// Biến lưu trữ thống kê kết quả
const stats = ref({
  total: 0,
  correct: 0,
  incorrect: 0,
  skipped: 0,
  score: 0
})

const loadData = async () => {
  const foundSession = await studySessionService.getSessionById(sessionId)
  if (!foundSession) {
    alert('Không tìm thấy kết quả làm bài!')
    router.push('/')
    return
  }
  session.value = foundSession

  const foundSet = await questionSetService.getById(foundSession.questionSetId)
  if (foundSet) {
    questionSet.value = foundSet
  }

  calculateStats(foundSession)
}

const calculateStats = (s: StudySession) => {
  let correct = 0
  let incorrect = 0
  let skipped = 0
  
  const total = s.questionOrderIds.length

  s.questionOrderIds.forEach(qId => {
    const outcome = s.responses[qId].currentOutcome
    if (outcome === 'correct') correct++
    else if (outcome === 'incorrect') incorrect++
    else if (outcome === 'skipped' || outcome === 'unverified') skipped++
  })

  stats.value = {
    total,
    correct,
    incorrect,
    skipped,
    // Tính phần trăm điểm (làm tròn)
    score: total > 0 ? Math.round((correct / total) * 100) : 0
  }
}

const goBackToSets = () => {
  if (questionSet.value) {
    router.push({ name: 'question-sets', params: { subjectId: questionSet.value.subjectId } })
  } else {
    router.push('/')
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="max-w-4xl mx-auto p-6 mt-8 bg-white rounded-xl shadow-sm border border-gray-100" v-if="session && questionSet">
    
    <!-- Tiêu đề -->
    <div class="text-center mb-8 pb-6 border-b">
      <h1 class="text-3xl font-bold text-indigo-700 mb-2">Tổng kết Kết quả</h1>
      <p class="text-gray-500 text-lg">Bộ đề: <span class="font-semibold text-gray-700">{{ questionSet.name }}</span></p>
    </div>

    <!-- Khối Thống kê (Cards) -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
      <div class="bg-indigo-50 p-4 rounded-xl text-center border border-indigo-100">
        <div class="text-sm text-indigo-600 font-semibold mb-1">Điểm số</div>
        <div class="text-3xl font-bold text-indigo-700">{{ stats.score }}%</div>
      </div>
      <div class="bg-green-50 p-4 rounded-xl text-center border border-green-100">
        <div class="text-sm text-green-600 font-semibold mb-1">Đúng</div>
        <div class="text-3xl font-bold text-green-700">{{ stats.correct }}</div>
      </div>
      <div class="bg-red-50 p-4 rounded-xl text-center border border-red-100">
        <div class="text-sm text-red-600 font-semibold mb-1">Sai</div>
        <div class="text-3xl font-bold text-red-700">{{ stats.incorrect }}</div>
      </div>
      <div class="bg-gray-50 p-4 rounded-xl text-center border border-gray-200">
        <div class="text-sm text-gray-500 font-semibold mb-1">Bỏ qua</div>
        <div class="text-3xl font-bold text-gray-700">{{ stats.skipped }}</div>
      </div>
    </div>

    <h2 class="text-xl font-bold text-gray-800 mb-4">Chi tiết bài làm</h2>

    <!-- Danh sách review từng câu hỏi -->
    <div class="space-y-6">
      <div 
        v-for="(qId, index) in session.questionOrderIds" 
        :key="qId" 
        class="p-5 border rounded-lg bg-gray-50"
        :class="{
          'border-green-300': session.responses[qId].currentOutcome === 'correct',
          'border-red-300': session.responses[qId].currentOutcome === 'incorrect',
          'border-gray-300': session.responses[qId].currentOutcome === 'skipped' || session.responses[qId].currentOutcome === 'unverified'
        }"
      >
        <!-- Thân câu hỏi -->
        <div class="flex gap-3 mb-4">
          <div 
            class="shrink-0 font-bold h-8 w-8 rounded-full flex items-center justify-center text-white"
            :class="{
              'bg-green-500': session.responses[qId].currentOutcome === 'correct',
              'bg-red-500': session.responses[qId].currentOutcome === 'incorrect',
              'bg-gray-400': session.responses[qId].currentOutcome === 'skipped' || session.responses[qId].currentOutcome === 'unverified'
            }"
          >
            {{ index + 1 }}
          </div>
          <div class="flex-1 whitespace-pre-wrap text-gray-800 font-medium mt-1">
            {{ session.responses[qId].snapshot.content }}
          </div>
        </div>

        <!-- Phân tích Đáp án -->
        <div class="space-y-2 ml-11">
          <div 
            v-for="opt in session.responses[qId].snapshot.options" 
            :key="opt.id"
            class="p-3 rounded-md border flex items-center gap-3"
            :class="{
              'bg-green-100 border-green-400': session.responses[qId].snapshot.correctOptionIds.includes(opt.id),
              'bg-red-50 border-red-300': session.responses[qId].selectedOptionIds.includes(opt.id) && !session.responses[qId].snapshot.correctOptionIds.includes(opt.id),
              'bg-white border-gray-200': !session.responses[qId].snapshot.correctOptionIds.includes(opt.id) && !session.responses[qId].selectedOptionIds.includes(opt.id)
            }"
          >
            <!-- Icon Trạng thái (Đúng/Sai/Trống) -->
            <div class="w-5 h-5 flex items-center justify-center">
              <span v-if="session.responses[qId].selectedOptionIds.includes(opt.id) && session.responses[qId].snapshot.correctOptionIds.includes(opt.id)" class="text-green-600 font-bold">✓</span>
              <span v-else-if="session.responses[qId].selectedOptionIds.includes(opt.id) && !session.responses[qId].snapshot.correctOptionIds.includes(opt.id)" class="text-red-500 font-bold">✗</span>
              <span v-else-if="!session.responses[qId].selectedOptionIds.includes(opt.id) && session.responses[qId].snapshot.correctOptionIds.includes(opt.id)" class="text-green-600 font-bold">✓</span>
              <span v-else class="text-gray-300 font-bold">•</span>
            </div>
            
            <span class="text-gray-700" :class="{'font-semibold': session.responses[qId].snapshot.correctOptionIds.includes(opt.id)}">{{ opt.text }}</span>
            
            <!-- Nhãn hiển thị những gì người dùng đã chọn -->
            <span v-if="session.responses[qId].selectedOptionIds.includes(opt.id)" class="ml-auto text-xs font-bold px-2 py-1 rounded bg-black/5 text-gray-600">
              Bạn chọn
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Nút Thoát -->
    <div class="mt-8 pt-6 border-t flex justify-center">
      <button @click="goBackToSets" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg shadow-sm transition-colors">
        Quay lại danh sách bộ đề
      </button>
    </div>

  </div>
</template>