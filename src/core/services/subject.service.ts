// src/core/services/subject.service.ts
import { db } from '@/core/database/db';
import type { Subject } from '@/core/database/types';

export const subjectService = {

  async create(name: string, description: string = ''): Promise<string> {
    const now = new Date().toISOString();
    const newSubject: Subject = {
      id: crypto.randomUUID(),
      name,
      description,
      createdAt: now,
      updatedAt: now
    };
    await db.subjects.add(newSubject);
    return newSubject.id;
  },
  // 1. Tạo một phiên làm bài mới (Bắt đầu thi)
  async createSession(setId: string): Promise<StudySession | undefined> {
    const questions = await db.questions.where('questionSetId').equals(setId).toArray();
    if (questions.length === 0) return undefined;

    // 1. XÁO TRỘN THỨ TỰ CÂU HỎI
    let questionOrderIds = questions.map(q => q.id);
    for (let i = questionOrderIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questionOrderIds[i], questionOrderIds[j]] = [questionOrderIds[j], questionOrderIds[i]];
    }

    const initialResponses: Record<string, QuestionResponse> = {};
    
    questions.forEach(q => {
      // 2. XÁO TRỘN ĐÁP ÁN BÊN TRONG TỪNG CÂU HỎI
      const shuffledOptions = [...q.options]; // Clone mảng đáp án để không ảnh hưởng dữ liệu gốc
      for (let i = shuffledOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
      }

      // Tạo bản sao lưu câu hỏi (snapshot) với các đáp án đã xáo trộn
      const questionSnapshot = { ...q, options: shuffledOptions };

      initialResponses[q.id] = {
        questionId: q.id,
        selectedOptionIds: [],
        snapshot: questionSnapshot, 
        currentOutcome: 'unverified'
      };
    });

    const newSession: StudySession = {
      id: crypto.randomUUID(),
      questionSetId: setId,
      startedAt: new Date().toISOString(),
      status: 'in_progress',
      questionOrderIds,
      currentIndex: 0,
      responses: initialResponses
    };

    await db.studySessions.add(newSession);
    return newSession;
  },

  // 2. Lấy danh sách tất cả môn học (Sắp xếp mới nhất lên đầu)
  async getAll(): Promise<Subject[]> {
    return await db.subjects.orderBy('createdAt').reverse().toArray();
  },

  // 3. Lấy chi tiết một môn học theo ID
  async getById(id: string): Promise<Subject | undefined> {
    return await db.subjects.get(id);
  },

  // 4. Cập nhật thông tin môn học
  async update(id: string, updates: Partial<Pick<Subject, 'name' | 'description'>>): Promise<number> {
    const updatedAt = new Date().toISOString();
    return await db.subjects.update(id, { ...updates, updatedAt });
  },

  // 5. Xóa môn học
  // Lưu ý: Tạm thời xóa đơn giản. Về sau khi có bảng questionSets, ta sẽ bọc trong transaction để xóa cascade.
  async delete(id: string): Promise<void> {
    await db.subjects.delete(id);
  }
};