import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Bot, User, ChevronDown, ChevronUp, ScrollText, Library, Terminal, FileText, Download, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// 自定义代码块组件，实现折叠功能
const CodeBlock = ({ children, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const lang = className ? className.replace('language-', '') : 'code';
  
  return (
    <details className="my-2 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 shadow-sm" open={isOpen} onToggle={(e) => setIsOpen(e.target.open)}>
      <summary className="px-3 py-1.5 text-xs text-gray-500 cursor-pointer hover:bg-gray-100 flex items-center justify-between select-none font-mono">
        <div className="flex items-center gap-2">
          <Terminal size={12} />
          <span>{lang.toUpperCase()} 代码块</span>
        </div>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </summary>
      <div className="border-t border-gray-100">
        <pre className="p-3 overflow-x-auto bg-gray-800 text-white text-xs leading-relaxed">
          <code className={className}>{children}</code>
        </pre>
      </div>
    </details>
  );
};

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState('');
  const [skills, setSkills] = useState({});
  const [outputs, setOutputs] = useState([]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchStatus();
    const timer = setInterval(fetchStatus, 5000); // 每 5 秒轮询一次状态
    return () => clearInterval(timer);
  }, []);

  const fetchStatus = async () => {
    try {
      const taskRes = await axios.get('/api/tasks');
      setTasks(taskRes.data.content);
      const skillRes = await axios.get('/api/skills');
      setSkills(skillRes.data.skills);
      const outputRes = await axios.get('/api/outputs');
      setOutputs(outputRes.data.files);
    } catch (err) {
      console.error('Failed to fetch status:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let currentBotMessage = { role: 'bot', thinking: '', content: '', executionResults: [] };
    setMessages((prev) => [...prev, currentBotMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.type === 'thinking') {
              currentBotMessage.thinking += data.delta;
            } else if (data.type === 'content') {
              currentBotMessage.content += data.delta;
            } else if (data.type === 'execution_result') {
                currentBotMessage.executionResults.push(data.content);
            }

            setMessages((prev) => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = { ...currentBotMessage };
              return newMessages;
            });
          } catch (e) {
            console.error('Error parsing chunk:', e, line);
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
      fetchStatus();
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col hidden lg:flex">
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Bot className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Alice Agent</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <section>
            <div className="flex items-center gap-2 mb-2 text-indigo-600 font-semibold">
              <ScrollText size={18} />
              <span>任务清单 (Todo)</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 whitespace-pre-wrap border border-gray-100 max-h-40 overflow-y-auto">
              {tasks || '正在加载...'}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2 text-indigo-600 font-semibold">
              <FileText size={18} />
              <span>成果物 (Outputs)</span>
            </div>
            <div className="space-y-1">
              {outputs.length > 0 ? (
                outputs.map(file => (
                  <div key={file.name} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md group">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="text-gray-400 shrink-0"><FileText size={14} /></div>
                      <span className="text-xs text-gray-600 truncate font-medium">{file.name}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={file.url} target="_blank" rel="noreferrer" className="p-1 text-gray-400 hover:text-indigo-600" title="预览">
                        <ExternalLink size={14} />
                      </a>
                      <a href={file.url} download className="p-1 text-gray-400 hover:text-indigo-600" title="下载">
                        <Download size={14} />
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-400 text-center py-2 italic">暂无输出文件</div>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2 text-indigo-600 font-semibold">
              <Library size={18} />
              <span>技能库 (Skills)</span>
            </div>
            <div className="space-y-2">
              {Object.keys(skills).map(name => (
                <div key={name} className="p-2 bg-white border border-gray-200 rounded-md shadow-sm text-xs">
                  <div className="font-bold text-gray-700">{name}</div>
                  <div className="text-gray-500 line-clamp-2">{skills[name].description}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[85%] flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  msg.role === 'user' ? "bg-indigo-100 text-indigo-600" : "bg-gray-800 text-white"
                )}>
                  {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                
                <div className="space-y-2">
                  {msg.role === 'bot' && msg.thinking && (
                    <details className="group bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                      <summary className="px-3 py-1.5 text-xs text-gray-500 cursor-pointer hover:bg-gray-100 flex items-center justify-between select-none">
                        <div className="flex items-center gap-2">
                          <Terminal size={12} />
                          <span>Alice 的思考过程</span>
                        </div>
                        <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
                      </summary>
                      <div className="px-3 py-2 text-sm text-gray-600 italic border-t border-gray-100 bg-white whitespace-pre-wrap">
                        {msg.thinking}
                      </div>
                    </details>
                  )}

                  <div className={cn(
                    "rounded-2xl px-4 py-2 shadow-sm",
                    msg.role === 'user' ? "bg-indigo-600 text-white" : "bg-white text-gray-800 border border-gray-200"
                  )}>
                    <ReactMarkdown 
                      className="prose prose-sm max-w-none prose-pre:p-0 prose-pre:bg-transparent prose-pre:m-0"
                      components={{
                        code: ({ node, inline, className, children, ...props }) => {
                          return inline ? (
                            <code className={cn("bg-gray-100 text-pink-600 px-1 rounded font-mono text-[0.9em]", className)} {...props}>
                              {children}
                            </code>
                          ) : (
                            <CodeBlock className={className}>{children}</CodeBlock>
                          );
                        }
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  {msg.role === 'bot' && msg.executionResults && msg.executionResults.length > 0 && (
                    <details className="group bg-gray-900 rounded-lg overflow-hidden mt-2">
                      <summary className="px-3 py-1.5 text-xs text-gray-400 cursor-pointer hover:bg-gray-800 flex items-center justify-between select-none">
                        <div className="flex items-center gap-2">
                          <Terminal size={12} />
                          <span>执行反馈 ({msg.executionResults.length} 条记录)</span>
                        </div>
                        <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
                      </summary>
                      <div className="space-y-2 p-2 border-t border-gray-800 max-h-60 overflow-y-auto">
                        {msg.executionResults.map((res, idx) => (
                          <div key={idx} className="text-[11px] text-green-400 font-mono overflow-x-auto whitespace-pre-wrap pb-2 border-b border-gray-800 last:border-0 last:pb-0">
                            <div className="text-gray-500 mb-1"># [{idx + 1}] Feedback</div>
                            {res}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="问问 Alice..."
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400 text-gray-800"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
            >
              <Send size={20} />
            </button>
          </form>
          <p className="text-center text-[10px] text-gray-400 mt-2">
            Alice 是一个自主演化智能体 · 思考过程由 LLM 实时生成
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
