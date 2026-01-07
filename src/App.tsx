import { useEffect, useState } from 'react'
import { Settings, Camera } from 'lucide-react'
import { TodoForm } from './components/todo/TodoForm'
import { TodoList } from './components/todo/TodoList'
import { TodoFilters } from './components/todo/TodoFilters'
import { CategoryList } from './components/category/CategoryList'
import { CategoryForm } from './components/category/CategoryForm'
import { ScreenshotOverlay } from './components/screenshot/ScreenshotOverlay'
import { SettingsPage } from './components/settings/SettingsPage'
import { initDatabase } from './lib/db'
import { useCategoryStore } from './stores/categoryStore'
import { useTodoStore } from './stores/todoStore'
import { useSettingsStore } from './stores/settingsStore'
import { useScreenshot } from './hooks/useScreenshot'
import { useShortcut } from './hooks/useShortcut'
import { startReminderScheduler } from './services/notification'
import { startAutoBackup } from './services/s3'
import type { ExtractedTodo } from './services/openai'
import { Toast } from './components/ui/Toast'

function App() {
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { fetchCategories, categories } = useCategoryStore()
  const { addTodo, todos } = useTodoStore()
  const { s3Config, syncEnabled, screenshotShortcut } = useSettingsStore()
  const { initShortcut } = useShortcut()

  const {
    imageData,
    extractedTodos,
    isExtracting,
    error: screenshotError,
    handleScreenshot,
    clearScreenshot,
  } = useScreenshot()

  useEffect(() => {
    const init = async () => {
      try {
        console.log('开始初始化数据库...')
        await initDatabase()
        console.log('数据库初始化完成')

        console.log('加载分类...')
        await fetchCategories()
        console.log('分类加载完成')

        setInitialized(true)
      } catch (error) {
        console.error('初始化失败:', error)
        setError(error instanceof Error ? error.message : '初始化失败')
      }
    }
    init()
  }, [fetchCategories])

  // 初始化快捷键 - 延迟执行确保 zustand persist 已恢复状态
  useEffect(() => {
    if (initialized) {
      // 等待一小段时间确保 zustand persist 已从 localStorage 恢复状态
      const timer = setTimeout(() => {
        initShortcut()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [initialized, initShortcut])

  // 启动提醒调度器
  useEffect(() => {
    if (!initialized) return

    // 每30分钟检查一次提醒
    const cleanup = startReminderScheduler(() => todos, 30)

    return cleanup
  }, [initialized, todos])

  // 启动自动备份
  useEffect(() => {
    if (!initialized || !syncEnabled) return

    // 每60分钟自动备份一次
    const cleanup = startAutoBackup(
      s3Config,
      () => todos,
      () => categories,
      60
    )

    return cleanup || undefined
  }, [initialized, syncEnabled, s3Config, todos, categories])

  const handleConfirmTodos = async (todos: ExtractedTodo[]) => {
    try {
      for (const todo of todos) {
        await addTodo({
          title: todo.title,
          description: todo.description,
          completed: false,
          priority: todo.priority,
          tags: todo.tags || [],
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        })
      }
      setToastMessage(`成功添加 ${todos.length} 个待办事项`)
      clearScreenshot()
    } catch (error) {
      console.error('添加待办失败:', error)
      setToastMessage('添加待办失败')
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-danger text-lg mb-2">初始化失败</div>
          <div className="text-text-secondary text-sm mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light"
          >
            重新加载
          </button>
        </div>
      </div>
    )
  }

  if (!initialized) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-text-secondary mb-2">初始化中...</div>
          <div className="text-xs text-text-secondary">请稍候，正在加载数据库</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="bg-bg-card border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Todo Agent</h1>
            <p className="text-sm text-text-secondary mt-0.5">智能待办管理</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleScreenshot}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title={`截图识别 (${screenshotShortcut?.replace('CmdOrCtrl', 'Cmd') || 'Cmd+Shift+E'})`}
            >
              <Camera size={20} className="text-text-secondary" />
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="设置"
            >
              <Settings size={20} className="text-text-secondary" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-bg-card border-r border-gray-200 p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Filters */}
            <div>
              <TodoFilters />
            </div>

            {/* Categories */}
            <div>
              <CategoryList />
              <div className="mt-2">
                <CategoryForm />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Add Todo Form */}
            <TodoForm />

            {/* Todo List */}
            <TodoList />
          </div>
        </main>
      </div>

      {/* Screenshot Overlay */}
      <ScreenshotOverlay
        isOpen={!!imageData}
        imageData={imageData}
        extractedTodos={extractedTodos}
        isExtracting={isExtracting}
        error={screenshotError}
        onClose={clearScreenshot}
        onConfirm={handleConfirmTodos}
      />

      {/* Toast Notifications */}
      {toastMessage && (
        <Toast
          id="app-toast"
          type="info"
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Settings Page */}
      <SettingsPage
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  )
}

export default App
