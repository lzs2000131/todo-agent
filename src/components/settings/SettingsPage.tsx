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
  const {
    openaiApiKey,
    openaiBaseUrl,
    openaiModel,
    openaiCustomPrompt,
    openaiCustomHeaders,
    openaiCustomBody,
    ossConfig,
    updateSettings,
    syncEnabled,
    screenshotShortcut,
  } = useSettingsStore();
  const { registerShortcut } = useShortcut();

  const [localApiKey, setLocalApiKey] = useState(openaiApiKey || '');
  const [localBaseUrl, setLocalBaseUrl] = useState(openaiBaseUrl || 'https://api.openai.com/v1');
  const [localModel, setLocalModel] = useState(openaiModel || 'gpt-4o-mini');
  const [localCustomPrompt, setLocalCustomPrompt] = useState(openaiCustomPrompt || '');
  const [localCustomHeaders, setLocalCustomHeaders] = useState(
    openaiCustomHeaders ? JSON.stringify(openaiCustomHeaders, null, 2) : ''
  );
  const [localCustomBody, setLocalCustomBody] = useState(
    openaiCustomBody ? JSON.stringify(openaiCustomBody, null, 2) : ''
  );
  const [localShortcut, setLocalShortcut] = useState(screenshotShortcut || 'CmdOrCtrl+Shift+E');
  const [showApiKey, setShowApiKey] = useState(false);
  const [shortcutError, setShortcutError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const [ossEndpoint, setOssEndpoint] = useState(ossConfig?.endpoint || '');
  const [ossBucket, setOssBucket] = useState(ossConfig?.bucket || '');
  const [ossRegion, setOssRegion] = useState(ossConfig?.region || '');
  const [ossAccessKeyId, setOssAccessKeyId] = useState(ossConfig?.accessKeyId || '');
  const [ossSecretKey, setOssSecretKey] = useState(ossConfig?.secretAccessKey || '');
  const [showOssSecret, setShowOssSecret] = useState(false);

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

    // 解析 JSON 配置
    let parsedHeaders: Record<string, string> | undefined;
    let parsedBody: Record<string, unknown> | undefined;

    try {
      if (localCustomHeaders.trim()) {
        parsedHeaders = JSON.parse(localCustomHeaders);
      }
    } catch {
      setSaveMessage('自定义 Headers JSON 格式错误');
      return;
    }

    try {
      if (localCustomBody.trim()) {
        parsedBody = JSON.parse(localCustomBody);
      }
    } catch {
      setSaveMessage('自定义 Body JSON 格式错误');
      return;
    }

    updateSettings({
      openaiApiKey: localApiKey.trim() || undefined,
      openaiBaseUrl: localBaseUrl.trim() || 'https://api.openai.com/v1',
      openaiModel: localModel.trim() || 'gpt-4o-mini',
      openaiCustomPrompt: localCustomPrompt.trim() || undefined,
      openaiCustomHeaders: parsedHeaders,
      openaiCustomBody: parsedBody,
      screenshotShortcut: localShortcut,
      ossConfig: (ossEndpoint && ossBucket && ossRegion && ossAccessKeyId && ossSecretKey) ? {
        endpoint: ossEndpoint.trim(),
        bucket: ossBucket.trim(),
        region: ossRegion.trim(),
        accessKeyId: ossAccessKeyId.trim(),
        secretAccessKey: ossSecretKey.trim(),
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

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      自定义提示词
                    </label>
                    <textarea
                      value={localCustomPrompt}
                      onChange={(e) => setLocalCustomPrompt(e.target.value)}
                      placeholder={`例如: 所有待办默认设为高优先级\n工作相关的事项标记为"工作"分类`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      定义你的待办创建偏好，AI 会根据这些规则生成待办
                    </p>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      自定义 Headers (JSON)
                    </label>
                    <textarea
                      value={localCustomHeaders}
                      onChange={(e) => setLocalCustomHeaders(e.target.value)}
                      placeholder='{"X-Custom-Header": "value"}'
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                      rows={2}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      添加自定义 HTTP Headers，留空则不添加
                    </p>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      自定义 Body (JSON)
                    </label>
                    <textarea
                      value={localCustomBody}
                      onChange={(e) => setLocalCustomBody(e.target.value)}
                      placeholder='{"temperature": 0.7}'
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                      rows={2}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      覆盖默认请求参数，如 temperature、top_p 等
                    </p>
                  </div>
                </div>
              </section>

              {/* Divider */}
              <hr className="border-gray-200" />

              {/* OSS Configuration */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Cloud className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-medium text-gray-900">OSS 云端同步</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  可选: 配置 OSS 以启用数据云端备份和多设备同步（支持阿里云 OSS、腾讯云 COS、MinIO、AWS S3 等 S3 兼容存储）
                </p>

                <div className="space-y-3">
                  <Input
                    label="服务端点 (Endpoint)"
                    value={ossEndpoint}
                    onChange={(e) => setOssEndpoint(e.target.value)}
                    placeholder="https://oss-cn-hangzhou.aliyuncs.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    常用端点: 阿里云 <code className="bg-gray-100 px-1 rounded">https://oss-cn-hangzhou.aliyuncs.com</code>，
                    腾讯云 <code className="bg-gray-100 px-1 rounded">https://cos.ap-guangzhou.myqcloud.com</code>，
                    AWS <code className="bg-gray-100 px-1 rounded">https://s3.amazonaws.com</code>
                  </p>

                  <Input
                    label="Bucket 名称"
                    value={ossBucket}
                    onChange={(e) => setOssBucket(e.target.value)}
                    placeholder="my-todo-backup"
                  />

                  <Input
                    label="Region"
                    value={ossRegion}
                    onChange={(e) => setOssRegion(e.target.value)}
                    placeholder="cn-hangzhou"
                  />

                  <Input
                    label="Access Key ID"
                    value={ossAccessKeyId}
                    onChange={(e) => setOssAccessKeyId(e.target.value)}
                    placeholder="LTAI5txxxxxxxx"
                  />

                  <div className="relative">
                    <Input
                      label="Secret Access Key"
                      type={showOssSecret ? 'text' : 'password'}
                      value={ossSecretKey}
                      onChange={(e) => setOssSecretKey(e.target.value)}
                      placeholder="xxxxxxxxxxxxxxxx"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOssSecret(!showOssSecret)}
                      className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                    >
                      {showOssSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </section>

              {/* Sync Toggle */}
              <section className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">启用云端同步</h4>
                  <p className="text-sm text-gray-600">自动备份数据到 OSS</p>
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
