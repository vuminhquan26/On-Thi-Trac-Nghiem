<!-- src/App.vue -->
<script setup lang="ts">
// Logic đã được chuyển hết vào các file trong thư mục views!
</script>

<template>
  <!-- Gỡ bỏ các class flex, chỉ giữ lại màu nền và font chữ -->
  <div class="min-h-screen bg-gray-50 text-gray-800 font-sans pb-12">
    
    <router-view></router-view>

    <!-- Chữ ký tự động nối tiếp ngay dưới nội dung với khoảng cách mt-8 -->
    <footer class="w-full text-center mt-8 text-sm text-gray-400 font-medium">
      <p>
        Developed with <span class="text-red-500">❤️</span> by 
        <span class="font-bold text-indigo-500 cursor-default">Vũ Minh Quân</span>
      </p>
      
      <!-- Nút liên kết Mạng xã hội & Portfolio -->
      <div class="flex items-center justify-center gap-3.5 mt-2.5 mb-2.5 text-xs font-semibold">
        <a href="https://www.facebook.com/vu.minh.quan.10022006" target="_blank" class="text-blue-500 hover:text-blue-600 hover:underline transition-all">Facebook</a>
        <span class="w-1 h-1 rounded-full bg-gray-300"></span>
        <a href="https://www.instagram.com/itsvuminhquan" target="_blank" class="text-pink-500 hover:text-pink-600 hover:underline transition-all">Instagram</a>
        <span class="w-1 h-1 rounded-full bg-gray-300"></span>
        <a href="https://github.com/vuminhquan26" target="_blank" class="text-gray-600 hover:text-gray-900 hover:underline transition-all">GitHub</a>
        <span class="w-1 h-1 rounded-full bg-gray-300"></span>
        <a href="https://vuminhquan.id.vn/" target="_blank" class="text-teal-500 hover:text-teal-600 hover:underline transition-all">Website</a>
      </div>

      <!-- Thông tin tổ chức -->
      <div class="flex items-center justify-center gap-2 opacity-75 text-xs">
        <span>HUCE • K69 CNTT</span>
        <span class="w-1 h-1 rounded-full bg-gray-300"></span>
        <span>Chuồng Bò Community</span>
      </div>
    </footer>

  </div>
</template>