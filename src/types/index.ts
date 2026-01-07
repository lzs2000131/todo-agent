// 待办项
export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  categoryId?: string;
  tags: string[];
  dueDate?: Date;
  reminder?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 分类
export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

// 用户设置
export interface Settings {
  openaiApiKey?: string;
  openaiBaseUrl?: string;
  openaiModel?: string;
  s3Config?: {
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  screenshotShortcut: string;
  theme: 'light' | 'dark' | 'system';
  syncEnabled: boolean;
}
