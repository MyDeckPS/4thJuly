
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useEnhancedQuiz } from "@/hooks/useEnhancedQuiz";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import QuizLoadingSpinner from '@/components/quiz/QuizLoadingSpinner';
import EnhancedQuizStep from '@/components/quiz/EnhancedQuizStep';
import QuizSuccessScreen from '@/components/quiz/QuizSuccessScreen';

const EnhancedQuizPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile, quizResponses, refetch: refreshProfile } = useProfile();
  const { questions, quizSets, responses, updateResponse, submitQuiz, loading } = useEnhancedQuiz();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to take the quiz.",
      });
      navigate('/login');
      return;
    }

    // Check if user has already completed the quiz
    if (profile?.quiz_completed && !loading) {
      console.log('User has already completed the quiz, showing success screen');
      setShowSuccessScreen(true);
    }
  }, [user, profile, loading, navigate, toast]);

  const handleSkipQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleQuizComplete();
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleQuizComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAnswer = (questionKey: string, answer: any) => {
    console.log(`Updating response for ${questionKey}:`, answer);
    updateResponse(questionKey, answer);
  };

  const handleQuizComplete = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    console.log('=== STARTING QUIZ COMPLETION PROCESS ===');
    
    try {
      const result = await submitQuiz();
      
      if (result.error) {
        console.error('Quiz submission error:', result.error);
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      console.log('Quiz submitted successfully, refreshing profile...');
      
      // Refresh the user's profile to reflect the changes
      await refreshProfile();
      
      console.log('Profile refreshed, showing success screen');
      
      // Show success screen
      setShowSuccessScreen(true);

      toast({
        title: "Quiz Completed",
        description: "Thank you for completing the quiz!",
      });

    } catch (error: any) {
      console.error("Error during quiz completion:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <QuizLoadingSpinner />;
  }

  // Show success screen if quiz is completed
  if (showSuccessScreen || profile?.quiz_completed) {
    // Get child name from quiz responses
    const childName = quizResponses?.childName || quizResponses?.child_name || 'your child';
    
    return (
      <>
        <Navigation />
        <QuizSuccessScreen 
          userName={profile?.name || user?.email?.split('@')[0]}
          childName={childName}
        />
        <Footer />
      </>
    );
  }

  if (questions.length === 0) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-soft flex items-center justify-center px-4 pt-20 md:pt-24">
          <Card className="w-full max-w-md text-center">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-2">No Questions Available</h2>
              <p className="text-muted-foreground mb-4">
                The quiz is not yet configured. Please contact support.
              </p>
              <Button asChild>
                <Link to="/">Go Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-soft pt-20 md:pt-24 pb-8">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Lottie Animation */}
            <div className="w-full max-w-xs mx-auto mb-6">
              <DotLottieReact
                src="https://lottie.host/87748159-1635-4937-9058-33b307d03f71/lPzwAFZ74Z.lottie"
                loop
                autoplay
              />
            </div>

            {/* Quiz Set Title and Description */}
            {quizSets.length > 0 && (
              (() => {
                const currentSet = quizSets.find(set => 
                  set.questions.some(q => q.id === currentQuestion.id)
                );
                
                if (currentSet) {
                  return (
                    <div className="text-center mb-8">
                      <h1 className="text-3xl md:text-4xl font-bold text-forest mb-4">{currentSet.title}</h1>
                      {currentSet.description && (
                        <p className="text-lg text-muted-foreground mb-6">{currentSet.description}</p>
                      )}
                    </div>
                  );
                }
                return null;
              })()
            )}

            {/* Quiz Content Card */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-6 md:p-8">
                <EnhancedQuizStep
                  question={currentQuestion}
                  currentStep={currentQuestionIndex + 1}
                  totalSteps={questions.length}
                  responses={responses}
                  onAnswer={handleAnswer}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  onSkip={handleSkipQuestion}
                  canGoNext={true}
                  canGoPrevious={currentQuestionIndex > 0}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default EnhancedQuizPage;
