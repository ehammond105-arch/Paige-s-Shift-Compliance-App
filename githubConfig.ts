
// --- Global Variable Initialization (Mandatory) ---
// This is injected at runtime by the environment.
declare const __github_config: string | undefined;

export interface GithubConfig {
    owner: string;
    repo: string;
    token: string;
    filePath: string;
}

let config: GithubConfig;
const configStr = typeof __github_config !== 'undefined' ? __github_config : null;

if (!configStr) {
    console.warn(
        "GitHub configuration not provided. Using mock data. " +
        "All changes will be lost on page refresh."
    );
    config = {
        owner: 'mock-owner',
        repo: 'mock-repo',
        token: 'mock-token',
        filePath: 'data/db.json'
    };
} else {
    try {
        config = JSON.parse(configStr);
    } catch (e) {
        // We throw here because a malformed config is a critical error.
        throw new Error(`Failed to parse GitHub configuration: ${e instanceof Error ? e.message : String(e)}`);
    }
}

export const GITHUB_CONFIG = config;
export const IS_MOCK_ENV = !configStr;
