import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Supabase connection
const supabaseUrl = 'https://ltmsypooqbbhhvylqagj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0bXN5cG9vcWJiaGh2eWxxYWdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNDQwNjQsImV4cCI6MjA2OTgyMDA2NH0.e-lbAAHkDTR6SIz9nuh3Xq6t-HrbcYpAnv4WxGOx7Sc';

if (!process.env.SUPABASE_DB_PASSWORD) {
  throw new Error(
    "SUPABASE_DB_PASSWORD must be set. Please provide your Supabase database password.",
  );
}

// Create Supabase connection with proper URL encoding for special characters
export const sql = postgres({
  host: 'aws-0-us-west-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  username: 'postgres.ltmsypooqbbhhvylqagj',
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: 'require'
});
export const db = drizzle(sql, { schema });