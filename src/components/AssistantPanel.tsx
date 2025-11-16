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
    <Card className="fixed bottom-28 right-6 w-96 h-[500px] z-40 glass-panel border-2 border-neon-purple/50 flex flex-col animate-scale-in">
      <div className="absolute inset-0 hologram-grid opacity-10" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-2 p-4 border-b border-border/50">
          <Sparkles className="w-5 h-5 text-neon-cyan" />
          <h3 className="font-bold text-lg text-neon-purple">Bujji Assistant</h3>
        </div>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-neon-purple to-neon-pink text-white'
                      : 'glass-panel border border-neon-cyan/30'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border/50">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              className="glass-panel border-neon-purple/30"
            />
            <Button
              onClick={handleSend}
              className="bg-gradient-to-r from-neon-purple to-neon-pink neon-glow"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AssistantPanel;
