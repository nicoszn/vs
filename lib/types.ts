export interface Participant {
  id: string;
  fullName: string;
  nickname: string;
  avatarUrl: string; // not used, we generate initials
  socialLinks: {
    instagram?: string;
    twitter?: string;
  };
  voteCount: number;
  isVisible: boolean;
  sortOrder: number;
}

export interface RateHistoryEntry {
  rate: number;
  timestamp: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}
