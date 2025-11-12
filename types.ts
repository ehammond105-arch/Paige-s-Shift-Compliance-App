
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

export interface GithubDb {
  checklists: Checklist[];
  submissions: Submission[];
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
}

export interface ManagerEditorProps {
    checklists: Checklist[];
    onUpdateChecklists: (newChecklists: Checklist[]) => Promise<void>;
}

export interface ManagerActivityLogProps {
    submissions: Submission[];
}

export interface TemperatureLogFormProps {
  tempLogs: TempLogs;
  listId: string;
  onTempChange: (key: string, value: string, listId: string) => void;
}