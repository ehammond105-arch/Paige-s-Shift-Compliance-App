
export interface TempLogs {
  [key: string]: string;
}

export interface Checklist {
  id: string;
  name: string;
  tasks: string[];
}

export interface Submission {
  id: string;
  checklistId: string;
  checklistName: string;
  submitterId: string;
  employeeName: string;
  location: string;
  completionDate: string;
  completionTime: string;
  completedTasks: string[];
  totalTasks: number;
  timestamp: string; // Changed from Firebase Timestamp to ISO string
  notificationEmail: string;
  tempLogs: TempLogs | null;
}

export interface Report {
    id: string;
    content: string;
    submittedBy: string; // email or uid
    timestamp: string;
    type: string;
    role?: string;
    storeId?: string;
}

export interface GithubDb {
  checklists: Checklist[];
  submissions: Submission[];
  reports?: Report[];
}

export interface GithubState {
  db: GithubDb | null;
  userId: string | null;
  isLoading: boolean;
  error: string | null;
  updateDb: (newDb: GithubDb) => Promise<void>;
}

export interface AppProps {}

export interface EmployeeDashboardProps {
  userId: string | null;
  checklists: Checklist[];
  onAddSubmission: (submission: Omit<Submission, 'id' | 'timestamp'>) => Promise<void>;
}

export interface ManagerAccessProps {
  db: GithubDb;
  onUpdateDb: (newDb: GithubDb) => Promise<void>;
  user: User | null;
}

export interface ManagerEditorProps {
    checklists: Checklist[];
    onUpdateChecklists: (newChecklists: Checklist[]) => Promise<void>;
}

export interface ManagerActivityLogProps {
    submissions: Submission[];
    reports?: Report[];
}

export interface TemperatureLogFormProps {
  tempLogs: TempLogs;
  listId: string;
  onTempChange: (key: string, value: string, listId: string) => void;
}

export type UserRole = 'owner' | 'manager' | 'employee';

export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL?: string | null;
    emailVerified: boolean;
    role?: UserRole;
    isActive?: boolean;
    storeId?: string;
}

export interface FileRecord {
    id: string;
    name: string;
    url: string;
    path: string;
    type: string;
    size: number;
    createdAt: string;
    notes: string;
    aiSummary: string;
}

export interface Store {
    id: string;
    storeName: string;
    location: string;
    ownerUid: string;
}

export interface OwnerDashboardProps {
    submissions: Submission[];
    reports?: Report[];
}
