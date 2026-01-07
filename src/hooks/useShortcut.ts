import { useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useSettingsStore } from '@/stores/settingsStore';

export function useShortcut() {
  const { screenshotShortcut, updateSettings } = useSettingsStore();
  const initializedRef = useRef(false);

  // 注册快捷键
  const registerShortcut = useCallback(async (shortcut: string) => {
    try {
      const result = await invoke<boolean>('register_shortcut', { shortcut });
      if (result) {
        updateSettings({ screenshotShortcut: shortcut });
      }
      return result;
    } catch (error) {
      console.error('注册快捷键失败:', error);
      throw error;
    }
  }, [updateSettings]);

  // 初始化快捷键 (应用启动时调用)
  const initShortcut = useCallback(async () => {
    // 防止重复初始化
    if (initializedRef.current) {
      return;
    }

    // 从 store 获取最新的快捷键配置
    const shortcut = useSettingsStore.getState().screenshotShortcut;
    if (shortcut) {
      try {
        console.log('初始化快捷键:', shortcut);
        await invoke<boolean>('register_shortcut', { shortcut });
        initializedRef.current = true;
      } catch (error) {
        console.error('初始化快捷键失败:', error);
      }
    }
  }, []); // 不依赖 screenshotShortcut，直接从 store 获取

  return {
    screenshotShortcut,
    registerShortcut,
    initShortcut,
  };
}
