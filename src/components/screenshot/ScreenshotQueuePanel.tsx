import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Check, Trash2, Image, AlertCircle } from 'lucide-react';
import { useScreenshotQueueStore } from '@/stores/screenshotQueueStore';
import { useTodoStore } from '@/stores/todoStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { Button } from '@/components/ui/Button';
import type { ExtractedTodo } from '@/types';

// 将 Uint8Array 转换为 base64
function uint8ArrayToBase64(data: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary);
}

export function ScreenshotQueuePanel() {
  const { queue, isQueueOpen, closeQueue, removeFromQueue, clearQueue } = useScreenshotQueueStore();
  const { addTodo } = useTodoStore();
  const { categories } = useCategoryStore();

  // 根据 tag 名称找到对应的 categoryId
  const findCategoryId = (tags?: string[]): string | undefined => {
    if (!tags || tags.length === 0) return undefined;
    // 取第一个匹配的 tag 作为 categoryId
    for (const tag of tags) {
      const category = categories.find((c) => c.name === tag);
      if (category) return category.id;
    }
    return undefined;
  };

  const isAllDone = useMemo(() => {
    return queue.length > 0 && queue.every((item) => !item.isExtracting);
  }, [queue]);

  const totalTodos = useMemo(() => {
    return queue.reduce((sum, item) => sum + item.extractedTodos.length, 0);
  }, [queue]);

  const handleConfirmAll = async () => {
    for (const item of queue) {
      const screenshotBase64 = uint8ArrayToBase64(item.imageData);

      for (const todo of item.extractedTodos) {
        await addTodo({
          title: todo.title,
          description: todo.description,
          completed: false,
          priority: todo.priority,
          tags: todo.tags || [],
          categoryId: findCategoryId(todo.tags),
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
          screenshot: screenshotBase64,
        });
      }
    }
    clearQueue();
  };

  const handleConfirmSingle = async (item: typeof queue[0], todo: ExtractedTodo) => {
    const screenshotBase64 = uint8ArrayToBase64(item.imageData);

    await addTodo({
      title: todo.title,
      description: todo.description,
      completed: false,
      priority: todo.priority,
      tags: todo.tags || [],
      categoryId: findCategoryId(todo.tags),
      dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
      screenshot: screenshotBase64,
    });

    // 从队列项中移除已确认的 todo
    const updatedTodos = item.extractedTodos.filter((t) => t !== todo);
    if (updatedTodos.length === 0) {
      removeFromQueue(item.id);
    } else {
      useScreenshotQueueStore.getState().updateQueueItem(item.id, {
        extractedTodos: updatedTodos,
      });
    }
  };

  if (!isQueueOpen || queue.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed right-4 top-20 bottom-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-gray-900">截图识别队列</h3>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {queue.length} 张截图
            </span>
          </div>
          <button
            onClick={closeQueue}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Queue List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {queue.map((item, index) => (
            <div
              key={item.id}
              className="bg-gray-50 rounded-xl p-3 space-y-3"
            >
              {/* Screenshot Preview */}
              <div className="flex items-start gap-3">
                <img
                  src={`data:image/png;base64,${uint8ArrayToBase64(item.imageData)}`}
                  alt={`截图 ${index + 1}`}
                  className="w-20 h-14 object-cover rounded-lg border border-gray-200"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      截图 {index + 1}
                    </span>
                    <button
                      onClick={() => removeFromQueue(item.id)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>
                  {item.isExtracting ? (
                    <div className="flex items-center gap-1.5 text-xs text-primary mt-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      识别中...
                    </div>
                  ) : item.error ? (
                    <div className="flex items-center gap-1.5 text-xs text-red-500 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {item.error}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 mt-1">
                      识别到 {item.extractedTodos.length} 个待办
                    </div>
                  )}
                </div>
              </div>

              {/* Extracted Todos */}
              {item.extractedTodos.length > 0 && (
                <div className="space-y-2">
                  {item.extractedTodos.map((todo, todoIndex) => (
                    <div
                      key={todoIndex}
                      className="flex items-start gap-2 bg-white p-2 rounded-lg border border-gray-100"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-900 font-medium truncate">
                          {todo.title}
                        </div>
                        {todo.description && (
                          <div className="text-xs text-gray-500 truncate mt-0.5">
                            {todo.description}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded ${
                              todo.priority === 'high'
                                ? 'bg-red-100 text-red-700'
                                : todo.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低'}
                          </span>
                          {todo.dueDate && (
                            <span className="text-xs text-gray-500">
                              {todo.dueDate}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleConfirmSingle(item, todo)}
                        className="p-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
                        title="添加此待办"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <div className="text-xs text-gray-500 text-center">
            共 {totalTodos} 个待办事项待确认
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={clearQueue}
            >
              全部取消
            </Button>
            <Button
              className="flex-1"
              onClick={handleConfirmAll}
              disabled={!isAllDone || totalTodos === 0}
            >
              {!isAllDone ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  识别中...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1.5" />
                  全部添加
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
