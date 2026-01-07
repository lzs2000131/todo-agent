import { useState, useRef, useCallback } from 'react';
import { Keyboard } from 'lucide-react';
import clsx from 'clsx';

interface ShortcutInputProps {
  value: string;
  onChange: (shortcut: string) => void;
  className?: string;
}

// 将按键事件转换为快捷键字符串
function eventToShortcut(e: KeyboardEvent): string | null {
  // 必须有修饰键
  if (!e.metaKey && !e.ctrlKey && !e.altKey) {
    return null;
  }

  // 忽略单独的修饰键
  const ignoredKeys = ['Meta', 'Control', 'Alt', 'Shift'];
  if (ignoredKeys.includes(e.key)) {
    return null;
  }

  const parts: string[] = [];

  // macOS 使用 Cmd，Windows/Linux 使用 Ctrl
  if (e.metaKey || e.ctrlKey) {
    parts.push('CmdOrCtrl');
  }
  if (e.altKey) {
    parts.push('Alt');
  }
  if (e.shiftKey) {
    parts.push('Shift');
  }

  // 处理按键
  let key = e.key.toUpperCase();

  // 处理特殊按键
  if (e.code.startsWith('Key')) {
    key = e.code.replace('Key', '');
  } else if (e.code.startsWith('Digit')) {
    key = e.code.replace('Digit', '');
  } else if (e.code.startsWith('F') && /^F\d+$/.test(e.code)) {
    key = e.code; // F1-F12
  }

  parts.push(key);

  return parts.join('+');
}

// 显示友好的快捷键格式
function formatShortcut(shortcut: string): string {
  return shortcut
    .replace('CmdOrCtrl', '⌘')
    .replace('Shift', '⇧')
    .replace('Alt', '⌥')
    .replace(/\+/g, ' ');
}

export function ShortcutInput({ value, onChange, className }: ShortcutInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [tempShortcut, setTempShortcut] = useState<string | null>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Escape 取消录制
    if (e.key === 'Escape') {
      setIsRecording(false);
      setTempShortcut(null);
      return;
    }

    const shortcut = eventToShortcut(e);
    if (shortcut) {
      setTempShortcut(shortcut);
    }
  }, []);

  const handleKeyUp = useCallback(() => {
    if (tempShortcut) {
      onChange(tempShortcut);
      setIsRecording(false);
      setTempShortcut(null);
    }
  }, [tempShortcut, onChange]);

  const startRecording = () => {
    setIsRecording(true);
    setTempShortcut(null);

    // 添加全局键盘监听
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setTempShortcut(null);
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };

  // 组件卸载时清理监听器
  const handleBlur = () => {
    if (isRecording) {
      stopRecording();
    }
  };

  const displayValue = tempShortcut || value;

  return (
    <div className={clsx('space-y-2', className)}>
      <label className="block text-sm font-medium text-gray-700">
        截图快捷键
      </label>
      <div
        ref={inputRef}
        tabIndex={0}
        onClick={startRecording}
        onBlur={handleBlur}
        className={clsx(
          'flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all',
          isRecording
            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
            : 'border-gray-200 hover:border-gray-300 bg-white'
        )}
      >
        <Keyboard className={clsx(
          'w-5 h-5',
          isRecording ? 'text-primary' : 'text-gray-400'
        )} />

        <div className="flex-1">
          {isRecording ? (
            <span className="text-primary font-medium">
              {tempShortcut ? formatShortcut(tempShortcut) : '请按下快捷键组合...'}
            </span>
          ) : (
            <span className="font-mono text-gray-900">
              {formatShortcut(displayValue)}
            </span>
          )}
        </div>

        <span className={clsx(
          'text-xs px-2 py-1 rounded',
          isRecording
            ? 'bg-primary/10 text-primary'
            : 'bg-gray-100 text-gray-500'
        )}>
          {isRecording ? '录制中' : '点击录制'}
        </span>
      </div>
      <p className="text-xs text-gray-500">
        点击上方区域，然后按下想要设置的快捷键组合（需包含 ⌘/Ctrl）
      </p>
    </div>
  );
}
