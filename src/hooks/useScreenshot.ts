import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { extractTodosFromImage, type ExtractedTodo } from '@/services/openai';
import { useSettingsStore } from '@/stores/settingsStore';

export function useScreenshot() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [imageData, setImageData] = useState<Uint8Array | null>(null);
  const [extractedTodos, setExtractedTodos] = useState<ExtractedTodo[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { openaiApiKey, openaiBaseUrl, openaiModel } = useSettingsStore();

  const handleScreenshot = useCallback(async () => {
    setError(null);
    setIsCapturing(true);
    setImageData(null);
    setExtractedTodos([]);

    try {
      // 调用Tauri命令执行截图
      const data = await invoke<number[]>('take_screenshot');

      if (!data || data.length === 0) {
        setIsCapturing(false);
        return; // 用户取消了截图
      }

      const imageBytes = new Uint8Array(data);
      setImageData(imageBytes);

      // 如果有API Key,使用OpenAI提取待办事项
      if (openaiApiKey) {
        setIsExtracting(true);
        try {
          const todos = await extractTodosFromImage(imageBytes, openaiApiKey, openaiBaseUrl, openaiModel);
          setExtractedTodos(todos);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'AI识别失败');
        } finally {
          setIsExtracting(false);
        }
      } else {
        // 没有API Key时显示提示
        setError('请先在设置中配置 OpenAI API Key 以启用AI识别功能');
      }
    } catch (err) {
      console.error('Screenshot error:', err);
      setError(err instanceof Error ? err.message : '截图失败');
    } finally {
      setIsCapturing(false);
    }
  }, [openaiApiKey, openaiBaseUrl, openaiModel]);

  // 监听全局快捷键触发的截图事件
  useEffect(() => {
    const unlistenPromise = listen('trigger-screenshot', () => {
      handleScreenshot();
    });

    return () => {
      unlistenPromise.then((fn) => fn());
    };
  }, [handleScreenshot]);

  const clearScreenshot = () => {
    setImageData(null);
    setExtractedTodos([]);
    setError(null);
  };

  return {
    isCapturing,
    imageData,
    extractedTodos,
    isExtracting,
    error,
    handleScreenshot,
    clearScreenshot,
  };
}
