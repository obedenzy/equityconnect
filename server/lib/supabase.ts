import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ltmsypooqbbhhvylqagj.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use anon key for basic operations
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0bXN5cG9vcWJiaGh2eWxxYWdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNDQwNjQsImV4cCI6MjA2OTgyMDA2NH0.e-lbAAHkDTR6SIz9nuh3Xq6t-HrbcYpAnv4WxGOx7Sc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);