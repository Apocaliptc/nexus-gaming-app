
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, Loader2, Eraser, MessageSquare, Zap, Cpu, History, BrainCircuit } from 'lucide-react';
import { createOracleChat } from '../services/geminiService';
import { useAppContext } from '../context/AppContext';
import { GenerateContentResponse } from '@google/genai';

interface Message {
  role: 'user' | 'oracle';
  text: string;
}

export const NexusOracle: React.FC = () => {
  const { userStats } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'oracle', text: 'Saudações, viajante do Nexus. Sou o Oráculo. O que deseja desvendar hoje? Lore, hardware ou seu próximo desafio?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!chatInstanceRef.current) {
      chatInstanceRef.current = createOracleChat(userStats || undefined);
    }
  }, [userStats]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent, customPrompt?: string) => {
    e?.preventDefault();
    const messageText = customPrompt || input;
    if (!messageText.trim() || isTyping) return;

    const userMessage: Message = { role: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      if (!chatInstanceRef.current) {
        chatInstanceRef.current = createOracleChat(userStats || undefined);
      }

      const streamResponse = await chatInstanceRef.current.sendMessageStream({ message: messageText });
      
      let oracleText = '';
      setMessages(prev => [...prev, { role: 'oracle', text: '' }]);

      for await (const chunk of streamResponse) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          oracleText += c.text;
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].text = oracleText;
            return newMessages;
          });
        }
      }
    } catch (err) {
      console.error("Oracle error:", err);
      setMessages(prev => [...prev, { role: 'oracle', text: 'Desculpe, minhas conexões com o Plano de Dados falharam momentaneamente. Tente novamente.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'oracle', text: 'Memória limpa. O que mais o Nexus pode revelar?' }]);
    chatInstanceRef.current = createOracleChat(userStats || undefined);
  };

  const quickPrompts = [
    { label: "Dicas de Elden Ring", prompt: "Me dê 3 dicas avançadas para Elden Ring." },
    { label: "Lore de Bloodborne", prompt: "Explique brevemente a origem dos Grandes em Bloodborne." },
    { label: "Configuração PC", prompt: "O que priorizar em um PC para 1440p/144Hz hoje?" },
    { label: "Meu Perfil", prompt: "Baseado no meu perfil, qual jogo deveria ser meu próximo foco?" }
  ];

  return (
    <div className="h-full flex flex-col bg-[#050507] text-gray-100 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-nexus-accent/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <header className="p-6 md:p-8 border-b border-nexus-800 flex justify-between items-center relative z-10 bg-[#050507]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-nexus-accent/20 rounded-2xl flex items-center justify-center border border-nexus-accent/30 shadow-lg shadow-nexus-accent/10">
            <BrainCircuit size={28} className="text-nexus-accent animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white tracking-tight">Nexus Oracle</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1">
              <span className="w-2 h-2 bg-nexus-success rounded-full"></span> Conectado ao Plano Pro
            </p>
          </div>
        </div>
        
        <button 
          onClick={clearChat}
          className="p-2 hover:bg-nexus-800 rounded-xl transition-all text-gray-500 hover:text-white flex items-center gap-2 text-sm font-bold"
          title="Limpar Memória"
        >
          <Eraser size={18} /> <span className="hidden md:inline">Resetar</span>
        </button>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar relative z-10">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
              msg.role === 'oracle' 
                ? 'bg-nexus-accent/10 border-nexus-accent/20 text-nexus-accent' 
                : 'bg-nexus-800 border-nexus-700 text-gray-300'
            }`}>
              {msg.role === 'oracle' ? <Bot size={20} /> : <UserCircle size={20} />}
            </div>
            
            <div className={`max-w-[85%] md:max-w-[70%] space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'oracle' 
                  ? 'bg-nexus-800/50 border border-nexus-700 text-gray-200' 
                  : 'bg-nexus-accent text-white shadow-xl shadow-nexus-accent/10'
              }`}>
                {msg.text || (isTyping && msg.role === 'oracle' ? <Loader2 size={16} className="animate-spin" /> : '')}
                {msg.role === 'oracle' && msg.text && <div className="mt-2 h-0.5 w-8 bg-nexus-accent/30 rounded-full"></div>}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <footer className="p-4 md:p-8 bg-gradient-to-t from-[#050507] via-[#050507] to-transparent relative z-10">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Quick Prompts */}
          {messages.length < 3 && !isTyping && (
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {quickPrompts.map((qp, i) => (
                <button 
                  key={i}
                  onClick={() => handleSend(undefined, qp.prompt)}
                  className="px-4 py-2 bg-nexus-800/40 border border-nexus-700 hover:border-nexus-accent rounded-full text-xs font-bold text-gray-400 hover:text-white transition-all whitespace-nowrap"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSend} className="relative group">
            <div className="absolute inset-0 bg-nexus-accent/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-[2rem]"></div>
            <div className="relative bg-nexus-900 border border-nexus-800 focus-within:border-nexus-accent rounded-[2rem] flex items-center px-6 py-4 transition-all shadow-2xl">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Pergunte ao Oráculo..."
                className="bg-transparent border-none outline-none text-white w-full text-sm md:text-base font-medium placeholder-gray-600"
                disabled={isTyping}
              />
              <button 
                type="submit" 
                disabled={isTyping || !input.trim()}
                className="ml-4 p-2 bg-nexus-accent text-white rounded-xl shadow-lg shadow-nexus-accent/20 disabled:opacity-50 disabled:shadow-none hover:scale-110 transition-all"
              >
                {isTyping ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              </button>
            </div>
          </form>
          
          <p className="text-[10px] text-center text-gray-600 font-bold uppercase tracking-[0.2em] animate-pulse">
            Nexus AI: Consumindo API Gemini-3-Pro
          </p>
        </div>
      </footer>
    </div>
  );
};

import { UserCircle } from 'lucide-react';
