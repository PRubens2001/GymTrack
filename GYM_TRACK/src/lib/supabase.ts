
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wvkqpekqivpxrndawqhz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_B2Nf2b8JU4anBgfNjJHrkA_bgLlGEf-';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
