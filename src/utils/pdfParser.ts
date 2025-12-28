import * as pdfjsLib from 'pdfjs-dist';

// 设置 workerSrc
// 在 Vite 中，我们需要正确指向 worker 文件。
// 这里的路径可能需要根据实际构建情况调整，或者使用 CDN。
// 为了开发方便，我们尝试使用 CDN，或者假设构建工具能处理。
// 更好的方式是 import worker url。
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface PaperSection {
  id: string;
  title: string;
  content: string;
  pageIndex: number;
}

export interface ParsedPaper {
  text: string;
  sections: PaperSection[];
  pageCount: number;
}

// 常见的论文一级标题正则
// 增强版：支持序号 (1. Introduction, I. Introduction), 大小写不敏感
const SECTION_HEADERS_REGEX = /^(\d+\.?\s*|I+\.?\s*|IV\.?\s*|V\.?\s*|VI+\.?\s*)?(ABSTRACT|INTRODUCTION|RELATED WORK|BACKGROUND|METHODOLOGY|METHODS|EXPERIMENTS|RESULTS|DISCUSSION|CONCLUSION|REFERENCES|ACKNOWLEDGMENT|APPENDIX|DATA ANALYSIS|LITERATURE REVIEW)/i;

interface TextLine {
    text: string;
    fontSize: number;
    isBold: boolean;
    y: number;
}

export class PdfParser {
  static async parse(file: File): Promise<ParsedPaper> {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    const sections: PaperSection[] = [];
    let currentSection: PaperSection | null = null;

    // 1. 预扫描：统计字号分布，找出正文字号
    const fontSizeCounts: Record<number, number> = {};
    const allLines: TextLine[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // 将 items 聚合成行
      let currentLine: TextLine | null = null;
      
      // 按照 Y 坐标排序，确保从上到下（PDF 坐标系 Y 轴向上，所以 Y 越大越靠上）
      // 但 textContent.items 通常已经是排好序的，或者大致有序
      // 为了保险，我们还是按流式处理，利用 Y 差值判断换行

      for (const item of textContent.items) {
        if ('str' in item) {
            const fontSize = Math.round(item.transform[0]); // 取整，便于统计
            const text = item.str;
            const y = item.transform[5];
            
            // 统计字号
            if (text.trim().length > 0) {
                fontSizeCounts[fontSize] = (fontSizeCounts[fontSize] || 0) + text.length;
            }

            // 判断是否换行
            if (!currentLine || Math.abs(currentLine.y - y) > 5) { // 阈值设为 5
                if (currentLine) {
                    allLines.push(currentLine);
                }
                currentLine = {
                    text: text,
                    fontSize: fontSize,
                    isBold: item.fontName.toLowerCase().includes('bold'),
                    y: y
                };
            } else {
                // 同一行，拼接
                currentLine.text += text; // 某些 PDF 可能会把单词拆开，这里简单拼接
                // 如果字号变大，更新为较大的字号（标题通常字号大）
                if (fontSize > currentLine.fontSize) {
                    currentLine.fontSize = fontSize;
                }
            }
        }
      }
      if (currentLine) {
          allLines.push(currentLine);
      }
      
      // 添加分页标记（可选，这里为了简单直接拼接到 allLines）
      // 实际处理时需要知道页码，我们在 allLines 里存一下 pageIndex 比较好
      // 这里简化处理，直接在循环里处理章节
    }

    // 找出正文字号（出现最多的字号）
    let bodyFontSize = 10;
    let maxCount = 0;
    for (const size in fontSizeCounts) {
        if (fontSizeCounts[size] > maxCount) {
            maxCount = fontSizeCounts[size];
            bodyFontSize = Number(size);
        }
    }
    
    console.log('Detected body font size:', bodyFontSize);

    // 2. 再次遍历所有行，识别章节
    // 由于我们需要页码，这里重新遍历一遍页面，或者刚才应该存下来
    // 为了代码结构清晰，我们采用流式处理：边读取边解析，但利用已经计算出的 bodyFontSize

    // 重置状态
    fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        let currentLine: TextLine | null = null;
        
        for (const item of textContent.items) {
            if ('str' in item) {
                const fontSize = Math.round(item.transform[0]);
                const text = item.str;
                const y = item.transform[5];

                if (!currentLine || Math.abs(currentLine.y - y) > 5) {
                    if (currentLine) {
                        processLine(currentLine, i);
                    }
                    currentLine = {
                        text: text, // 这里可能需要处理空格，PDF 有时 text 之间没有空格
                        fontSize: fontSize,
                        isBold: item.fontName.toLowerCase().includes('bold'),
                        y: y
                    };
                } else {
                    // 简单的空格处理：如果前一个字符不是空格，且当前字符不是空格，可能需要补空格
                    // 但 PDF 解析很复杂，这里简单加个空格如果看起来像单词边界
                    // 实际上 pdf.js 的 item.str 有时包含空格，有时不包含
                    // 简单策略：直接拼，后续处理
                    // 修正：很多时候 item 是独立的单词，中间缺空格
                    // 更好的策略是判断 x 坐标差值，这里简化为直接加空格
                    // 但这会导致单词内出现空格。
                    // 妥协：总是加空格，除非是标点符号前
                    currentLine.text += text; 
                    if (fontSize > currentLine.fontSize) currentLine.fontSize = fontSize;
                }
            }
        }
        if (currentLine) {
            processLine(currentLine, i);
        }
        
        // 拼接全文
        // 注意：这里 fullText 只是简单拼接，用于搜索等，不影响章节结构
    }

    function processLine(line: TextLine, pageIndex: number) {
        const trimmed = line.text.trim();
        if (!trimmed) return;

        fullText += line.text + '\n';

        // 判定是否为标题
        let isHeader = false;
        
        // 规则 1: 匹配标准正则
        if (SECTION_HEADERS_REGEX.test(trimmed) && trimmed.length < 80) {
            isHeader = true;
        }
        // 规则 2: 序号引导 + 字体比正文大
        // 必须以序号开头 (1. xxx, I. xxx) 且字号大于正文
        else if (/^(\d+\.|[IVX]+\.)\s+/.test(trimmed) && line.fontSize > bodyFontSize && trimmed.length < 100) {
             isHeader = true;
        }

        if (isHeader) {
            // 这是一个新章节
            if (currentSection) {
                sections.push(currentSection);
            }
            currentSection = {
                id: `section-${sections.length}`,
                title: trimmed,
                content: '',
                pageIndex: pageIndex
            };
        } else {
            if (currentSection) {
                currentSection.content += line.text + '\n';
            } else {
                if (sections.length === 0) {
                     currentSection = {
                        id: 'front-matter',
                        title: 'Paper Info',
                        content: '',
                        pageIndex: pageIndex
                    };
                    currentSection.content += line.text + '\n';
                } else {
                    currentSection.content += line.text + '\n';
                }
            }
        }
    }

    if (currentSection) {
        sections.push(currentSection);
    }

    // 如果没有识别出任何章节，就创建一个默认章节
    if (sections.length === 0) {
        sections.push({
            id: 'full-text',
            title: 'Full Text',
            content: fullText,
            pageIndex: 1
        });
    } else {
        // 按照推荐阅读顺序排序
        const readingOrder = [
            'ABSTRACT',
            'CONCLUSION',
            'INTRODUCTION',
            'RESULTS',
            'DISCUSSION',
            'METHODOLOGY',
            'METHODS',
            'RELATED WORK'
        ];

        sections.sort((a, b) => {
            const titleA = a.title.toUpperCase();
            const titleB = b.title.toUpperCase();
            
            const indexA = readingOrder.findIndex(order => titleA.includes(order));
            const indexB = readingOrder.findIndex(order => titleB.includes(order));
            
            // 如果都在列表中，按列表顺序
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            // 如果 A 在列表中，A 排前
            if (indexA !== -1) return -1;
            // 如果 B 在列表中，B 排前
            if (indexB !== -1) return 1;
            // 都不在列表中，保持原序 (或者按页面顺序)
            return a.pageIndex - b.pageIndex;
        });
    }

    return {
      text: fullText,
      sections,
      pageCount: pdf.numPages
    };
  }

  static async getPotentialHeaders(file: File): Promise<{ title: string; fontSize: number; pageIndex: number }[]> {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    const potentialHeaders: { title: string; fontSize: number; pageIndex: number }[] = [];
    
    // 1. 统计字号
    const fontSizeCounts: Record<number, number> = {};
    for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) { // 只采样前5页
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        for (const item of textContent.items) {
            if ('str' in item && item.str.trim()) {
                const fs = Math.round(item.transform[0]);
                fontSizeCounts[fs] = (fontSizeCounts[fs] || 0) + item.str.length;
            }
        }
    }
    let bodyFontSize = 10;
    let maxCount = 0;
    for (const size in fontSizeCounts) {
        if (fontSizeCounts[size] > maxCount) {
            maxCount = fontSizeCounts[size];
            bodyFontSize = Number(size);
        }
    }
    console.log('[PdfParser] Detected body font size:', bodyFontSize);

    // 2. 扫描所有行
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        let currentLine: TextLine | null = null;

        for (const item of textContent.items) {
            if ('str' in item) {
                const fontSize = Math.round(item.transform[0]);
                const text = item.str;
                const y = item.transform[5];

                if (!currentLine || Math.abs(currentLine.y - y) > 5) {
                    if (currentLine) checkLine(currentLine, i);
                    currentLine = { text, fontSize, isBold: false, y };
                } else {
                    currentLine.text += text;
                    if (fontSize > currentLine.fontSize) currentLine.fontSize = fontSize;
                }
            }
        }
        if (currentLine) checkLine(currentLine, i);
    }

    function checkLine(line: TextLine, pageIndex: number) {
        const text = line.text.trim();
        if (text.length < 2 || text.length > 100) return;
        
        // 宽松规则：
        // 1. 字号比正文大
        // 2. 或者 匹配标准正则
        // 3. 或者 序号开头
        // 4. 排除纯数字
        if (/^\d+$/.test(text)) return;

        if (line.fontSize > bodyFontSize || SECTION_HEADERS_REGEX.test(text) || /^(\d+\.|[IVX]+\.)\s+/.test(text)) {
            potentialHeaders.push({
                title: text,
                fontSize: line.fontSize,
                pageIndex: pageIndex
            });
        }
    }

    return potentialHeaders;
  }
}
