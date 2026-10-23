// src/core/services/question.service.ts
import { db } from '@/core/database/db';
import type { Question } from '@/core/database/types';

export const questionService = {
  // Tạo câu hỏi cơ bản
  async create(
    questionSetId: string, 
    subjectId: string, 
    content: string, 
    type: Question['questionType'] = 'multiple_choice'
  ): Promise<Question> {
    // Tính toán thứ tự mặc định (để câu hỏi mới nằm cuối danh sách)
    const currentCount = await db.questions.where('questionSetId').equals(questionSetId).count();

    const newQuestion: Question = {
      id: crypto.randomUUID(),
      subjectId,
      questionSetId,
      chapterOrTopic: '',
      questionType: type,
      content,
      options: [], 
      correctOptionIds: [],
      suggestedOptionIds: [],
      verificationStatus: 'unverified',
      explanation: '',
      editorialNote: '',
      suggestedContent: null,
      dataWarnings: [],
      sourceReferences: [],
      contentNormalizedHash: crypto.randomUUID(), // Sẽ xử lý băm nội dung sau
      defaultOrder: currentCount + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null
    };
    
    await db.questions.add(newQuestion);
    return newQuestion;
  },

  // Lấy danh sách câu hỏi theo bộ đề (sắp xếp theo defaultOrder)
  async getByQuestionSetId(questionSetId: string): Promise<Question[]> {
    return await db.questions
      .where('questionSetId')
      .equals(questionSetId)
      .sortBy('defaultOrder');
  },
  // 3. Thêm một đáp án mới vào câu hỏi
  async addOption(questionId: string, text: string): Promise<void> {
    const q = await db.questions.get(questionId);
    if (!q) return;
    
    q.options.push({ id: crypto.randomUUID(), originalLabel: null, text });
    await db.questions.update(questionId, { 
      options: q.options, 
      updatedAt: new Date().toISOString() 
    });
  },

  // 4. Bật/Tắt trạng thái đúng của một đáp án (Hỗ trợ Multiple Choice)
  async toggleCorrectAnswer(questionId: string, optionId: string): Promise<void> {
    const q = await db.questions.get(questionId);
    if (!q) return;

    let newCorrectIds = [...q.correctOptionIds];
    if (newCorrectIds.includes(optionId)) {
      newCorrectIds = newCorrectIds.filter(id => id !== optionId); // Bỏ chọn
    } else {
      newCorrectIds.push(optionId); // Chọn làm đáp án đúng
    }

    await db.questions.update(questionId, { 
      correctOptionIds: newCorrectIds, 
      updatedAt: new Date().toISOString() 
    });
  },
  
  // 5. Xóa một đáp án
  async deleteOption(questionId: string, optionId: string): Promise<void> {
    const q = await db.questions.get(questionId);
    if (!q) return;
    
    const options = q.options.filter(opt => opt.id !== optionId);
    const correctOptionIds = q.correctOptionIds.filter(id => id !== optionId);
    
    await db.questions.update(questionId, { 
      options, 
      correctOptionIds, 
      updatedAt: new Date().toISOString() 
    });
  },
  // 6. Xóa toàn bộ câu hỏi
  async delete(id: string): Promise<void> {
    await db.questions.delete(id);
  }
};