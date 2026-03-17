export interface UserRecord {
  id?: string;
  name: string;
  role?: string;
  image?: string;
  color?: string;
}

export interface ClientRecord {
  id?: string;
  name: string;
  sector?: string;
  image?: string;
}

export interface ActivityLogRecord {
  id: string;
  taskId?: string;
  boardId?: string;
  actorName: string;
  actorImage?: string;
  action: string;
  createdAt: string;
  metadata?: Record<string, string | number | boolean | null>;
}
