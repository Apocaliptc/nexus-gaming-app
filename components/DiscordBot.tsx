import React, { useState, useRef, useEffect } from 'react';
import { Bot, Command, Shield, Zap, Send, Layout } from 'lucide-react';

export const DiscordBot: React.FC = () => {
  const [messages, setMessages] = useState<Array<{id: number, user: string, content: React.ReactNode, isBot: boolean}>>([
    { id: 1, user: 'NexusBot', content: 'Ready to serve! Try /stats or /compare.', isBot: true }
  ]);
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCommand = (cmd: string) => {
    // User Message
    const userMsgId = Date.now();
    setMessages(prev => [...prev, { id: userMsgId, user: 'User', content: cmd, isBot: false }]);

    // Bot Response simulation
    setTimeout(() => {
      let botContent: React.ReactNode = '';
      if (cmd.startsWith('/stats')) {
        botContent = (
          <div className="bg-[#2f3136] border-l-4 border-nexus-accent rounded p-3 max-w-sm mt-1">
            <div className="flex items-center gap-2 mb-2">
              <img src="https://picsum.photos/200?random=99" className="w-8 h-8 rounded-full" />
              <span className="font-bold text-white">Your Stats</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
               <div className="bg-[#36393f] p-2 rounded">
                 <div className="text-gray-400 text-xs">Total Hours</div>
                 <div className="text-white font-bold">372h</div>
               </div>
               <div className="bg-[#36393f] p-2 rounded">
                 <div className="text-gray-400 text-xs">Trophies</div>
                 <div className="text-yellow-500 font-bold">153</div>
               </div>
            </div>
            <div className="mt-2 text-xs text-gray-400">Top Game: Elden Ring (145h)</div>
          </div>
        );
      } else if (cmd.startsWith('/compare')) {
         botContent = (
          <div className="bg-[#2f3136] border-l-4 border-nexus-secondary rounded p-3 max-w-sm mt-1">
            <div className="font-bold text-white mb-2">Comparison Result</div>
            <div className="space-y-2 text-sm">
               <div className="flex justify-between items-center">
                 <span className="text-gray-300">You</span>
                 <span className="font-bold text-nexus-secondary">92% Match</span>
                 <span className="text-gray-300">@DragonSlayer</span>
               </div>
               <div className="h-2 bg-[#36393f] rounded-full overflow-hidden">
                 <div className="h-full bg-nexus-secondary w-[92%]"></div>
               </div>
               <div className="text-xs text-gray-400 text-center">You both love RPGs!</div>
            </div>
          </div>
        );
      } else {
        botContent = 'Command not recognized. Try /stats.';
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, user: 'NexusBot', content: botContent, isBot: true }]);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    handleCommand(inputValue);
    setInputValue('');
  };

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden animate-fade-in">
      {/* Marketing Side */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-xl mx-auto md:mx-0 space-y-6">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-[#5865F2] to-indigo-600 shadow-xl shadow-indigo-500/20 mb-2">
            <Bot size={48} className="text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight">
            Bring Nexus to <span className="text-[#5865F2]">Discord</span>
          </h1>
          
          <p className="text-lg text-gray-400">
            Seamlessly integrate your gaming life. Share stats, compare achievements, and get AI insights without leaving your server.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button className="px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-[#5865F2]/25 flex items-center justify-center gap-2">
               <Zap size={18} /> Add to Server
            </button>
            <button className="px-6 py-3 bg-nexus-800 hover:bg-nexus-700 text-white rounded-xl font-bold border border-nexus-700 transition-all flex items-center justify-center gap-2">
               <Shield size={18} /> Documentation
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <div className="bg-nexus-800/50 p-4 rounded-xl border border-nexus-700/50">
               <Command className="text-nexus-accent mb-2" size={24} />
               <h4 className="font-bold text-white">Slash Commands</h4>
               <p className="text-sm text-gray-400">Access your entire dashboard with simple text commands.</p>
            </div>
            <div className="bg-nexus-800/50 p-4 rounded-xl border border-nexus-700/50">
               <Layout className="text-nexus-secondary mb-2" size={24} />
               <h4 className="font-bold text-white">Rich Embeds</h4>
               <p className="text-sm text-gray-400">Beautifully formatted stats cards shared instantly.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Preview Side */}
      <div className="flex-1 bg-[#202225] p-4 flex flex-col border-l border-[#2f3136] relative">
         <div className="absolute top-4 right-4 bg-nexus-accent/20 text-nexus-accent px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-nexus-accent/30">
           Live Preview
         </div>
         
         {/* Chat Window */}
         <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.isBot ? '' : 'flex-row-reverse'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.isBot ? 'bg-[#5865F2]' : 'bg-nexus-700'}`}>
                   {msg.isBot ? <Bot size={20} className="text-white"/> : <span className="text-white font-bold text-xs">YOU</span>}
                </div>
                <div className={`max-w-[80%] ${msg.isBot ? '' : 'text-right'}`}>
                   <div className="flex items-center gap-2 mb-1 justify-end flex-row-reverse">
                      <span className="text-xs text-gray-400">Today at {new Date().getHours()}:{new Date().getMinutes().toString().padStart(2, '0')}</span>
                      <span className="font-bold text-white text-sm">{msg.user}</span>
                   </div>
                   <div className={`text-gray-200 text-sm ${msg.isBot ? '' : 'bg-[#2f3136] px-3 py-2 rounded-xl inline-block text-left'}`}>
                     {msg.content}
                   </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
         </div>

         {/* Input Area */}
         <div className="bg-[#40444b] p-2 rounded-lg flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-[#202225]">
               <span className="font-bold text-xs">+</span>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 flex">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Try /stats or /compare"
                className="bg-transparent text-gray-200 text-sm flex-1 outline-none placeholder-gray-500"
              />
              <button type="submit" className="text-gray-400 hover:text-white transition-colors">
                 <Send size={18} />
              </button>
            </form>
         </div>
         <div className="text-center mt-2">
            <div className="inline-flex gap-2">
               <button onClick={() => handleCommand('/stats')} className="text-xs bg-[#5865F2]/20 text-[#5865F2] px-2 py-1 rounded hover:bg-[#5865F2]/30 transition-colors">/stats</button>
               <button onClick={() => handleCommand('/compare @DragonSlayer')} className="text-xs bg-[#5865F2]/20 text-[#5865F2] px-2 py-1 rounded hover:bg-[#5865F2]/30 transition-colors">/compare</button>
            </div>
         </div>
      </div>
    </div>
  );
};