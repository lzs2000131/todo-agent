import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Cloud, Save, Eye, EyeOff } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useShortcut } from '@/hooks/useShortcut';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShortcutInput } from '@/components/ui/ShortcutInput';
import clsx from 'clsx';

interface SettingsPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPage({ isOpen, onClose }: SettingsPageProps) {
  const { openaiApiKey, openaiBaseUrl, openaiModel, s3Config, updateSettings, syncEnabled, screenshotShortcut } = useSettingsStore();
  const { registerShortcut } = useShortcut();

  const [localApiKey, setLocalApiKey] = useState(openaiApiKey || '');
  const [localBaseUrl, setLocalBaseUrl] = useState(openaiBaseUrl || 'https://api.openai.com/v1');
  const [localModel, setLocalModel] = useState(openaiModel || 'gpt-4o-mini');
  const [localShortcut, setLocalShortcut] = useState(screenshotShortcut || 'CmdOrCtrl+Shift+E');
  const [showApiKey, setShowApiKey] = useState(false);
  const [shortcutError, setShortcutError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const [s3Bucket, setS3Bucket] = useState(s3Config?.bucket || '');
  const [s3Region, setS3Region] = useState(s3Config?.region || '');
  const [s3AccessKeyId, setS3AccessKeyId] = useState(s3Config?.accessKeyId || '');
  const [s3SecretKey, setS3SecretKey] = useState(s3Config?.secretAccessKey || '');
  const [showS3Secret, setShowS3Secret] = useState(false);

  // 当快捷键从 store 更新时,同步到本地状态
  useEffect(() => {
    setLocalShortcut(screenshotShortcut || 'CmdOrCtrl+Shift+E');
  }, [screenshotShortcut]);

  const handleSave = async () => {
    setShortcutError('');
    setSaveMessage('');

    // 先注册新快捷键
    if (localShortcut !== screenshotShortcut) {
      try {
        const success = await registerShortcut(localShortcut);
        if (!success) {
          setShortcutError('快捷键注册失败,可能已被占用');
          return;
        }
      } catch (err) {
        setShortcutError(err instanceof Error ? err.message : '快捷键注册失败');
        return;
      }
    }

    updateSettings({
      openaiApiKey: localApiKey.trim() || undefined,
      openaiBaseUrl: localBaseUrl.trim() || 'https://api.openai.com/v1',
      openaiModel: localModel.trim() || 'gpt-4o-mini',
      screenshotShortcut: localShortcut,
      s3Config: (s3Bucket && s3Region && s3AccessKeyId && s3SecretKey) ? {
        bucket: s3Bucket.trim(),
        region: s3Region.trim(),
        accessKeyId: s3AccessKeyId.trim(),
        secretAccessKey: s3SecretKey.trim(),
      } : undefined,
    });

    setSaveMessage('设置已保存!');
    setTimeout(() => setSaveMessage(''), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Key className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">设置</h2>
                <p className="text-sm text-gray-500">配置 API 密钥和同步选项</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="space-y-6">
              {/* 截图快捷键 */}
              <section>
                <ShortcutInput
                  value={localShortcut}
                  onChange={setLocalShortcut}
                />
                {shortcutError && (
                  <p className="text-sm text-red-600 mt-2">{shortcutError}</p>
                )}
              </section>

              {/* Divider */}
              <hr className="border-gray-200" />

              {/* OpenAI API Key */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Key className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-medium text-gray-900">OpenAI API</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  用于截图识别功能,从截图中自动提取待办事项
                </p>

                <div className="space-y-3">
                  <Input
                    label="API Base URL"
                    value={localBaseUrl}
                    onChange={(e) => setLocalBaseUrl(e.target.value)}
                    placeholder="https://api.openai.com/v1"
                  />
                  <p className="text-xs text-gray-500">
                    可使用兼容 OpenAI API 的中转服务,如 <code className="bg-gray-100 px-1 rounded">https://api.openai.com/v1</code>
                  </p>

                  <Input
                    label="模型 (Model)"
                    value={localModel}
                    onChange={(e) => setLocalModel(e.target.value)}
                    placeholder="gpt-4o-mini"
                  />
                  <p className="text-xs text-gray-500">
                    常用模型: <code className="bg-gray-100 px-1 rounded">gpt-4o-mini</code>, <code className="bg-gray-100 px-1 rounded">gpt-4o</code>, <code className="bg-gray-100 px-1 rounded">gpt-4-vision-preview</code>
                  </p>

                  <div className="relative">
                    <Input
                      label="API Key"
                      type={showApiKey ? 'text' : 'password'}
                      value={localApiKey}
                      onChange={(e) => setLocalApiKey(e.target.value)}
                      placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    获取 API Key: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">platform.openai.com</a>
                  </p>
                </div>
              </section>

              {/* Divider */}
              <hr className="border-gray-200" />

              {/* AWS S3 Configuration */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Cloud className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-medium text-gray-900">AWS S3 云端同步</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  可选: 配置 S3 以启用数据云端备份和多设备同步
                </p>

                <div className="space-y-3">
                  <Input
                    label="Bucket 名称"
                    value={s3Bucket}
                    onChange={(e) => setS3Bucket(e.target.value)}
                    placeholder="my-todo-backup"
                  />

                  <Input
                    label="AWS Region"
                    value={s3Region}
                    onChange={(e) => setS3Region(e.target.value)}
                    placeholder="us-east-1"
                  />

                  <Input
                    label="Access Key ID"
                    value={s3AccessKeyId}
                    onChange={(e) => setS3AccessKeyId(e.target.value)}
                    placeholder="AKIAIOSFODNN7EXAMPLE"
                  />

                  <div className="relative">
                    <Input
                      label="Secret Access Key"
                      type={showS3Secret ? 'text' : 'password'}
                      value={s3SecretKey}
                      onChange={(e) => setS3SecretKey(e.target.value)}
                      placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowS3Secret(!showS3Secret)}
                      className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                    >
                      {showS3Secret ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </section>

              {/* Sync Toggle */}
              <section className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">启用云端同步</h4>
                  <p className="text-sm text-gray-600">自动备份数据到 S3</p>
                </div>
                <button
                  onClick={() => updateSettings({ syncEnabled: !syncEnabled })}
                  className={clsx(
                    'relative w-12 h-6 rounded-full transition-colors',
                    syncEnabled ? 'bg-primary' : 'bg-gray-300'
                  )}
                >
                  <span
                    className={clsx(
                      'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                      syncEnabled ? 'left-7' : 'left-1'
                    )}
                  />
                </button>
              </section>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            {saveMessage && (
              <span className="text-sm text-green-600">{saveMessage}</span>
            )}
            {!saveMessage && <span />}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose}>
                取消
              </Button>
              <Button onClick={handleSave}>
                <Save size={16} className="mr-2" />
                保存设置
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
