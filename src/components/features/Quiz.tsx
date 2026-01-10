import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Share2, Copy, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { quizQuestions, getQuizClass, getHornyLevel, type QuizClass } from '@/content/quizQuestions';
import { setQuizResult, unlockBadge } from '@/lib/storage';
import { generateQuizCard, downloadImage } from '@/lib/canvasCard';
import { openXShare, copyToClipboard, getQuizShareText, getShareUrl } from '@/lib/share';
import { addHornyMeter } from '@/components/features/HornyMeter';
import { toast } from 'sonner';

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<{ class: QuizClass; level: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);

  const handleAnswer = (questionId: number, optionId: string, points: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const calculateResult = useCallback(() => {
    const totalScore = quizQuestions.reduce((sum, q) => {
      const answer = answers[q.id];
      const option = q.options.find(o => o.id === answer);
      return sum + (option?.points || 0);
    }, 0);

    const quizClass = getQuizClass(totalScore);
    const level = getHornyLevel(totalScore);

    // Save result
    setQuizResult({
      class: quizClass.name,
      level,
      completedAt: new Date().toISOString(),
    });

    // Unlock badges
    unlockBadge('quiz-complete');
    if (quizClass.id === 'meta-demon') {
      unlockBadge('meta-demon');
    }

    // Add to horny meter
    addHornyMeter(15);

    setResult({ class: quizClass, level });
  }, [answers]);

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      calculateResult();
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleShare = async () => {
    if (!result) return;
    
    unlockBadge('first-share');
    
    const shareText = getQuizShareText(result.class.name, result.level);
    openXShare({
      text: shareText,
      url: getShareUrl('/interact'),
    });
  };

  const handleCopyShare = async () => {
    if (!result) return;
    
    const shareText = `${getQuizShareText(result.class.name, result.level)}\n${getShareUrl('/interact')}`;
    const success = await copyToClipboard(shareText);
    
    if (success) {
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadCard = async () => {
    if (!result) return;
    
    setGeneratingImage(true);
    try {
      const imageData = await generateQuizCard(
        result.class.name,
        result.level,
        result.class.description
      );
      downloadImage(imageData, `horny-level-${result.class.id}.png`);
      toast.success('Image downloaded!');
    } catch (error) {
      toast.error('Failed to generate image');
    }
    setGeneratingImage(false);
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
  };

  const question = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const currentAnswer = answers[question?.id];

  // Result screen
  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto"
      >
        <GlassCard variant="neon" glow className="text-center">
          {/* Class title */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm text-primary font-semibold mb-2">Your Horny Class</p>
            <h2 className="text-3xl md:text-4xl font-black text-gradient mb-4">
              {result.class.name}
            </h2>
          </motion.div>

          {/* Horny Meter */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mb-6"
          >
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Horny Level</span>
              <span className="text-primary font-bold">{result.level}%</span>
            </div>
            <div className="h-4 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${result.level}%` }}
                transition={{ delay: 0.5, duration: 1 }}
                className="h-full bg-gradient-horny"
              />
            </div>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-muted-foreground mb-4"
          >
            {result.class.description}
          </motion.p>

          {/* Action */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="p-4 rounded-lg bg-primary/10 border border-primary/30 mb-6"
          >
            <p className="text-sm font-medium text-primary">
              🎯 {result.class.action}
            </p>
          </motion.div>

          {/* Share buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="space-y-3"
          >
            <Button variant="gradient" className="w-full" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              POST MY HORNY LEVEL
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={handleCopyShare}
              >
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy Text'}
              </Button>
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={handleDownloadCard}
                disabled={generatingImage}
              >
                {generatingImage ? 'Generating...' : 'Download Card'}
              </Button>
            </div>

            <Button variant="ghost" className="w-full" onClick={handleRetake}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Quiz
            </Button>
          </motion.div>
        </GlassCard>
      </motion.div>
    );
  }

  // Quiz questions
  return (
    <div className="max-w-lg mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Question {currentQuestion + 1} of {quizQuestions.length}</span>
          <span className="text-primary font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full bg-gradient-horny"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <GlassCard variant="neon">
            <h3 className="text-xl font-bold mb-6">{question.question}</h3>

            <div className="space-y-3">
              {question.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(question.id, option.id, option.points)}
                  className={`w-full p-4 rounded-lg text-left transition-all duration-200 border ${
                    currentAnswer === option.id
                      ? 'bg-primary/20 border-primary'
                      : 'bg-muted/50 border-transparent hover:bg-muted hover:border-muted-foreground/30'
                  }`}
                >
                  <span className="font-semibold text-primary mr-2">{option.id}.</span>
                  {option.text}
                </button>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentQuestion === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        <Button
          variant="gradient"
          onClick={handleNext}
          disabled={!currentAnswer}
        >
          {currentQuestion === quizQuestions.length - 1 ? 'SCAN MY DESIRE' : 'Next'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
