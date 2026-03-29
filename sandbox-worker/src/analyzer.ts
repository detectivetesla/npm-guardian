import { SandboxResult } from './docker';

export function analyzeStraceLogs(rawLogs: string): SandboxResult {
  let score = 0;
  const findings: string[] = [];

  // 1. Extract the purely strace portion of the logs
  const startMarker = '===STRACE_DUMP_START===';
  const endMarker = '===STRACE_DUMP_END===';
  
  const startIndex = rawLogs.indexOf(startMarker);
  const endIndex = rawLogs.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    return {
      score: 50,
      level: 'MEDIUM',
      findings: ['Failed to capture valid strace logs.']
    };
  }

  const straceLogs = rawLogs.substring(startIndex + startMarker.length, endIndex);
  const lines = straceLogs.split('\n');

  // 2. Behavioral Signatures
  // These are standard IoCs (Indicators of Compromise) in dynamic analysis.
  
  let networkCalls = 0;
  let /etc/passwd_access = false;
  let /etc/shadow_access = false;
  let ssh_key_access = false;

  for (const line of lines) {
    if (line.includes('connect(') || line.includes('socket(')) {
      networkCalls++;
    }
    
    if (line.includes('openat(') || line.includes('open(')) {
      if (line.includes('/etc/passwd')) /etc/passwd_access = true;
      if (line.includes('/etc/shadow')) /etc/shadow_access = true;
      if (line.includes('.ssh/id_rsa')) ssh_key_access = true;
    }
  }

  // 3. Scoring Logic
  if (ssh_key_access || /etc/shadow_access || /etc/passwd_access) {
    findings.push('CRITICAL: Malicious attempt to read sensitive host files (passwd, shadow, or SSH keys).');
    score += 85;
  }

  if (networkCalls > 50) {
    findings.push(`HIGH: Unusually high number of network sockets opened (${networkCalls}). Possible reverse shell, botnet, or data exfiltration.`);
    score += 40;
  } else if (networkCalls > 0) {
    findings.push(`INFO: ${networkCalls} network connection(s) established during install script execution.`);
  }

  // Final level assignment
  let level = 'SAFE';
  if (score > 80) level = 'CRITICAL';
  else if (score > 50) level = 'HIGH';
  else if (score > 20) level = 'MEDIUM';
  else if (score > 0) level = 'LOW';

  return {
    score: Math.min(score, 100),
    level,
    findings
  };
}
