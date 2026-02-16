import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TypeWriter = ({ text, speed = 50, delay = 0 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isComplete) return;

    const timer = setTimeout(() => {
      if (displayedText.length < text.length) {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      } else {
        setIsComplete(true);
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [displayedText, text, speed, isComplete]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.5 }}
      className="inline-block"
    >
      {displayedText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.7, repeat: Infinity }}
          className="inline-block ml-1 w-1 h-12 bg-yellow-400"
        />
      )}
    </motion.span>
  );
};

export default TypeWriter;
