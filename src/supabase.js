import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xmjpoopbrbcrviwbzkul.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtanBvb3picmJjcnZpd2J6a3VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMzc3MzEsImV4cCI6MjA5NTgxMzczMX0.58c4OiAG5AfutdckkEKdZaGvI3ltoFRTW6vP_QtvYq8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
