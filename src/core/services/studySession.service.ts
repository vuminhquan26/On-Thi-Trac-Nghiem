import { db } from '@/core/database/db';
import type { StudySession, QuestionResponse } from '@/core/database/types';

export const studySessionService = {
  async getActiveSession(setId: string): Promise<StudySession | undefined> {
    return await db.studySessions
      .where('questionSetId').equals(setId)
      .and(session => session.status === 'in_progress')
      .first();
  },

  async createSession(setId: string): Promise<StudySession | undefined> {
    const questions = await db.questions.where('questionSetId').equals(setId).toArray();
    if (questions.length === 0) return undefined;

    // LOG KIỂM TRA: Sẽ in ra F12 nếu code thực sự chạy
    console.log("=== ĐANG TẠO BÀI MỚI VÀ XÁO TRỘN ===");

    // 1. Xáo trộn ID câu hỏi
    let questionOrderIds = questions.map(q => q.id);
    for (let i = questionOrderIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questionOrderIds[i], questionOrderIds[j]] = [questionOrderIds[j], questionOrderIds[i]];
    }
    console.log("Thứ tự câu hỏi mới:", questionOrderIds);

    const initialResponses: Record<string, QuestionResponse> = {};
    questions.forEach(q => {
      // 2. Xáo trộn đáp án
      const shuffledOptions = [...q.options];
      for (let i = shuffledOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
      }

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

  async recordAnswer(sessionId: string, questionId: string, selectedOptionIds: string[]): Promise<void> {
    const session = await db.studySessions.get(sessionId);
    if (session) {
      session.responses[questionId].selectedOptionIds = [...selectedOptionIds];
      await db.studySessions.put(session);
    }
  },

  async finishSession(sessionId: string): Promise<StudySession | undefined> {
    const session = await db.studySessions.get(sessionId);
    if (!session) return;

    session.status = 'completed';
    session.endedAt = new Date().toISOString();
    
    Object.keys(session.responses).forEach(qId => {
      const response = session.responses[qId];
      const correctIds = response.snapshot.correctOptionIds || [];
      const selectedIds = response.selectedOptionIds || [];

      const isCorrect = correctIds.length > 0 && 
        correctIds.length === selectedIds.length && 
        correctIds.every(id => selectedIds.includes(id));

      if (selectedIds.length === 0) response.currentOutcome = 'skipped';
      else if (isCorrect) response.currentOutcome = 'correct';
      else response.currentOutcome = 'incorrect';
    });
    
    await db.studySessions.put(session);
    return session;
  },
  
  async getSessionById(sessionId: string): Promise<StudySession | undefined> {
    return await db.studySessions.get(sessionId);
  }
};