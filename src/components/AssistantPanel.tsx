import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AssistantPanel = ({ isOpen, onClose }: AssistantPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm Bujji, your VibeCraft AI assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const responses = [
        'I can help you understand your emotions better!',
        'Your mood patterns show interesting insights.',
        'Would you like some personalized affirmations?',
        "Let's explore how your emotions evolve throughout the day.",
      ];
      
      const aiMessage: Message = {
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(aiMessage.content);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed bottom-24 right-6 w-80 sm:w-96 h-[480px] z-40 glass-panel-elevated flex flex-col overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-border/30">
            <div className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center">
              <Bot className="w-4 h-4 text-background" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-foreground">Bujji</h3>
              <p className="text-[11px] text-muted-foreground">AI Assistant</p>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary/60 border border-border/30">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground/50 animate-pulse" />
              <span className="text-[10px] text-muted-foreground font-medium">Online</span>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 px-4" ref={scrollRef}>
            <div className="space-y-3 py-4">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <div className={`
                    w-7 h-7 rounded-lg shrink-0 flex items-center justify-center
                    ${msg.role === 'user' 
                      ? 'bg-secondary' 
                      : 'bg-foreground'
                    }
                  `}>
                    {msg.role === 'user' 
                      ? <User className="w-3.5 h-3.5 text-foreground" />
                      : <Sparkles className="w-3.5 h-3.5 text-background" />
                    }
                  </div>
                  <div
                    className={`
                      max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed
                      ${msg.role === 'user'
                        ? 'bg-foreground text-background rounded-br-md'
                        : 'bg-secondary/60 text-foreground border border-border/30 rounded-bl-md'
                      }
                    `}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  className="flex gap-2.5"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-background" />
                  </div>
                  <div className="bg-secondary/60 border border-border/30 rounded-2xl rounded-bl-md px-3.5 py-2.5">
                    <div className="flex gap-1">
                      <motion.span 
                        className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      />
                      <motion.span 
                        className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.span 
                        className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t border-border/30">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything…"
                className="bg-secondary/50 border-border/30 text-xs h-10 rounded-xl focus-visible:ring-1"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim()}
                className="h-10 w-10 p-0 rounded-xl btn-premium"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AssistantPanel;
