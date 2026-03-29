import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import chalk from 'chalk';
import { runSandbox } from './docker';

dotenv.config({ path: '../backend/.env' }); // Re-use the existing backend .env for simplicity

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(chalk.red('FATAL: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.'));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
let isPolling = false;

async function pollQueue() {
  if (isPolling) return;
  isPolling = true;

  try {
    // Look for pending package scans
    const { data: scans, error } = await supabase
      .from('scans')
      .select('*')
      .eq('status', 'queued')
      .eq('type', 'package')
      .limit(1);

    if (error) throw error;

    if (scans && scans.length > 0) {
      const job = scans[0];
      console.log(chalk.cyan(`\n[${new Date().toISOString()}] Picked up scan job: ${job.package_name}`));

      // 1. Mark as in-progress
      await supabase
        .from('scans')
        .update({ status: 'in_progress' })
        .eq('id', job.id);

      // 2. Run the secure Sandbox Execution
      console.log(chalk.gray(`Starting isolated Docker sandbox for ${job.package_name}...`));
      
      const result = await runSandbox(job.package_name);
      
      // 3. Mark as completed
      console.log(chalk.green(`Sandbox completed. Final Score: ${result.score}/100. Updating database...`));
      
      await supabase
        .from('scans')
        .update({ 
          status: 'completed',
          overall_risk_score: result.score,
          risk_level: result.level,
        })
        .eq('id', job.id);
        
      console.log(chalk.blue(`Successfully processed job ${job.id}`));
    }
  } catch (err: any) {
    console.error(chalk.red('[pollQueue] Error:', err.message));
  } finally {
    isPolling = false;
  }
}

console.log(chalk.bgGreen.black.bold('\n 🛡️  npm-Guardian Sandbox Worker Started \n'));
console.log(chalk.gray(`Connected to Supabase: ${supabaseUrl}`));
console.log('Polling for new scan jobs...');

// Poll every 3 seconds
setInterval(pollQueue, 3000);
