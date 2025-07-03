
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDatabaseDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    console.log('🔍 Starting comprehensive database diagnostics...');
    
    try {
      // Test 1: Simple count query
      console.log('📊 Test 1: Running simple count query...');
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      console.log('Count result:', { count, error: countError });

      // Test 2: Try to get minimal product data
      console.log('📊 Test 2: Fetching minimal product data...');
      const { data: minimalData, error: minimalError } = await supabase
        .from('products')
        .select('id, title')
        .limit(1);
      
      console.log('Minimal data result:', { data: minimalData, error: minimalError });

      // Test 3: Try to get products with boolean columns
      console.log('📊 Test 3: Testing boolean developmental goal columns...');
      const { data: booleanData, error: booleanError } = await supabase
        .from('products')
        .select('id, title, has_cognitive_development, has_creativity_imagination, has_motor_skills, has_stem_robotics')
        .limit(1);
      
      console.log('Boolean columns result:', { data: booleanData, error: booleanError });

      // Test 4: Try the full admin query
      console.log('📊 Test 4: Testing full admin query...');
      const { data: fullAdminData, error: fullAdminError } = await supabase
        .from('products')
        .select(`
          id, title, description, age_group, days_to_complete, amazon_affiliate_link,
          developmental_level_id, published, featured, price, compare_at_price, tags,
          has_cognitive_development, has_creativity_imagination, has_motor_skills, has_stem_robotics,
          created_at,
          developmental_level:developmental_levels(*),
          product_images(*),
          product_accordions(*),
          product_collections(*)
        `)
        .limit(1);
      
      console.log('Full admin query result:', { data: fullAdminData, error: fullAdminError });

      // Test 5: Try the public query
      console.log('📊 Test 5: Testing public query...');
      const { data: publicData, error: publicError } = await supabase
        .from('products')
        .select(`
          id, title, description, age_group, days_to_complete, amazon_affiliate_link,
          developmental_level_id, published, featured, price, compare_at_price, tags,
          has_cognitive_development, has_creativity_imagination, has_motor_skills, has_stem_robotics,
          created_at,
          developmental_level:developmental_levels(*),
          product_images(*),
          product_accordions(*),
          product_collections(*)
        `)
        .eq('published', true)
        .limit(1);
      
      console.log('Public query result:', { data: publicData, error: publicError });

      // Test 6: Test developmental levels table
      console.log('📊 Test 6: Testing developmental levels table...');
      const { data: levelsData, error: levelsError } = await supabase
        .from('developmental_levels')
        .select('*')
        .limit(3);
      
      console.log('Developmental levels result:', { data: levelsData, error: levelsError });

      // Test 7: Test developmental goals table
      console.log('📊 Test 7: Testing developmental goals table...');
      const { data: goalsData, error: goalsError } = await supabase
        .from('developmental_goals')
        .select('*')
        .limit(3);
      
      console.log('Developmental goals result:', { data: goalsData, error: goalsError });

      const diagnosticResults = {
        count: { count, error: countError },
        minimal: { data: minimalData, error: minimalError },
        booleanColumns: { data: booleanData, error: booleanError },
        fullAdmin: { data: fullAdminData, error: fullAdminError },
        public: { data: publicData, error: publicError },
        levels: { data: levelsData, error: levelsError },
        goals: { data: goalsData, error: goalsError }
      };

      console.log('🎯 Complete diagnostic results:', diagnosticResults);
      setDiagnostics(diagnosticResults);

    } catch (error) {
      console.error('❌ Diagnostic error:', error);
      setDiagnostics({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return { diagnostics, loading, runDiagnostics };
};
