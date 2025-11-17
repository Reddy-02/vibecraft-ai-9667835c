import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
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
      content: 'Hello! I\'m Bujji, your VibeCraft AI assistant. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
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

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'I can help you understand your emotions better!',
        'Your mood patterns show interesting insights.',
        'Would you like some personalized affirmations?',
        'Let\'s explore how your emotions evolve throughout the day.',
      ];
      
      const aiMessage: Message = {
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      
      // Text-to-speech
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(aiMessage.content);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-96 h-[480px] z-40 glass-panel p-4 premium-glow border border-border/50 flex flex-col rounded-lg animate-scale-in">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/30">
        <h3 className="text-lg font-light text-foreground">Assistant</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="hover:bg-primary/10 h-8 w-8 p-0"
        >
          ✕
        </Button>
      </div>

      <ScrollArea className="flex-1 mb-4" ref={scrollRef}>
        <div className="space-y-3 pr-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary/20 text-foreground border border-primary/30'
                    : 'bg-card/50 text-foreground border border-border/30'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="flex gap-2 pt-3 border-t border-border/30">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask me anything..."
          className="bg-background/50 border-border/50 text-sm h-10"
        />
        <Button
          onClick={handleSend}
          className="bg-primary hover:bg-primary/90 text-sm h-10 px-4"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default AssistantPanel;
