import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AssistantPanel from './AssistantPanel';

const BujjiOrb = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-12 h-12 rounded-full p-0 border border-border/40 overflow-hidden group btn-premium"
          aria-label="Open Assistant"
        >
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <MessageCircle className="w-4 h-4" />
            )}
          </motion.div>
          
          {!isOpen && (
            <motion.div
              className="absolute inset-0 rounded-full border border-foreground/10"
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </Button>
      </motion.div>

      <AssistantPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default BujjiOrb;
