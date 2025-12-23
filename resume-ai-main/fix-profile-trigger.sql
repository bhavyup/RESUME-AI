-- ========================
-- FIX: Auto-create Profile and Subscription on User Signup
-- ========================
-- Run this SQL in your Supabase SQL Editor to fix the login error

-- Step 1: Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile record
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    ''
  );
  
  -- Create free subscription record
  INSERT INTO public.subscriptions (user_id, subscription_plan, subscription_status)
  VALUES (
    NEW.id,
    'free',
    'active'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create trigger to automatically run on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================
-- FIX: Create profiles for existing users who don't have one
-- ========================
-- This will fix any users who already signed up but don't have profiles

INSERT INTO public.profiles (user_id, email, first_name, last_name)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  ''
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- ========================
-- FIX: Create subscriptions for existing users who don't have one
-- ========================

INSERT INTO public.subscriptions (user_id, subscription_plan, subscription_status)
SELECT 
  u.id,
  'free',
  'active'
FROM auth.users u
LEFT JOIN public.subscriptions s ON u.id = s.user_id
WHERE s.user_id IS NULL;

-- ========================
-- Verify the fix worked
-- ========================
-- Run these queries to check if everything is set up correctly

-- Check if trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check if all users have profiles
SELECT 
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT p.user_id) as users_with_profiles,
  COUNT(DISTINCT s.user_id) as users_with_subscriptions
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
LEFT JOIN public.subscriptions s ON u.id = s.user_id;

-- List any users missing profiles (should be empty)
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;
