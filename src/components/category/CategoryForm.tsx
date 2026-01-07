import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useCategoryStore } from '@/stores/categoryStore'
import { Input, Button, Modal } from '@/components/ui'

const PRESET_COLORS = [
  '#6366F1', // 靛蓝
  '#10B981', // 绿色
  '#F59E0B', // 橙色
  '#EF4444', // 红色
  '#8B5CF6', // 紫色
  '#EC4899', // 粉色
]

const PRESET_ICONS = ['📁', '💼', '🏠', '📚', '🎯', '💡', '🎨', '🎮']

export function CategoryForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [icon, setIcon] = useState(PRESET_ICONS[0])

  const { addCategory } = useCategoryStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return

    await addCategory({ name, color, icon })
    setName('')
    setColor(PRESET_COLORS[0])
    setIcon(PRESET_ICONS[0])
    setIsOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-gray-100 rounded-md transition-colors"
      >
        <Plus size={16} />
        <span>添加分类</span>
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="添加分类" size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="分类名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="输入分类名称..."
            required
            autoFocus
          />

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              选择图标
            </label>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`p-2 text-xl rounded-md border-2 transition-colors ${
                    icon === i
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              选择颜色
            </label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-md border-2 transition-all ${
                    color === c
                      ? 'border-gray-800 scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
              取消
            </Button>
            <Button type="submit">添加</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
