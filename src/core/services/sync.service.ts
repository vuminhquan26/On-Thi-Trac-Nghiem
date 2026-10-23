import { db } from '@/core/database/db';

export const syncService = {
  // 1. Xuất toàn bộ dữ liệu ra file JSON
  async exportData(): Promise<void> {
    const data = {
      subjects: await db.subjects.toArray(),
      examTypes: await db.examTypes.toArray(),
      questionSets: await db.questionSets.toArray(),
      questions: await db.questions.toArray(),
      studySessions: await db.studySessions.toArray(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  },

  // 2. Nhập dữ liệu từ file JSON
  async importData(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);

          // Xóa dữ liệu cũ và nạp dữ liệu mới
          await db.transaction('rw', db.subjects, db.examTypes, db.questionSets, db.questions, db.studySessions, async () => {
            if (data.subjects) await db.subjects.bulkPut(data.subjects);
            if (data.examTypes) await db.examTypes.bulkPut(data.examTypes);
            if (data.questionSets) await db.questionSets.bulkPut(data.questionSets);
            if (data.questions) await db.questions.bulkPut(data.questions);
            if (data.studySessions) await db.studySessions.bulkPut(data.studySessions);
          });
          resolve();
        } catch (error) {
          console.error('Lỗi khi import:', error);
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  }
};