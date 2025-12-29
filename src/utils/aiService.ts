import { ElMessage } from 'element-plus';

const API_KEY = import.meta.env.VITE_ALIYUN_API_KEY;
const BASE_URL = import.meta.env.VITE_ALIYUN_BASE_URL;
const API_URL = `${BASE_URL}/chat/completions`;
const MODEL = import.meta.env.VITE_ALIYUN_MODEL || 'qwen-plus';

if (!API_KEY) {
    console.error('❌ [AI Service] API Key is missing. Please check .env file.');
}

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export class AIService {
    private static async callQwen(messages: ChatMessage[], temperature: number = 0.7): Promise<string> {
        console.log('🚀 [AI Request]', { model: MODEL, messages });

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: messages,
                    temperature: temperature,
                    stream: false
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ [AI Error]', errorData);
                throw new Error(errorData.message || 'AI Request Failed');
            }

            const data = await response.json();
            console.log('✅ [AI Response]', data);
            
            const content = data.choices[0]?.message?.content || '';
            return content;
        } catch (error) {
            console.error('❌ [AI Service Error]', error);
            ElMessage.error('AI 服务调用失败，请检查网络或稍后重试');
            throw error;
        }
    }

    static async analyzeSection(title: string, content: string): Promise<string> {
        const prompt = `你是一个专业的学术论文助手。请分析以下章节内容，并生成一份详细的导读。
章节标题：${title}
章节内容：
${content.substring(0, 3000)} ${content.length > 3000 ? '...(内容过长已截断)' : ''}

请按照以下 Markdown 格式输出：
### ${title} 核心解读
**关键点：**
1. [关键点1]
2. [关键点2]
3. [关键点3]

**详细解释：**
[对本章节核心逻辑的详细解释，通俗易懂]

> 💡 提示：[关于本章节的一个思考问题或延伸阅读建议]`;

        return this.callQwen([
            { role: 'system', content: '你是一个专业的学术论文导读助手，擅长将晦涩的学术内容转化为通俗易懂的解释。' },
            { role: 'user', content: prompt }
        ]);
    }

    static async analyzeSelection(text: string, type: 'summary' | 'explain' | 'translate'): Promise<string> {
        let systemPrompt = '';
        let userPrompt = '';

        switch (type) {
            case 'summary':
                systemPrompt = '你是一个学术内容总结专家。';
                userPrompt = `请总结以下文本的核心内容（100字以内）：\n\n${text}`;
                break;
            case 'explain':
                systemPrompt = '你是一个学术概念解释专家，擅长用通俗的语言解释专业术语。';
                userPrompt = `请解释以下文本中的核心概念或逻辑：\n\n${text}`;
                break;
            case 'translate':
                systemPrompt = '你是一个专业的学术翻译，精通中英文互译，译文信达雅。';
                userPrompt = `请将以下文本翻译成流畅的中文：\n\n${text}`;
                break;
        }

        return this.callQwen([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ]);
    }

    static async generateMindCard(text: string): Promise<any> {
        const prompt = `请分析以下文本，提取一个最核心的概念，并生成一张"思维卡片"。
文本内容：${text.substring(0, 1000)}

请严格按照以下 JSON 格式输出（不要包含 Markdown 代码块标记）：
{
    "title": "卡片标题",
    "concept": "核心概念名称",
    "definition": "概念定义（简练准确）",
    "keyPoints": ["关键点1", "关键点2", "关键点3"],
    "implication": "该概念的学术意义或应用价值"
}`;

        const response = await this.callQwen([
            { role: 'system', content: '你是一个知识管理专家，擅长提取核心概念并结构化。请只输出 JSON 字符串。' },
            { role: 'user', content: prompt }
        ], 0.3); // Lower temperature for structured output

        try {
            // Clean up potential markdown code blocks if the model outputs them
            const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanJson);
        } catch (e) {
            console.error('JSON Parse Error', e);
            return {
                title: '解析失败',
                concept: '未知概念',
                definition: 'AI 返回格式错误',
                keyPoints: [],
                implication: '请重试'
            };
        }
    }

    static async analyzeStructure(potentialHeaders: { title: string; fontSize: number; pageIndex: number }[]): Promise<{ title: string; pageIndex: number }[]> {
        const headersList = potentialHeaders.map((h, i) => `[ID:${i}] [P${h.pageIndex}] ${h.title}`).join('\n');
        
        const prompt = `我从一篇学术论文中提取了一些潜在的标题行。由于提取规则比较宽松，其中可能包含页眉、页脚、图表标题或误识别的文本。
请你分析这些文本，识别出真正的论文章节标题，并按照合理的阅读顺序（如：Abstract -> Introduction -> Related Work -> Method -> Experiments -> Conclusion）进行排序。

潜在标题列表：
${headersList}

请只输出最终确定的章节标题对应的 ID，格式为 JSON 数组，例如：[0, 5, 12, 15]。
请确保选出的标题能覆盖论文的主要内容。如果存在目录（Table of Contents），请忽略目录中的标题，只选择正文中的标题。`;

        const response = await this.callQwen([
            { role: 'system', content: '你是一个学术论文结构分析专家。请只输出 JSON 数组。' },
            { role: 'user', content: prompt }
        ], 0.1);

        try {
            const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
            const indices: number[] = JSON.parse(cleanJson);
            
            return indices.map(i => {
                const h = potentialHeaders[i];
                return h ? { title: h.title, pageIndex: h.pageIndex } : null;
            }).filter(h => h !== null) as { title: string; pageIndex: number }[];
        } catch (e) {
            console.error('Structure Analysis Parse Error', e);
            return [];
        }
    }

    static async chat(history: ChatMessage[], question: string, context?: string): Promise<string> {
        const messages: ChatMessage[] = [
            { role: 'system', content: '你是一个学术论文问答助手。请根据用户的问题和提供的论文上下文进行回答。' },
            ...history.filter(h => h.role !== 'system'), // Filter out existing system messages if any
            { role: 'user', content: context ? `上下文：\n${context}\n\n问题：${question}` : question }
        ];

        return this.callQwen(messages);
    }
}
