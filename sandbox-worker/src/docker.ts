import Docker from 'dockerode';
import chalk from 'chalk';
import { analyzeStraceLogs } from './analyzer';

const docker = new Docker();

export interface SandboxResult {
  score: number;
  level: string;
  findings: string[];
}

export async function runSandbox(packageName: string): Promise<SandboxResult> {
  const containerName = `npm-guardian-sandbox-${Date.now()}`;
  let container: Docker.Container | null = null;
  let logOutput = "";

  try {
    // Make sure our local image exists (it should be built via 'docker build -t npm-guardian-sandbox ./sandbox')
    // We create and start the container
    container = await docker.createContainer({
      Image: 'npm-guardian-sandbox',
      name: containerName,
      Cmd: [packageName],
      HostConfig: {
        AutoRemove: true,             // Immediately delete container after exit
        Memory: 512 * 1024 * 1024,    // Hard limit: 512MB RAM
        NanoCpus: 1000000000,         // 1.0 CPU
        CapDrop: ['ALL'],             // Drop ALL root capabilities
        NetworkMode: 'bridge',        // Needed for npm install, but can be locked down further
        ReadonlyRootfs: true,         // Prevent writing to core filesystem
        Binds: ['/tmp:/sandbox']      // Allow writing only to ephemeral /sandbox
      }
    });

    console.log(chalk.gray(`[Docker] Created container ${containerName} with strict isolation limits.`));
    await container.start();

    // Stream logs
    const logStream = await container.logs({
      follow: true,
      stdout: true,
      stderr: true
    });

    logStream.on('data', (chunk) => {
      logOutput += chunk.toString('utf8');
    });

    // Enforce a strict 60-second timeout (prevents hanging mining scripts)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Sandbox execution timeout (60s)')), 60000)
    );

    // Wait for the container to naturally finish its `analyze.sh` script
    await Promise.race([
      container.wait(),
      timeoutPromise
    ]);

    console.log(chalk.gray(`[Docker] Container ${containerName} finished execution.`));

  } catch (error: any) {
    console.error(chalk.red(`[Sandbox Error] ${error.message}`));
    
    // Attempt emergency kill if it timed out
    if (container) {
      try { await container.kill(); } catch (e) {}
    }
    
    return {
      score: 100,
      level: 'CRITICAL',
      findings: ['Sandbox execution crashed or timed out (possible infinite loop / crypto miner).']
    };
  }

  // Pass the raw output (which contains the strace dump) to the mathematical analyzer
  return analyzeStraceLogs(logOutput);
}
