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
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary p-0 premium-glow-strong hover:scale-105 transition-all shadow-lg"
        aria-label="Open Assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </Button>

      <AssistantPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default BujjiOrb;
