import fse from 'fs-extra';
import path from 'path';

export interface JiraConfig {
  baseUrlEnv: string;
  emailEnv: string;
  tokenEnv: string;
  defaultProject: string;
}

export interface GitConfig {
  branchPrefix: string;
  autoCreateBranch: boolean;
  allowPush: boolean;
}

export interface WorkflowConfig {
  requireApprovalBeforeEdit: boolean;
  requireApprovalBeforeJiraComment: boolean;
  requireApprovalBeforePr: boolean;
  maxTestFixAttempts: number;
  autoRunTests: boolean;
}

export interface RiskConfig {
  highRiskPaths: string[];
  highRiskKeywords: string[];
}

export interface TicketPilotConfig {
  jira: JiraConfig;
  git: GitConfig;
  workflow: WorkflowConfig;
  risk: RiskConfig;
}

const CONFIG_PATH = path.join(process.cwd(), '.ticketpilot', 'config.json');

export function getDefaultConfig(): TicketPilotConfig {
  return {
    jira: {
      baseUrlEnv: 'JIRA_BASE_URL',
      emailEnv: 'JIRA_EMAIL',
      tokenEnv: 'JIRA_API_TOKEN',
      defaultProject: 'PROJ',
    },
    git: {
      branchPrefix: 'feature/',
      autoCreateBranch: false,
      allowPush: false,
    },
    workflow: {
      requireApprovalBeforeEdit: true,
      requireApprovalBeforeJiraComment: true,
      requireApprovalBeforePr: true,
      maxTestFixAttempts: 3,
      autoRunTests: false,
    },
    risk: {
      highRiskPaths: [
        '.env',
        '*.pem',
        '*.key',
        'application-prod.yml',
        'application-prod.properties',
        'src/**/security/**',
        'src/**/auth/**',
        'src/**/payment/**',
        'db/migration/**',
        'migrations/**',
      ],
      highRiskKeywords: [
        'password',
        'secret',
        'token',
        'privateKey',
        'payment',
        'auth',
        'permission',
        'personalInfo',
        'privacy',
      ],
    },
  };
}

export async function loadConfig(): Promise<TicketPilotConfig> {
  try {
    if (!(await fse.pathExists(CONFIG_PATH))) {
      return getDefaultConfig();
    }
    const raw = await fse.readJson(CONFIG_PATH);
    return { ...getDefaultConfig(), ...raw };
  } catch {
    console.error('[ticketpilot] Failed to read config — using defaults.');
    return getDefaultConfig();
  }
}

export async function saveConfig(config: TicketPilotConfig): Promise<void> {
  await fse.ensureDir(path.dirname(CONFIG_PATH));
  await fse.writeJson(CONFIG_PATH, config, { spaces: 2 });
}

export async function saveConfigExample(): Promise<void> {
  const examplePath = path.join(process.cwd(), '.ticketpilot', 'config.json.example');
  await fse.ensureDir(path.dirname(examplePath));
  await fse.writeJson(examplePath, getDefaultConfig(), { spaces: 2 });
}

export function getJiraEnv(): { baseUrl: string; email: string; token: string } | null {
  const baseUrl = process.env['JIRA_BASE_URL'];
  const email = process.env['JIRA_EMAIL'];
  const token = process.env['JIRA_API_TOKEN'];
  if (!baseUrl || !email || !token) return null;
  return { baseUrl, email, token };
}
