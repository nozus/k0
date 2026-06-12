import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://xmjpoozbrbcrviwbzkul.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtanBvb3picmJjcnZpd2J6a3VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMzc3MzEsImV4cCI6MjA5NTgxMzczMX0.58c4OiAG5AfutdckkEKdZaGvI3ltoFRTW6vP_QtvYq8';

const customFetch = (url, options) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  return fetch(url, { ...options, signal: controller.signal })
    .then(res => {
      clearTimeout(timeoutId);
      return res;
    })
    .catch(err => {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Supabase request timed out after 5 seconds');
      }
      throw err;
    });
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: {
    fetch: customFetch
  }
});
