import { invoke } from '@tauri-apps/api/core';
import type { Todo } from '@/types';

/**
 * 发送系统通知
 */
export async function sendNotification(title: string, body: string): Promise<void> {
  try {
    await invoke('send_notification', { title, body });
  } catch (error) {
    console.error('发送通知失败:', error);
    throw error;
  }
}

/**
 * 请求通知权限
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    return await invoke('request_notification_permission');
  } catch (error) {
    console.error('请求通知权限失败:', error);
    return false;
  }
}

/**
 * 为待办事项发送提醒通知
 */
export async function sendTodoReminder(todo: Todo): Promise<void> {
  const title = '待办提醒';
  let body = `${todo.title}`;

  if (todo.dueDate) {
    const dueDate = new Date(todo.dueDate);
    const now = new Date();
    const diffHours = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));

    if (diffHours <= 0) {
      body += ' - 已到期!';
    } else if (diffHours <= 24) {
      body += ` - 还有${diffHours}小时到期`;
    }
  }

  if (todo.priority === 'high') {
    body = '⚠️ ' + body;
  }

  await sendNotification(title, body);
}

/**
 * 检查并发送到期提醒
 */
export async function checkDueReminders(todos: Todo[]): Promise<void> {
  const now = new Date();

  for (const todo of todos) {
    if (todo.completed) continue;

    // 检查是否设置了提醒时间
    if (todo.reminder) {
      const reminderTime = new Date(todo.reminder);
      if (reminderTime <= now) {
        await sendTodoReminder(todo);
      }
    }

    // 检查截止日期
    if (todo.dueDate) {
      const dueDate = new Date(todo.dueDate);
      const diffHours = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));

      // 在截止前24小时、1小时提醒
      if (diffHours === 24 || diffHours === 1 || diffHours === 0) {
        await sendTodoReminder(todo);
      }
    }
  }
}

/**
 * 启动定时检查提醒
 * @param todos 待办列表
 * @param intervalMinutes 检查间隔(分钟)
 */
export function startReminderScheduler(
  getTodos: () => Todo[],
  intervalMinutes: number = 30
): () => void {
  // 每隔指定时间检查一次
  const interval = setInterval(() => {
    const todos = getTodos();
    checkDueReminders(todos).catch(console.error);
  }, intervalMinutes * 60 * 1000);

  // 启动时立即检查一次
  const todos = getTodos();
  checkDueReminders(todos).catch(console.error);

  // 返回清理函数
  return () => clearInterval(interval);
}
