
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, SkipForward } from "lucide-react";
import QuestionTypeHandler from './QuestionTypeHandler';

interface EnhancedQuizStepProps {
  question: any;
  currentStep: number;
  totalSteps: number;
  responses: Record<string, any>;
  onAnswer: (questionId: string, answer: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSkip?: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

const EnhancedQuizStep = ({
  question,
  currentStep,
  totalSteps,
  responses,
  onAnswer,
  onNext,
  onPrevious,
  onSkip,
  canGoNext,
  canGoPrevious
}: EnhancedQuizStepProps) => {
  // Fix: Use question.question_key instead of question.id to match the storage key
  const [currentAnswer, setCurrentAnswer] = useState(responses[question.question_key] || null);

  useEffect(() => {
    // Fix: Use question.question_key instead of question.id to match the storage key
    setCurrentAnswer(responses[question.question_key] || null);
  }, [question.question_key, responses]);

  const handleAnswer = (answer: any) => {
    setCurrentAnswer(answer);
    // The onAnswer function expects question.question_key as the first parameter
    onAnswer(question.question_key, answer);
  };

  const progress = (currentStep / totalSteps) * 100;
  const isOptional = question.is_optional;
  const hasAnswer = currentAnswer !== null && currentAnswer !== undefined && currentAnswer !== '';
  const canProceed = hasAnswer || isOptional;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Question {currentStep} of {totalSteps}</span>
          {isOptional && <span className="text-warm-sage">Optional</span>}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-forest">
            {question.question_text || question.question}
            {isOptional && <span className="text-sm font-normal text-muted-foreground ml-2">(Optional)</span>}
          </CardTitle>
          {question.description && (
            <p className="text-muted-foreground text-sm">{question.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <QuestionTypeHandler
            question={question}
            value={currentAnswer}
            onChange={handleAnswer}
          />
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {isOptional && !hasAnswer && onSkip && (
            <Button
              variant="outline"
              onClick={onSkip}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <SkipForward className="w-4 h-4" />
              Skip
            </Button>
          )}
          
          <Button
            onClick={onNext}
            disabled={!canGoNext || !canProceed}
            className="flex items-center gap-2 bg-warm-sage hover:bg-forest"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedQuizStep;
