// src/core/database/db.ts
import Dexie, { type Table } from 'dexie';
import type {
  Subject, ExamType, QuestionSet, SourceDocument, Question,
  QuestionStat, StudySession, ImportBatch, ImportLog
} from './types';

export class QuizDatabase extends Dexie {
  subjects!: Table<Subject, string>;
  examTypes!: Table<ExamType, string>;
  questionSets!: Table<QuestionSet, string>;
  sourceDocuments!: Table<SourceDocument, string>;
  questions!: Table<Question, string>;
  questionStats!: Table<QuestionStat, string>;
  studySessions!: Table<StudySession, string>;
  importBatches!: Table<ImportBatch, string>;
  importLogs!: Table<ImportLog, string>;

  constructor() {
    super('PersonalQuizAppDB');
    
    // Khai báo Primary Key và Indexes theo đặc tả V1.8
    this.version(1).stores({
      subjects: 'id, name, createdAt',
      examTypes: 'id, displayOrder',
      questionSets: 'id, subjectId, examTypeId',
      sourceDocuments: 'id, fileHash',
      questions: 'id, subjectId, questionSetId, verificationStatus, contentNormalizedHash',
      questionStats: 'questionId, hasAnswered',
      studySessions: 'id, questionSetId, status',
      importBatches: 'id, status',
      importLogs: 'id, batchId, errorType'
    });
  }
}

// Khởi tạo instance duy nhất (Singleton) để dùng toàn cục
export const db = new QuizDatabase();