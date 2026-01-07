import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { useScreenshotQueueStore } from '@/stores/screenshotQueueStore';

export function useScreenshot() {
  const [isCapturing, setIsCapturing] = useState(false);
  const { addToQueue } = useScreenshotQueueStore();

  const handleScreenshot = useCallback(async () => {
    setIsCapturing(true);

    try {
      // 调用Tauri命令执行截图
      const data = await invoke<number[]>('take_screenshot');

      if (!data || data.length === 0) {
        setIsCapturing(false);
        return; // 用户取消了截图
      }

      const imageBytes = new Uint8Array(data);

      // 添加到队列并自动开始识别
      await addToQueue(imageBytes);
    } catch (err) {
      console.error('Screenshot error:', err);
    } finally {
      setIsCapturing(false);
    }
  }, [addToQueue]);

  // 监听全局快捷键触发的截图事件
  useEffect(() => {
    console.log('注册 trigger-screenshot 事件监听器');
    const unlistenPromise = listen('trigger-screenshot', () => {
      console.log('收到 trigger-screenshot 事件');
      handleScreenshot();
    });

    return () => {
      console.log('取消 trigger-screenshot 事件监听器');
      unlistenPromise.then((fn) => fn());
    };
  }, [handleScreenshot]);

  return {
    isCapturing,
    handleScreenshot,
  };
}
