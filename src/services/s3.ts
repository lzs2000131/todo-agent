import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import type { Todo, Category } from '@/types';

interface S3Config {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

interface SyncData {
  todos: Todo[];
  categories: Category[];
  version: number;
  timestamp: string;
  deviceId: string;
}

/**
 * 创建S3客户端
 */
function createS3Client(config: S3Config): S3Client {
  return new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

/**
 * 获取设备ID
 */
function getDeviceId(): string {
  let deviceId = localStorage.getItem('device-id');
  if (!deviceId) {
    deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('device-id', deviceId);
  }
  return deviceId;
}

/**
 * 上传数据到S3
 */
export async function uploadToS3(
  config: S3Config,
  todos: Todo[],
  categories: Category[]
): Promise<void> {
  const s3Client = createS3Client(config);

  const syncData: SyncData = {
    todos,
    categories,
    version: Date.now(),
    timestamp: new Date().toISOString(),
    deviceId: getDeviceId(),
  };

  const key = 'todo-agent-data.json';

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: JSON.stringify(syncData, null, 2),
        ContentType: 'application/json',
      })
    );
    console.log('数据已备份到S3');
  } catch (error) {
    console.error('上传到S3失败:', error);
    throw new Error('云端备份失败');
  }
}

/**
 * 从S3下载数据
 */
export async function downloadFromS3(
  config: S3Config
): Promise<SyncData | null> {
  const s3Client = createS3Client(config);
  const key = 'todo-agent-data.json';

  try {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: config.bucket,
        Key: key,
      })
    );

    if (!response.Body) {
      return null;
    }

    const bodyString = await response.Body.transformToString();
    return JSON.parse(bodyString);
  } catch (error: any) {
    if (error.name === 'NoSuchKey') {
      console.log('S3中没有备份数据');
      return null;
    }
    console.error('从S3下载失败:', error);
    throw new Error('云端同步失败');
  }
}

/**
 * 同步数据(智能合并)
 */
export async function syncWithS3(
  config: S3Config,
  localTodos: Todo[],
  localCategories: Category[]
): Promise<{ todos: Todo[]; categories: Category[] } | null> {
  try {
    const remoteData = await downloadFromS3(config);

    if (!remoteData) {
      // S3上没有数据,上传本地数据
      await uploadToS3(config, localTodos, localCategories);
      return null;
    }

    // 比较本地和远程数据的版本
    const localVersion = Math.max(
      ...localTodos.map((t) => new Date(t.updatedAt).getTime()),
      0
    );

    if (remoteData.version > localVersion) {
      // 远程数据更新,使用远程数据
      console.log('使用云端数据(更新)');
      return {
        todos: remoteData.todos,
        categories: remoteData.categories,
      };
    } else {
      // 本地数据更新,上传到S3
      console.log('上传本地数据到云端');
      await uploadToS3(config, localTodos, localCategories);
      return null;
    }
  } catch (error) {
    console.error('同步失败:', error);
    throw error;
  }
}

/**
 * 合并冲突数据
 */
export function mergeData(
  localTodos: Todo[],
  remoteTodos: Todo[]
): Todo[] {
  const merged = new Map<string, Todo>();

  // 添加所有本地数据
  localTodos.forEach((todo) => {
    merged.set(todo.id, todo);
  });

  // 合并远程数据
  remoteTodos.forEach((remoteTodo) => {
    const localTodo = merged.get(remoteTodo.id);

    if (!localTodo) {
      // 远程有,本地没有,添加
      merged.set(remoteTodo.id, remoteTodo);
    } else {
      // 都有,比较更新时间
      const localTime = new Date(localTodo.updatedAt).getTime();
      const remoteTime = new Date(remoteTodo.updatedAt).getTime();

      if (remoteTime > localTime) {
        // 远程更新,使用远程版本
        merged.set(remoteTodo.id, remoteTodo);
      }
      // 否则保留本地版本
    }
  });

  return Array.from(merged.values());
}

/**
 * 启动自动备份
 * @param config S3配置
 * @param getTodos 获取待办列表的函数
 * @param getCategories 获取分类列表的函数
 * @param intervalMinutes 备份间隔(分钟)
 */
export function startAutoBackup(
  config: S3Config | undefined,
  getTodos: () => Todo[],
  getCategories: () => Category[],
  intervalMinutes: number = 60
): (() => void) | null {
  if (!config) {
    console.log('未配置S3,跳过自动备份');
    return null;
  }

  // 定时备份
  const interval = setInterval(() => {
    const todos = getTodos();
    const categories = getCategories();
    uploadToS3(config, todos, categories).catch(console.error);
  }, intervalMinutes * 60 * 1000);

  // 启动时立即备份一次
  const todos = getTodos();
  const categories = getCategories();
  uploadToS3(config, todos, categories).catch(console.error);

  // 返回清理函数
  return () => clearInterval(interval);
}
