
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  isFirstTimeUser: boolean | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean | null>(null);
  const { toast } = useToast();

  const checkFirstTimeUser = async (userId: string) => {
    try {
      console.log('Checking first-time user status for:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('quiz_completed')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking profile:', error);
        if (error.code === 'PGRST116') {
          console.log('No profile found - first time user');
          setIsFirstTimeUser(true);
        } else {
          console.log('Database error - defaulting to first time user');
          setIsFirstTimeUser(true);
        }
      } else {
        const hasCompletedQuiz = data?.quiz_completed === true;
        const isFirstTime = !hasCompletedQuiz;
        
        console.log('Profile data:', data);
        console.log('Quiz completed:', hasCompletedQuiz);
        console.log('Is first time user:', isFirstTime);
        
        setIsFirstTimeUser(isFirstTime);
      }
    } catch (error) {
      console.error('Error checking first-time user:', error);
      setIsFirstTimeUser(true);
    }
  };

  useEffect(() => {
    setLoading(true);
    let mounted = true;
  
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!mounted) return;
  
        console.log('Auth state change event:', event, 'Session user:', currentSession?.user?.id);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
  
        if (currentSession?.user) {
          if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            setTimeout(() => {
              if (mounted) checkFirstTimeUser(currentSession.user.id);
            }, 0);
          }
        } else {
          setIsFirstTimeUser(null);
        }
        
        setLoading(false); 
      }
    );
  
    supabase.auth.getSession().then(({ data: { session: initialSessionData }}) => {
      if (!mounted) return;
      console.log('getSession() resolved. Current user from state:', user?.id, 'Fetched session user:', initialSessionData?.user?.id);
      if (loading && !user && !initialSessionData?.user) {
          console.log("getSession fallback: still loading, no user from onAuthStateChange yet, and no initial session data. Setting loading false.")
          setLoading(false);
      }
    }).catch(err => {
        console.error("Error in getSession:", err);
        if (mounted && loading) setLoading(false);
    });
  
    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in for:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Sign in error:', error);
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    console.log('Attempting sign up for:', email);
    // CRITICAL FIX: Ensure redirect always goes to /enhanced-quiz
    const redirectUrl = `${window.location.origin}/enhanced-quiz`; 
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name,
        }
      }
    });
    
    if (error) {
      console.error('Sign up error:', error);
    }
    
    return { error };
  };

  const signOut = async () => {
    console.log('Signing out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setIsFirstTimeUser(null);
      window.location.href = '/';
    }
  };

  const value = {
    user,
    session,
    signIn,
    signUp,
    signOut,
    loading,
    isFirstTimeUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
