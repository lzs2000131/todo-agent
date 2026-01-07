import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import { ExtractPreview } from './ExtractPreview';
import type { ExtractedTodo } from '@/services/openai';

interface ScreenshotOverlayProps {
  isOpen: boolean;
  imageData: Uint8Array | null;
  extractedTodos: ExtractedTodo[];
  isExtracting: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (todos: ExtractedTodo[]) => void;
}

export function ScreenshotOverlay({
  isOpen,
  imageData,
  extractedTodos,
  isExtracting,
  error,
  onClose,
  onConfirm,
}: ScreenshotOverlayProps) {
  if (!isOpen || !imageData) return null;

  // 将图片数据转换为可显示的URL
  const imageUrl = URL.createObjectURL(
    new Blob([imageData as any], { type: 'image/png' })
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900">
                截图识别
              </h2>
              {isExtracting && (
                <span className="flex items-center gap-2 text-sm text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AI 识别中...
                </span>
              )}
              {!isExtracting && extractedTodos.length > 0 && (
                <span className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  识别完成
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* 内容区域 */}
          <div className="grid grid-cols-2 gap-6 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* 左侧: 截图预览 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">截图预览</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Screenshot"
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* 右侧: 提取结果 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">
                识别的待办事项
              </h3>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              {isExtracting && (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              )}
              {!isExtracting && !error && (
                <ExtractPreview
                  todos={extractedTodos}
                  onConfirm={onConfirm}
                  onCancel={onClose}
                />
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
