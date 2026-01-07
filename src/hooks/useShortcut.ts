import { useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useSettingsStore } from '@/stores/settingsStore';

export function useShortcut() {
  const { screenshotShortcut, updateSettings } = useSettingsStore();

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
    if (screenshotShortcut) {
      try {
        await invoke<boolean>('register_shortcut', { shortcut: screenshotShortcut });
      } catch (error) {
        console.error('初始化快捷键失败:', error);
      }
    }
  }, [screenshotShortcut]);

  return {
    screenshotShortcut,
    registerShortcut,
    initShortcut,
  };
}
