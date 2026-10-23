<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { subjectService } from '@/core/services/subject.service'
import { examTypeService } from '@/core/services/examType.service'
import { questionSetService } from '@/core/services/questionSet.service'
import type { Subject, ExamType, QuestionSet } from '@/core/database/types'

const route = useRoute()
const router = useRouter()

// Lấy subjectId từ URL params
const subjectId = route.params.subjectId as string

const subject = ref<Subject | null>(null)
const examTypes = ref<ExamType[]>([])
const questionSets = ref<QuestionSet[]>([])

const newSetName = ref('')
const newSetDesc = ref('')
const selectedExamTypeId = ref('')

const loadData = async () => {
  // 1. Tải thông tin Môn học
  const foundSubject = await subjectService.getById(subjectId)
  if (!foundSubject) {
    alert('Không tìm thấy môn học!')
    router.push('/')
    return
  }
  subject.value = foundSubject

  // 2. Khởi tạo và tải Loại đề thi
  await examTypeService.initializeDefaults()
  examTypes.value = await examTypeService.getAll()
  if (examTypes.value.length > 0) {
    selectedExamTypeId.value = examTypes.value[0].id
  }

  // 3. Tải danh sách Bộ đề
  await loadQuestionSets()
}

const loadQuestionSets = async () => {
  questionSets.value = await questionSetService.getBySubjectId(subjectId)
}

const handleAddQuestionSet = async () => {
  if (!newSetName.value.trim() || !selectedExamTypeId.value) return
  
  await questionSetService.create(
    subjectId,
    selectedExamTypeId.value,
    newSetName.value,
    newSetDesc.value
  )
  
  newSetName.value = ''
  newSetDesc.value = ''
  await loadQuestionSets()
}

// Điều hướng sang trang Soạn thảo câu hỏi
const openQuestionEditor = (setId: string) => {
  router.push({ name: 'question-editor', params: { setId } })
}

// Điều hướng sang trang Làm bài thi
const startQuiz = (setId: string) => {
  router.push({ name: 'quiz-execution', params: { setId } })
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="max-w-4xl mx-auto p-6 mt-8 bg-white rounded-xl shadow-sm border border-gray-100" v-if="subject">
    
    <!-- Điều hướng Breadcrumb -->
    <div class="mb-6 flex items-center gap-2 text-sm font-semibold text-gray-500">
      <router-link to="/" class="hover:text-indigo-600 transition-colors">🏠 Trang chủ</router-link>
      <span>/</span>
      <span class="text-indigo-600">{{ subject.name }}</span>
    </div>

    <h1 class="text-2xl font-bold mb-2 text-indigo-600">Bộ đề: {{ subject.name }}</h1>
    <p class="text-gray-500 mb-6 pb-4 border-b">Quản lý các bộ đề thuộc môn học này.</p>

    <!-- Form Thêm Bộ đề -->
    <div class="flex flex-col gap-3 mb-8 p-5 bg-indigo-50/50 rounded-lg border border-indigo-100">
      <div class="flex flex-col md:flex-row gap-3">
        <select v-model="selectedExamTypeId" class="w-full md:w-1/3 p-2.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option v-for="type in examTypes" :key="type.id" :value="type.id">
            {{ type.name }}
          </option>
        </select>
        <input v-model="newSetName" @keyup.enter="handleAddQuestionSet" type="text" placeholder="Tên bộ đề (VD: Thi thử số 1)..." class="w-full md:w-2/3 p-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
      <input v-model="newSetDesc" @keyup.enter="handleAddQuestionSet" type="text" placeholder="Ghi chú (Tùy chọn)..." class="p-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      <button @click="handleAddQuestionSet" class="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-md transition-colors w-full md:w-auto self-start">
        Tạo Bộ Đề Mới
      </button>
    </div>

    <!-- Danh sách Bộ đề -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div v-if="questionSets.length === 0" class="col-span-full text-center text-gray-400 py-6 border-2 border-dashed border-gray-200 rounded-lg">
        Môn học này chưa có bộ đề nào.
      </div>

      <div v-for="set in questionSets" :key="set.id" class="p-5 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors bg-white shadow-sm flex flex-col justify-between">
        <div>
          <span class="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-md mb-2">
            {{ examTypes.find(t => t.id === set.examTypeId)?.name }}
          </span>
          <h3 class="font-bold text-lg text-gray-800 mb-1">{{ set.name }}</h3>
          <p class="text-sm text-gray-500 line-clamp-2">{{ set.description || 'Không có ghi chú' }}</p>
        </div>
        
        <!-- Các nút hành động điều hướng -->
        <div class="flex gap-2 mt-4">
          <button @click="openQuestionEditor(set.id)" class="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2 rounded text-sm transition-colors border border-indigo-100">
            Sửa đề
          </button>
          <button @click="startQuiz(set.id)" class="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded text-sm transition-colors shadow-sm">
            Làm bài ⚡
          </button>
        </div>
      </div>
    </div>
    
  </div>
</template>