import { ref } from 'vue'

// Khởi tạo trạng thái từ localStorage
export const isDarkMode = ref(localStorage.getItem('theme') === 'dark')

export const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
  
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export const initTheme = () => {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}