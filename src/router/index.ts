// src/router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'subjects',
      component: () => import('@/views/SubjectView.vue')
    },
    {
      path: '/subject/:subjectId',
      name: 'question-sets',
      component: () => import('@/views/QuestionSetView.vue')
    },
    {
      path: '/set/:setId/edit',
      name: 'question-editor',
      component: () => import('@/views/QuestionEditorView.vue')
    },
    {
      path: '/set/:setId/quiz',
      name: 'quiz-execution',
      component: () => import('@/views/QuizExecutionView.vue')
    },
    {
      path: '/session/:sessionId/result',
      name: 'quiz-result',
      component: () => import('@/views/QuizResultView.vue')
    }
  ]
})

export default router