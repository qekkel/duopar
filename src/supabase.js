import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://uxxyicatzlvmsyqxymcs.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4eHlpY2F0emx2bXN5cXh5bWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MzE1NDUsImV4cCI6MjA5NzUwNzU0NX0.znWqlBhGJnBGbTdAZDxkGpn0je76r_ELl_rJk1oBAhs"
);
