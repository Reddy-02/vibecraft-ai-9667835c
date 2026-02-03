import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
          className="relative w-14 h-14 rounded-full p-0 border-0 overflow-hidden group"
          style={{
            background: 'linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(0 0% 85%) 100%)',
            boxShadow: '0 4px 20px hsl(0 0% 0% / 0.3), 0 0 40px hsl(0 0% 100% / 0.1), inset 0 1px 0 hsl(0 0% 100% / 0.4)',
          }}
          aria-label="Open Assistant"
        >
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isOpen ? (
              <X className="w-5 h-5 text-black" />
            ) : (
              <MessageCircle className="w-5 h-5 text-black" />
            )}
          </motion.div>
          
          {/* Pulse ring */}
          {!isOpen && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-foreground/20"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </Button>
      </motion.div>

      <AssistantPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default BujjiOrb;
