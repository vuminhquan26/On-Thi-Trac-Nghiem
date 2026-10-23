// src/core/database/types.ts

export interface Subject { id: string; name: string; description: string; createdAt: string; updatedAt: string; }

export interface ExamType { id: string; name: string; displayOrder: number; isDefault: boolean; }

export interface QuestionSet { id: string; subjectId: string; examTypeId: string; name: string; description: string; createdAt: string; updatedAt: string; }

export interface SourceDocument { id: string; fileName: string; fileType: string; fileSize: number; fileHash: string; importedAt: string; totalSaved: number; }

export interface Question {
  id: string;
  subjectId: string;
  questionSetId: string;
  chapterOrTopic: string;
  questionType: 'single_choice' | 'multiple_choice' | 'essay' | 'unclassified';
  content: string;
  options: Array<{ id: string; originalLabel: string | null; text: string }>;
  correctOptionIds: string[]; 
  suggestedOptionIds: string[]; 
  verificationStatus: 'verified' | 'unverified' | 'needs_review'; 
  explanation: string;
  editorialNote: string;
  suggestedContent: string | null;
  dataWarnings: string[];
  sourceReferences: Array<{ sourceDocumentId: string; pageOrSection: string | null; originalNumber: string | null; formattingEvidence: string[]; }>;
  contentNormalizedHash: string;
  defaultOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null; 
}

export interface QuestionStat {
  questionId: string;
  validAttempts: number;
  wrongAttempts: number;
  wrongRate: number | null; 
  hasAnswered: boolean;
  lastAnsweredAt: string | null;
  lastResult: 'correct' | 'wrong' | 'unverified' | null;
}

export interface StudySession {
  id: string;
  questionSetId: string;
  status: 'in_progress' | 'completed'; 
  isExcludedFromStats: boolean;
  questionOrderIds: string[];
  optionOrderMap: Record<string, string[]>;
  order_lost: boolean;
  currentIndex: number;
  isShuffled: boolean;
  responses: Record<string, { 
    interactionType: 'quiz_answered' | 'flashcard_flipped' | 'none';
    selectedOptionIds: string[];
    isVerifiedAtAnswerTime: boolean; 
    currentOutcome: 'correct' | 'wrong' | 'unverified';
    statsApplied: 'none' | 'recorded_correct' | 'recorded_wrong';
    answeredAt: string | null; 
    snapshot: { 
      questionType: Question['questionType'];
      content: string;
      options: Array<{ id: string; text: string }>;
      displayOrder: string[]; 
      correctOptionIds: string[];
      suggestedOptionIds: string[];
      verificationStatus: Question['verificationStatus'];
      explanation: string;
    } | null;
  }>;
  startedAt: string;
  endedAt: string | null;
}

export interface ImportBatch { id: string; status: 'staging' | 'committed' | 'discarded'; rawBlocks: unknown[]; candidates: unknown[]; createdAt: string; updatedAt: string; }

export interface ImportLog { id: string; batchId: string; errorType: 'ORPHAN_SESSION' | 'CORRUPTED_DATA' | 'MIGRATION_FALLBACK'; payload: any; createdAt: string; }