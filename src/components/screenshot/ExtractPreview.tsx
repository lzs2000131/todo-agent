import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { ExtractedTodo } from '@/services/openai';

interface ExtractPreviewProps {
  todos: ExtractedTodo[];
  onConfirm: (todos: ExtractedTodo[]) => void;
  onCancel: () => void;
}

export function ExtractPreview({ todos, onConfirm, onCancel }: ExtractPreviewProps) {
  const [selectedTodos, setSelectedTodos] = useState<Set<number>>(
    new Set(todos.map((_, index) => index))
  );

  const toggleTodo = (index: number) => {
    const newSelected = new Set(selectedTodos);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTodos(newSelected);
  };

  const handleConfirm = () => {
    const selectedTodosList = todos.filter((_, index) =>
      selectedTodos.has(index)
    );
    onConfirm(selectedTodosList);
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700',
  };

  const priorityLabels = {
    high: '高',
    medium: '中',
    low: '低',
  };

  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
        <p className="text-gray-600">未识别到待办事项</p>
        <p className="text-sm text-gray-400 mt-1">
          请尝试截图包含任务清单的内容
        </p>
        <Button onClick={onCancel} variant="outline" className="mt-4">
          关闭
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 待办列表 */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {todos.map((todo, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedTodos.has(index)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onClick={() => toggleTodo(index)}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                  selectedTodos.has(index)
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-gray-300'
                }`}
              >
                {selectedTodos.has(index) && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900">{todo.title}</h4>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      priorityColors[todo.priority]
                    }`}
                  >
                    {priorityLabels[todo.priority]}
                  </span>
                </div>
                {todo.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {todo.description}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {todo.tags && todo.tags.length > 0 && (
                    <div className="flex gap-1">
                      {todo.tags.map((tag, i) => (
                        <span key={i} className="text-blue-600">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {todo.dueDate && (
                    <span>截止: {todo.dueDate}</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          已选择 {selectedTodos.size} / {todos.length} 个待办
        </p>
        <div className="flex gap-2">
          <Button onClick={onCancel} variant="outline">
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedTodos.size === 0}
          >
            添加待办
          </Button>
        </div>
      </div>
    </div>
  );
}
