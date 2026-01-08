// 附件
export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'file';
  data: string; // base64 encoded
  createdAt: Date;
}

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
  screenshot?: string; // 保留兼容旧数据
  attachments?: Attachment[]; // 新的附件列表
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// 截图识别队列项
export interface ScreenshotQueueItem {
  id: string;
  imageData: Uint8Array;
  extractedTodos: ExtractedTodo[];
  isExtracting: boolean;
  error?: string;
  createdAt: Date;
}

// AI 提取的待办项
export interface ExtractedTodo {
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  tags?: string[];
  dueDate?: string;
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
  openaiCustomPrompt?: string; // 用户自定义提示词
  openaiCustomHeaders?: Record<string, string>; // 自定义 headers
  openaiCustomBody?: Record<string, unknown>; // 自定义 body
  ossConfig?: {
    endpoint: string;
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  screenshotShortcut: string;
  theme: 'light' | 'dark' | 'system';
  syncEnabled: boolean;
}
