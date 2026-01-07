import OpenAI from 'openai';

export interface ExtractedTodo {
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  tags?: string[];
  dueDate?: string;
}

export interface OpenAIOptions {
  apiKey: string;
  baseURL?: string;
  model?: string;
  availableTags?: string[];
  customPrompt?: string;
  customHeaders?: Record<string, string>;
  customBody?: Record<string, unknown>;
}

/**
 * 使用OpenAI Vision API从截图中提取待办事项
 */
export async function extractTodosFromImage(
  imageData: Uint8Array,
  options: OpenAIOptions
): Promise<ExtractedTodo[]> {
  const {
    apiKey,
    baseURL = 'https://api.openai.com/v1',
    model = 'gpt-4o-mini',
    availableTags = [],
    customPrompt = '',
    customHeaders = {},
    customBody = {},
  } = options;

  if (!apiKey) {
    throw new Error('OpenAI API Key未配置');
  }

  const openai = new OpenAI({
    apiKey,
    baseURL,
    dangerouslyAllowBrowser: true,
    defaultHeaders: customHeaders,
  });

  try {
    // 将图片数据转换为base64
    const base64Image = btoa(
      String.fromCharCode(...imageData)
    );

    // 构建系统提示词
    let systemPrompt = `你是一个待办事项提取助手。请从用户提供的截图中识别并提取待办事项。

## 规则:
1. 识别图片中的任务、事项、问题、清单等内容
2. 为每个待办事项提取标题、描述、优先级
3. 根据内容判断优先级(high/medium/low)
4. 如果能识别出截止日期,也请提取
5. 返回JSON数组格式

## 识别思路
- 如果是个问题，生成的待办就是解决这个问题
- 如果只是描述一些事情，那么总结一下，生成的待办就是待会检查这些事项

## 可用tags:
${availableTags.length > 0 ? availableTags.join('、') : '无（可自由创建）'}`;

    // 注入用户自定义提示词
    if (customPrompt) {
      systemPrompt += `

## 用户偏好:
${customPrompt}`;
    }

    // 添加格式要求
    systemPrompt += `

## 返回格式示例:
[
  {
    "title": "完成项目文档",
    "description": "撰写技术文档并提交审核",
    "priority": "high",
    "tags": ["工作", "文档"],
    "dueDate": "2026-01-10"
  }
]

注意:
- 如果图片中无法总结出待办事项相关内容,返回空数组 []
- 只返回JSON,不要其他说明文字`;

    // 构建默认请求体
    const defaultRequestBody = {
      model,
      messages: [
        {
          role: 'system' as const,
          content: systemPrompt,
        },
        {
          role: 'user' as const,
          content: [
            {
              type: 'text' as const,
              text: '请提取这张截图中的待办事项:',
            },
            {
              type: 'image_url' as const,
              image_url: {
                url: `data:image/png;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
    };

    // 合并自定义 body，确保 stream: false
    const requestBody = { ...defaultRequestBody, ...customBody, stream: false as const };

    const response = await openai.chat.completions.create(requestBody);

    const content = response.choices[0]?.message?.content?.trim();

    if (!content) {
      return [];
    }

    // 尝试解析JSON响应
    try {
      // 移除可能的markdown代码块标记
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const todos = JSON.parse(jsonStr);

      if (!Array.isArray(todos)) {
        console.error('OpenAI返回的不是数组:', todos);
        return [];
      }

      return todos;
    } catch (parseError) {
      console.error('解析OpenAI响应失败:', content, parseError);
      return [];
    }
  } catch (error) {
    console.error('OpenAI API调用失败:', error);
    throw new Error(`AI识别失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}
