import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AssistantPanel from './AssistantPanel';

const BujjiOrb = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink p-0 neon-glow animate-float hover:scale-110 transition-transform"
        aria-label="Open Bujji Assistant"
      >
        {isOpen ? (
          <X className="w-8 h-8" />
        ) : (
          <MessageCircle className="w-8 h-8" />
        )}
      </Button>

      <AssistantPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default BujjiOrb;
