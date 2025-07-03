
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface EnhancedQuizQuestion {
  id: string;
  question: string;
  question_type: string;
  question_key: string;
  options: string[];
  required: boolean;
  is_required: boolean;
  sort_order: number;
  set_id?: string;
  max_selections?: number;
  enable_range_selector?: boolean;
  range_min?: number;
  range_max?: number;
  range_step?: number;
  question_config?: {
    options?: any;
    max_selections?: number;
    enable_range_selector?: boolean;
    range_min?: number;
    range_max?: number;
    range_step?: number;
  };
}

interface QuizSet {
  id: string;
  title: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  questions: EnhancedQuizQuestion[];
}

interface QuizResponse {
  [key: string]: any;
}

interface ValidationResult {
  is_valid: boolean;
  missing_questions: string[];
}

export const useEnhancedQuiz = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<EnhancedQuizQuestion[]>([]);
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  const [responses, setResponses] = useState<QuizResponse>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    fetchQuestionsAndSets();
  }, []);

  const fetchQuestionsAndSets = async () => {
    try {
      console.log('=== FETCHING QUIZ QUESTIONS AND SETS ===');
      
      // Fetch quiz sets
      const { data: setsData, error: setsError } = await supabase
        .from('quiz_sets')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (setsError) {
        console.error('Error fetching quiz sets:', setsError);
        throw setsError;
      }

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('active', true)
        .order('sort_order');

      if (questionsError) {
        console.error('Error fetching quiz questions:', questionsError);
        throw questionsError;
      }

      console.log('Raw sets data:', setsData);
      console.log('Raw questions data:', questionsData);
      
      if (!questionsData || questionsData.length === 0) {
        console.warn('No quiz questions found in database');
        setQuestions([]);
        setQuizSets([]);
        return;
      }

      // Transform questions
      const transformedQuestions = questionsData.map((item: any) => {
        console.log(`Processing question:`, item.question);

        const config = item.question_config || {};
        const mergedItem = { ...item, ...config };

        const rawOptions = mergedItem.options;
        console.log('Raw options for question:', rawOptions);

        let processedOptions: string[] = [];
        
        if (rawOptions && Array.isArray(rawOptions)) {
          processedOptions = rawOptions.map(option => String(option));
        } else if (typeof rawOptions === 'string') {
          try {
            const parsed = JSON.parse(rawOptions);
            if (Array.isArray(parsed)) {
              processedOptions = parsed.map(String);
            }
          } catch (e) {
            console.error('Failed to parse options string:', rawOptions, e);
          }
        }
        
        console.log('Final processed options:', processedOptions);
        
        return {
          ...mergedItem,
          options: processedOptions,
          required: mergedItem.is_required || mergedItem.required || false,
        };
      }) as EnhancedQuizQuestion[];

      // Group questions by sets
      const organizedSets: QuizSet[] = [];
      
      if (setsData && setsData.length > 0) {
        setsData.forEach(set => {
          const setQuestions = transformedQuestions
            .filter(q => q.set_id === set.id)
            .sort((a, b) => a.sort_order - b.sort_order);
          
          organizedSets.push({
            ...set,
            questions: setQuestions
          });
        });
      }

      // Add questions without sets to a default set
      const questionsWithoutSet = transformedQuestions.filter(q => !q.set_id);
      if (questionsWithoutSet.length > 0) {
        organizedSets.push({
          id: 'default',
          title: 'General Questions',
          description: 'Additional questions',
          sort_order: 999,
          is_active: true,
          questions: questionsWithoutSet
        });
      }

      // Sort sets by sort_order
      organizedSets.sort((a, b) => a.sort_order - b.sort_order);

      // Flatten all questions for backwards compatibility
      const allQuestions = organizedSets.flatMap(set => set.questions);

      console.log('Organized sets:', organizedSets);
      console.log('All questions:', allQuestions);
      
      setQuizSets(organizedSets);
      setQuestions(allQuestions);
      
    } catch (error) {
      console.error('Error in fetchQuestionsAndSets:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateResponse = (key: string, value: any) => {
    console.log(`Updating response for ${key}:`, value);
    setResponses(prev => ({
      ...prev,
      [key]: value
    }));
    
    if (validationErrors.includes(key)) {
      setValidationErrors(prev => prev.filter(error => error !== key));
    }
  };

  const validateResponses = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc('validate_quiz_responses', {
          p_responses: responses
        });

      if (error) {
        console.error('Error validating responses:', error);
        return false;
      }

      const validationResult = data[0] as ValidationResult;
      
      if (!validationResult.is_valid) {
        setValidationErrors(validationResult.missing_questions);
        return false;
      }

      setValidationErrors([]);
      return true;
    } catch (error) {
      console.error('Error validating responses:', error);
      return false;
    }
  };

  const submitQuiz = async () => {
    if (!user) return { error: 'User not authenticated' };

    const isValid = await validateResponses();
    if (!isValid) {
      return { error: 'Please complete all required questions' };
    }

    setSubmitting(true);
    try {
      console.log('=== SUBMITTING QUIZ ===');
      console.log('User ID:', user.id);
      console.log('Responses:', responses);

      // Save quiz responses
      const { error: responseError } = await supabase
        .from('quiz_responses')
        .insert({
          user_id: user.id,
          responses: responses
        });

      if (responseError) {
        console.error('Error saving quiz responses:', responseError);
        return { error: responseError.message };
      }

      console.log('Quiz responses saved successfully');

      // Process tags based on responses
      const { error: tagError } = await supabase
        .rpc('process_quiz_tags', {
          p_user_id: user.id,
          p_responses: responses
        });

      if (tagError) {
        console.error('Error processing tags:', tagError);
        // Don't fail the submission for tag processing errors
      } else {
        console.log('Tags processed successfully');
      }

      // Mark quiz as completed in profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ quiz_completed: true })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        return { error: profileError.message };
      }

      console.log('Profile updated - quiz marked as completed');
      console.log('=== QUIZ SUBMISSION COMPLETE ===');

      return { success: true };
    } catch (error) {
      console.error('Error submitting quiz:', error);
      return { error: 'Failed to submit quiz' };
    } finally {
      setSubmitting(false);
    }
  };

  const getQuestionById = (questionId: string) => {
    return questions.find(q => q.id === questionId);
  };

  const getResponseForQuestion = (questionKey: string) => {
    return responses[questionKey];
  };

  const isQuestionRequired = (questionKey: string) => {
    const question = questions.find(q => q.question_key === questionKey);
    return question?.required || question?.is_required || false;
  };

  const hasValidationError = (questionKey: string) => {
    return validationErrors.includes(questionKey);
  };

  return {
    questions,
    quizSets,
    responses,
    updateResponse,
    submitQuiz,
    validateResponses,
    loading,
    submitting,
    validationErrors,
    getQuestionById,
    getResponseForQuestion,
    isQuestionRequired,
    hasValidationError
  };
};
