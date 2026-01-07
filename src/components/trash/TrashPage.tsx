import { useEffect } from 'react'
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react'
import { useTodoStore } from '@/stores/todoStore'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale/zh-CN'

interface TrashPageProps {
  isOpen: boolean
  onClose: () => void
}

export function TrashPage({ isOpen, onClose }: TrashPageProps) {
  const { deletedTodos, fetchDeletedTodos, restoreTodo, permanentDeleteTodo, emptyTrash } = useTodoStore()

  useEffect(() => {
    if (isOpen) {
      fetchDeletedTodos()
    }
  }, [isOpen, fetchDeletedTodos])

  const handleRestore = async (id: string) => {
    await restoreTodo(id)
    await fetchDeletedTodos()
  }

  const handlePermanentDelete = async (id: string) => {
    // 临时移除确认对话框，直接执行
    await permanentDeleteTodo(id)
    await fetchDeletedTodos()
  }

  const handleEmptyTrash = async () => {
    // 临时移除确认对话框，直接执行
    await emptyTrash()
    await fetchDeletedTodos()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700'
      case 'low':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return '高'
      case 'medium':
        return '中'
      case 'low':
        return '低'
      default:
        return '中'
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">回收站</h2>
          <button
            onClick={onClose}
            type="button"
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {deletedTodos.length === 0 ? (
            <div className="text-center py-12">
              <Trash2 size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">回收站为空</p>
              <p className="text-sm text-gray-400 mt-2">删除的待办会显示在这里</p>
            </div>
          ) : (
            <div>
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500">
                  共 {deletedTodos.length} 个已删除的待办
                </p>
                <button
                  onClick={() => handleEmptyTrash()}
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
                >
                  <Trash2 size={16} />
                  清空回收站
                </button>
              </div>

              {/* List */}
              <div className="space-y-2">
                {deletedTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-medium truncate ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                            {todo.title}
                          </h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ${getPriorityColor(todo.priority)}`}>
                            {getPriorityText(todo.priority)}
                          </span>
                        </div>
                        {todo.description && (
                          <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                            {todo.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>删除于 {formatDistanceToNow(todo.deletedAt!, { addSuffix: true, locale: zhCN })}</span>
                          {todo.dueDate && (
                            <span>截止: {new Date(todo.dueDate).toLocaleDateString('zh-CN')}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleRestore(todo.id)}
                          type="button"
                          className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                          title="恢复"
                        >
                          <RotateCcw size={18} />
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(todo.id)}
                          type="button"
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                          title="永久删除"
                        >
                          <AlertTriangle size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Info */}
              <div className="mt-4 p-3 bg-yellow-50 rounded-md flex items-start gap-2">
                <AlertTriangle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-800">
                  回收站中的待办会被保留。你可以恢复它们或永久删除。永久删除后无法恢复。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
