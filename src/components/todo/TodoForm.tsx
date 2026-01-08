import { useState, useRef } from 'react'
import { Plus, X, Upload, Maximize2, FileText, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Todo, Attachment } from '@/types'
import { useTodoStore } from '@/stores/todoStore'
import { useCategoryStore } from '@/stores/categoryStore'
import { Input, Button, Modal, Select, DatePicker } from '@/components/ui'
import { CategoryIcon } from '../category/CategoryIcon'
import { generateId } from '@/lib/utils'

interface TodoFormProps {
  todo?: Todo
  onClose?: () => void
}

export function TodoForm({ todo, onClose }: TodoFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState(todo?.title || '')
  const [description, setDescription] = useState(todo?.description || '')
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>(todo?.priority || 'medium')
  const [categoryId, setCategoryId] = useState(todo?.categoryId || '')
  const [dueDate, setDueDate] = useState<Date | undefined>(todo?.dueDate)
  const [attachments, setAttachments] = useState<Attachment[]>(todo?.attachments || [])
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { addTodo, updateTodo } = useTodoStore()
  const { categories } = useCategoryStore()

  // 合并旧的 screenshot 和新的 attachments
  const allImages = [
    ...(todo?.screenshot ? [{ id: 'screenshot', name: '来源截图', type: 'image' as const, data: todo.screenshot, createdAt: todo.createdAt }] : []),
    ...attachments.filter(a => a.type === 'image'),
  ]

  // 非图片附件
  const allFiles = attachments.filter(a => a.type === 'file')

  // 下载附件
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null)

  const downloadAttachment = (attachment: Attachment) => {
    try {
      // 将 base64 转换为 Uint8Array
      const binaryString = atob(attachment.data)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }

      // 根据文件扩展名猜测 MIME 类型
      const ext = attachment.name.split('.').pop()?.toLowerCase() || ''
      const mimeTypes: Record<string, string> = {
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        txt: 'text/plain',
        zip: 'application/zip',
        rar: 'application/x-rar-compressed',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
      }
      const mimeType = mimeTypes[ext] || 'application/octet-stream'

      // 创建 Blob 和下载链接
      const blob = new Blob([bytes], { type: mimeType })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = attachment.name
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()

      // 清理
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)

      // 显示下载成功提示
      setDownloadMessage(`已下载: ${attachment.name}`)
      setTimeout(() => setDownloadMessage(null), 3000)
    } catch (error) {
      console.error('下载附件失败:', error)
      setDownloadMessage('下载失败')
      setTimeout(() => setDownloadMessage(null), 3000)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1]
        const newAttachment: Attachment = {
          id: generateId(),
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'file',
          data: base64,
          createdAt: new Date(),
        }
        setAttachments(prev => [...prev, newAttachment])
      }
      reader.readAsDataURL(file)
    })

    // 清空 input 以便重复选择同一文件
    e.target.value = ''
  }

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return

    const todoData = {
      title,
      description: description || undefined,
      completed: todo?.completed || false,
      priority,
      categoryId: categoryId || undefined,
      tags: [],
      dueDate: dueDate,
      attachments: attachments.length > 0 ? attachments : undefined,
    }

    if (todo) {
      await updateTodo(todo.id, todoData)
      onClose?.()
    } else {
      await addTodo(todoData)
      setTitle('')
      setDescription('')
      setPriority('medium')
      setCategoryId('')
      setDueDate(undefined)
      setAttachments([])
      setIsOpen(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    onClose?.()
  }

  const priorityOptions = [
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' },
  ]

  const categoryOptions = [
    { value: '', label: '无分类' },
    ...categories.map(cat => ({
      value: cat.id,
      label: cat.name,
      icon: <CategoryIcon name={cat.icon} size={16} style={{ color: cat.color }} />
    }))
  ]

  const renderFormContent = () => (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <Input
        label="标题"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="输入待办事项..."
        required
        autoFocus={!todo}
      />

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1">
          描述
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="添加描述..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-text-primary bg-transparent dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="优先级"
          value={priority}
          onChange={(val) => setPriority(val as any)}
          options={priorityOptions}
        />

        <Select
          label="分类"
          value={categoryId}
          onChange={setCategoryId}
          options={categoryOptions}
        />
      </div>

      <DatePicker
        label="截止日期"
        value={dueDate}
        onChange={setDueDate}
      />

      {/* 附件区域 */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          附件
        </label>

        {/* 已有图片展示 */}
        {allImages.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-3">
            {allImages.map((img) => (
              <div key={img.id} className="relative group">
                <img
                  src={`data:image/png;base64,${img.data}`}
                  alt={img.name}
                  className="w-full h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setPreviewImage(img.data)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => setPreviewImage(img.data)}
                    className="p-1 bg-white/90 rounded-full hover:bg-white transition-colors"
                    title="放大查看"
                  >
                    <Maximize2 size={12} className="text-gray-700" />
                  </button>
                  {img.id !== 'screenshot' && (
                    <button
                      type="button"
                      onClick={() => removeAttachment(img.id)}
                      className="p-1 bg-white/90 rounded-full hover:bg-white transition-colors"
                      title="删除"
                    >
                      <X size={12} className="text-red-500" />
                    </button>
                  )}
                </div>
                {img.id === 'screenshot' && (
                  <span className="absolute bottom-0 left-0 right-0 text-[10px] text-center bg-black/50 text-white rounded-b-lg py-0.5">
                    来源截图
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 非图片文件列表 */}
        {allFiles.length > 0 && (
          <div className="space-y-2 mb-3">
            {allFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <FileText size={20} className="text-text-secondary flex-shrink-0" />
                <span className="flex-1 text-sm text-text-primary truncate" title={file.name}>
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => downloadAttachment(file)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                  title="下载"
                >
                  <Download size={14} className="text-primary" />
                </button>
                <button
                  type="button"
                  onClick={() => removeAttachment(file.id)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                  title="删除"
                >
                  <X size={14} className="text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 上传按钮 */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors w-full justify-center"
        >
          <Upload size={16} />
          <span>上传附件</span>
        </button>

        {/* 下载提示 */}
        <AnimatePresence>
          {downloadMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-sm text-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 py-2 px-3 rounded-lg"
            >
              {downloadMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={handleClose}>
          取消
        </Button>
        <Button type="submit">
          {todo ? '更新' : '添加待办'}
        </Button>
      </div>
    </motion.form>
  )

  // 图片预览弹窗
  const renderImagePreview = () => (
    <AnimatePresence>
      {previewImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center"
          onClick={() => setPreviewImage(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="relative max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`data:image/png;base64,${previewImage}`}
              alt="预览"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <X size={16} className="text-gray-700" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  if (todo) {
    return (
      <>
        {renderFormContent()}
        {renderImagePreview()}
      </>
    )
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-bg-card rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary transition-colors text-text-secondary hover:text-primary"
      >
        <Plus size={20} />
        <span>添加新待办...</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="添加待办"
          >
            {renderFormContent()}
          </Modal>
        )}
      </AnimatePresence>
      {renderImagePreview()}
    </>
  )
}
