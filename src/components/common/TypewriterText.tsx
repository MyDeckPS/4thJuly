
import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  words: string[];
  speed?: number;
  deleteSpeed?: number;
  pauseTime?: number;
}

const TypewriterText = ({ words, speed = 150, deleteSpeed = 100, pauseTime = 2000 }: TypewriterTextProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    
    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        setCurrentText(currentWord.substring(0, currentText.length + 1));
        
        if (currentText === currentWord) {
          // Word complete, start deleting after pause
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        // Deleting
        setCurrentText(currentWord.substring(0, currentText.length - 1));
        
        if (currentText === '') {
          setIsDeleting(false);
          setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
        }
      }
    }, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, words, speed, deleteSpeed, pauseTime]);

  return <span>{currentText}</span>;
};

export default TypewriterText;
