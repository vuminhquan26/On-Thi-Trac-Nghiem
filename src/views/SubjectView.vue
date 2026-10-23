<script setup lang="ts">
// 1. TẤT CẢ IMPORT PHẢI NẰM Ở ĐÂY
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { subjectService } from '@/core/services/subject.service'
import type { Subject } from '@/core/database/types'
import { syncService } from '@/core/services/sync.service' // <-- Đã được dời lên trên cùng!

const router = useRouter()

const subjects = ref<Subject[]>([])
const newSubName = ref('')
const newSubDesc = ref('')

const loadSubjects = async () => {
  subjects.value = await subjectService.getAll()
}

const handleAddSubject = async () => {
  if (!newSubName.value.trim()) return
  
  try {
    // Lưu ý: Nếu báo lỗi "subjectService.create is not a function", 
    // hãy thử đổi chữ 'create' thành 'add' tùy vào cách bạn viết trong subject.service.ts
    await subjectService.create(newSubName.value, newSubDesc.value)
    
    newSubName.value = ''
    newSubDesc.value = ''
    await loadSubjects()
  } catch (error) {
    console.error("Lỗi khi thêm:", error)
    alert("Lỗi thêm môn học: Kiểm tra Console F12 để xem chi tiết")
  }
}

const handleDeleteSubject = async (id: string) => {
  if (!confirm('Bạn có chắc muốn xóa môn học này?')) return
  await subjectService.delete(id)
  await loadSubjects()
}

const openSubjectDetail = (subject: Subject) => {
  router.push({ name: 'question-sets', params: { subjectId: subject.id } })
}

// Xử lý Export
const handleExport = async () => {
  await syncService.exportData();
}

// Xử lý Import bằng input file ẩn
const fileInput = ref<HTMLInputElement | null>(null)
const handleImportClick = () => {
  fileInput.value?.click();
}
const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (!confirm('Việc import sẽ ghi đè và gộp dữ liệu. Bạn có chắc chắn?')) {
    target.value = ''; // Reset input
    return;
  }

  try {
    await syncService.importData(file);
    alert('Phục hồi dữ liệu thành công!');
    await loadSubjects(); 
  } catch (e) {
    alert('File không hợp lệ hoặc lỗi import!');
  } finally {
    target.value = '';
  }
}

onMounted(() => {
  loadSubjects()
})
</script>

<template>
  <div class="max-w-4xl mx-auto p-6 mt-8 bg-white rounded-xl shadow-sm border border-gray-100">
    <!-- Breadcrumb -->
    <div class="mb-6 flex items-center gap-2 text-sm font-semibold text-gray-500">
      <span class="text-indigo-600">🏠 Trang chủ</span>
    </div>

    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-indigo-600">Quản lý Môn học</h1>
      
      <!-- CỤM NÚT BACKUP & RESTORE -->
      <div class="flex gap-2">
        <button @click="handleExport" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-2">
          📥 Backup (Xuất JSON)
        </button>
        <button @click="handleImportClick" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-2">
          📤 Phục hồi (Nhập file)
        </button>
        <input type="file" accept=".json" ref="fileInput" @change="handleFileChange" class="hidden" />
      </div>
    </div>
    
    <!-- Form thêm mới -->
    <div class="flex flex-col md:flex-row gap-3 mb-8 p-5 bg-indigo-50/50 rounded-lg border border-indigo-100">
      <input v-model="newSubName" @keyup.enter="handleAddSubject" type="text" placeholder="Tên môn học..." class="flex-1 p-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      <input v-model="newSubDesc" @keyup.enter="handleAddSubject" type="text" placeholder="Mô tả..." class="flex-1 p-2.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      <button type="button" @click="handleAddSubject" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-md">Thêm</button>
    </div>
    
    <!-- Danh sách dạng Card -->
    <div class="space-y-3">
      <div v-if="subjects.length === 0" class="text-center text-gray-400 py-6 border-2 border-dashed rounded-lg">
        Chưa có môn học nào.
      </div>
      
      <div 
        v-for="subject in subjects" :key="subject.id" 
        class="flex justify-between items-center p-4 border border-gray-100 rounded-lg hover:shadow-md bg-white group cursor-pointer transition-shadow" 
        @click="openSubjectDetail(subject)"
      >
        <div>
          <h3 class="font-bold text-lg text-gray-800 group-hover:text-indigo-600">{{ subject.name }}</h3>
          <p class="text-sm text-gray-500">{{ subject.description }}</p>
        </div>
        <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button class="text-indigo-600 bg-indigo-50 px-4 py-2 rounded-md hover:bg-indigo-100 font-medium">Vào xem</button>
          <button @click.stop="handleDeleteSubject(subject.id)" class="text-red-500 bg-red-50 px-4 py-2 rounded-md hover:bg-red-100 font-medium">Xóa</button>
        </div>
      </div>
    </div>
  </div>
</template>