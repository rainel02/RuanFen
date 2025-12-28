import { defineStore } from 'pinia';
import localforage from 'localforage';
import { toRaw } from 'vue';
import { ElMessage } from 'element-plus';
import { PdfParser, type ParsedPaper, type PaperSection } from '../utils/pdfParser';
import { AIService } from '../utils/aiService';

// 配置 localforage
localforage.config({
  name: 'scholar-platform',
  storeName: 'paper-guide'
});

interface ChatMessage {
    role: 'user' | 'ai';
    content: string;
    timestamp: number;
}

interface GuideState {
  file: File | null;
  parsedPaper: ParsedPaper | null;
  currentSectionIndex: number;
  isAnalyzing: boolean;
  isChatting: boolean; // 新增聊天加载状态
  aiAnalysis: Record<string, string>; // sectionId -> analysis result
  mindCards: Record<string, any[]>; // sectionId -> list of mind cards
  chatHistory: ChatMessage[];
  loading: boolean;
}

export const usePaperGuideStore = defineStore('paperGuide', {
  state: (): GuideState => ({
    file: null,
    parsedPaper: null,
    currentSectionIndex: 0,
    isAnalyzing: false,
    isChatting: false,
    aiAnalysis: {},
    mindCards: {},
    chatHistory: [],
    loading: false
  }),

  getters: {
    currentSection(state): PaperSection | null {
      const sections = this.displaySections;
      if (!sections || sections.length === 0) return null;
      return sections[state.currentSectionIndex] || null;
    },
    
    hasPaper(state): boolean {
      return !!state.parsedPaper;
    },

    steps(state): string[] {
        if (!state.parsedPaper) return [];
        // 过滤掉 References
        const sectionTitles = state.parsedPaper.sections
            .filter(s => !s.title.toUpperCase().includes('REFERENCES'))
            .map(s => s.title);
        
        // 在最前面添加全文阅读
        return ['全文阅读', ...sectionTitles];
    },
    
    displaySections(state): PaperSection[] {
        if (!state.parsedPaper) return [];
        
        // 构造全文 Section
        const fullTextSection: PaperSection = {
            id: 'full-text-view',
            title: '全文阅读',
            content: state.parsedPaper.text,
            pageIndex: 0
        };

        const filteredSections = state.parsedPaper.sections.filter(s => !s.title.toUpperCase().includes('REFERENCES'));
        
        return [fullTextSection, ...filteredSections];
    }
  },

  actions: {
    async loadFromStorage() {
      this.loading = true;
      try {
        const savedPaper = await localforage.getItem<ParsedPaper>('currentPaper');
        const savedAnalysis = await localforage.getItem<Record<string, string>>('aiAnalysis');
        const savedCards = await localforage.getItem<Record<string, any[]>>('mindCards');
        const savedChat = await localforage.getItem<ChatMessage[]>('chatHistory');
        const savedFile = await localforage.getItem<File>('currentFile');
        
        if (savedPaper) {
          this.parsedPaper = savedPaper;
        }
        if (savedAnalysis) {
          this.aiAnalysis = savedAnalysis;
        }
        if (savedCards) {
          this.mindCards = savedCards;
        }
        if (savedChat) {
            this.chatHistory = savedChat;
        }
        if (savedFile) {
            console.log('[loadFromStorage] Restored file from storage:', savedFile.name);
            this.file = savedFile;
        } else {
            console.warn('[loadFromStorage] No file found in storage. User needs to re-upload.');
        }
      } catch (e) {
        console.error('Failed to load from storage', e);
      } finally {
        this.loading = false;
      }
    },

    async uploadAndParse(file: File) {
      this.loading = true;
      this.file = file;
      try {
        const parsed = await PdfParser.parse(file);
        this.parsedPaper = parsed;
        this.currentSectionIndex = 0;
        this.aiAnalysis = {}; // 重置分析
        this.mindCards = {}; // 重置卡片
        this.chatHistory = []; // 重置对话
        
        // 保存到本地
        await localforage.setItem('currentPaper', parsed);
        await localforage.setItem('currentFile', file);
        await localforage.setItem('aiAnalysis', {});
        await localforage.setItem('mindCards', {});
        await localforage.setItem('chatHistory', []);
      } catch (e) {
        console.error('Parse error', e);
        throw e;
      } finally {
        this.loading = false;
      }
    },

    async clearPaper() {
      this.file = null;
      this.parsedPaper = null;
      this.currentSectionIndex = 0;
      this.aiAnalysis = {};
      this.mindCards = {};
      this.chatHistory = [];
      await localforage.removeItem('currentPaper');
      await localforage.removeItem('currentFile');
      await localforage.removeItem('aiAnalysis');
      await localforage.removeItem('mindCards');
      await localforage.removeItem('chatHistory');
    },

    setSection(index: number) {
      // 这里的 index 是 displaySections 的索引
      const sections = this.displaySections;
      if (sections && index >= 0 && index < sections.length) {
        this.currentSectionIndex = index;
      }
    },

    async reparseWithAI() {
        console.log('[reparseWithAI] Starting AI reparse...');
        if (!this.parsedPaper) {
            console.error('[reparseWithAI] No parsed paper found.');
            ElMessage.warning('请先上传并解析论文');
            return;
        }
        if (!this.file) {
            // 尝试从存储中恢复
            const savedFile = await localforage.getItem<File>('currentFile');
            if (savedFile) {
                this.file = savedFile;
                console.log('[reparseWithAI] Recovered file from storage.');
            } else {
                console.error('[reparseWithAI] No file object found. Please reload the file.');
                ElMessage.error('文件对象丢失，请重新上传 PDF 文件以使用此功能');
                return;
            }
        }

        this.loading = true;
        try {
            // 1. 获取潜在标题
            console.log('[reparseWithAI] Step 1: Extracting potential headers from PDF...');
            const potentialHeaders = await PdfParser.getPotentialHeaders(this.file);
            console.log('[reparseWithAI] Potential headers found:', potentialHeaders);
            
            // 2. AI 分析结构
            console.log('[reparseWithAI] Step 2: Sending headers to AI for structure analysis...');
            const aiSections = await AIService.analyzeStructure(potentialHeaders);
            console.log('[reparseWithAI] AI returned sections:', aiSections);
            
            if (aiSections.length === 0) {
                console.warn('[reparseWithAI] AI returned no sections. Aborting reparse.');
                return;
            }

            // 3. 根据 AI 返回的标题重组章节
            console.log('[reparseWithAI] Step 3: Reconstructing paper sections...');
            const newSections: PaperSection[] = [];
            const fullText = this.parsedPaper.text;
            
            let lastIndex = 0;
            let currentSectionTitle = 'Paper Info'; // 默认第一章之前的标题
            let currentSectionStart = 0;

            for (const section of aiSections) {
                // 在 fullText 中查找标题
                // 注意：这里可能需要更模糊的匹配，因为 PDF 提取的文本可能包含换行符或空格差异
                // 暂时使用简单的 indexOf
                const index = fullText.indexOf(section.title, lastIndex);
                
                if (index !== -1) {
                    console.log(`[reparseWithAI] Found section "${section.title}" at index ${index}`);
                    // 保存上一章节内容
                    const content = fullText.substring(currentSectionStart, index).trim();
                    if (content.length > 0) {
                        newSections.push({
                            id: `section-${newSections.length}`,
                            title: currentSectionTitle,
                            content: content,
                            pageIndex: newSections.length === 0 ? 1 : section.pageIndex // 近似页码
                        });
                    }
                    
                    currentSectionTitle = section.title;
                    currentSectionStart = index + section.title.length;
                    lastIndex = currentSectionStart;
                } else {
                    console.warn(`[reparseWithAI] Could not find section title "${section.title}" in full text starting from ${lastIndex}`);
                }
            }
            
            // 保存最后一章
            if (currentSectionStart < fullText.length) {
                console.log(`[reparseWithAI] Saving final section "${currentSectionTitle}"`);
                newSections.push({
                    id: `section-${newSections.length}`,
                    title: currentSectionTitle,
                    content: fullText.substring(currentSectionStart).trim(),
                    pageIndex: aiSections[aiSections.length - 1].pageIndex
                });
            }
            
            console.log('[reparseWithAI] New sections constructed:', newSections);
            this.parsedPaper.sections = newSections;
            
            // 使用 toRaw 获取原始对象，并进行深拷贝以确保无 Proxy 残留
            const rawPaper = toRaw(this.parsedPaper);
            const plainPaper = JSON.parse(JSON.stringify(rawPaper));
            
            await localforage.setItem('currentPaper', plainPaper);
            console.log('[reparseWithAI] Reparse complete and saved to storage.');
            
        } catch (e) {
            console.error('[reparseWithAI] Reparse failed', e);
        } finally {
            this.loading = false;
        }
    },

    async analyzeSelection(text: string, type: 'summary' | 'explain' | 'translate' = 'summary'): Promise<string> {
        this.isAnalyzing = true;
        try {
            const result = await AIService.analyzeSelection(text, type);
            return result;
        } catch (e) {
            console.error('AI Analysis failed', e);
            return 'AI 分析失败，请稍后重试。';
        } finally {
            this.isAnalyzing = false;
        }
    },

    async addChatMessage(role: 'user' | 'ai', content: string) {
        this.chatHistory.push({
            role,
            content,
            timestamp: Date.now()
        });
        await localforage.setItem('chatHistory', JSON.parse(JSON.stringify(this.chatHistory)));
    },

    async askAI(question: string) {
        // Add user message
        await this.addChatMessage('user', question);
        
        // Get context from current section
        const context = this.currentSection?.content || '';
        
        this.isChatting = true;
        // Call AI
        try {
            // Convert chat history to format expected by AIService
            const history = this.chatHistory.map(msg => ({
                role: msg.role === 'ai' ? 'assistant' : 'user',
                content: msg.content
            })) as any[];

            const response = await AIService.chat(history, question, context);
            await this.addChatMessage('ai', response);
        } catch (e) {
            console.error('Chat failed', e);
            await this.addChatMessage('ai', '抱歉，我遇到了一些问题，无法回答您的问题。');
        } finally {
            this.isChatting = false;
        }
    },

    exportRecords(format: 'json' | 'markdown' = 'json') {
        const data = {
            paperTitle: this.parsedPaper?.sections[0]?.content.split('\n')[0] || 'Paper Analysis',
            analysis: this.aiAnalysis,
            mindCards: this.mindCards,
            chatHistory: this.chatHistory,
            exportDate: new Date().toISOString()
        };

        if (format === 'json') {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            this.downloadFile(blob, `paper-analysis-${Date.now()}.json`);
        } else if (format === 'markdown') {
            let mdContent = `# ${data.paperTitle}\n\n导出时间: ${data.exportDate}\n\n`;
            
            mdContent += `## 1. AI 导读分析\n`;
            for (const [sectionId, analysis] of Object.entries(this.aiAnalysis)) {
                const section = this.parsedPaper?.sections.find(s => s.id === sectionId);
                mdContent += `### ${section?.title || sectionId}\n\n${analysis}\n\n`;
            }

            mdContent += `## 2. 思维卡片\n`;
            for (const [sectionId, cards] of Object.entries(this.mindCards)) {
                const section = this.parsedPaper?.sections.find(s => s.id === sectionId);
                mdContent += `### ${section?.title || sectionId}\n`;
                cards.forEach((card: any) => {
                    mdContent += `- **${card.title}**: ${card.definition}\n`;
                    mdContent += `  - 核心概念: ${card.concept}\n`;
                    mdContent += `  - 关键点: ${card.keyPoints.join(', ')}\n`;
                    mdContent += `  - 意义: ${card.implication}\n\n`;
                });
            }

            mdContent += `## 3. 问答记录\n`;
            this.chatHistory.forEach(msg => {
                const role = msg.role === 'user' ? '我' : 'AI';
                mdContent += `**${role}**: ${msg.content}\n\n`;
            });

            const blob = new Blob([mdContent], { type: 'text/markdown' });
            this.downloadFile(blob, `paper-analysis-${Date.now()}.md`);
        }
    },

    downloadFile(blob: Blob, filename: string) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    async generateMindCard(text: string) {
        this.isAnalyzing = true;
        try {
            const sectionId = this.currentSection?.id || 'unknown';
            if (!this.mindCards[sectionId]) {
                this.mindCards[sectionId] = [];
            }

            const cardData = await AIService.generateMindCard(text);
            
            const newCard = {
                id: Date.now(),
                ...cardData,
                originalText: text
            };

            this.mindCards[sectionId].unshift(newCard);
            await localforage.setItem('mindCards', JSON.parse(JSON.stringify(this.mindCards)));
            
        } catch (e) {
            console.error('Mind Card Generation failed', e);
        } finally {
            this.isAnalyzing = false;
        }
    },

    async analyzeCurrentSection(apiKey?: string) {
      const section = this.currentSection;
      if (!section) {
          console.warn('⚠️ [analyzeCurrentSection] No current section found');
          return;
      }
      
      if (this.aiAnalysis[section.id]) {
          console.log('ℹ️ [analyzeCurrentSection] Analysis already exists for section:', section.title);
          return; 
      }

      console.log('🚀 [analyzeCurrentSection] Starting analysis for:', section.title);
      this.isAnalyzing = true;
      try {
        const analysis = await AIService.analyzeSection(section.title, section.content);
        console.log('✅ [analyzeCurrentSection] Analysis completed for:', section.title);
        this.aiAnalysis[section.id] = analysis;
        
        // 更新存储
        await localforage.setItem('aiAnalysis', JSON.parse(JSON.stringify(this.aiAnalysis)));

      } catch (e) {
        console.error('❌ [analyzeCurrentSection] Analysis failed', e);
      } finally {
        this.isAnalyzing = false;
      }
    }
  }
});
