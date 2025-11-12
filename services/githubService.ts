
import { GITHUB_CONFIG } from '../githubConfig';
import { GithubDb } from '../types';

const API_BASE_URL = 'https://api.github.com';
const { owner, repo, token, filePath } = GITHUB_CONFIG;
const REPO_CONTENTS_URL = `${API_BASE_URL}/repos/${owner}/${repo}/contents/${filePath}`;

const HEADERS = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
};

// Helper to encode content to Base64
const toBase64 = (str: string) => btoa(unescape(encodeURIComponent(str)));

// Helper to decode content from Base64
const fromBase64 = (str: string) => decodeURIComponent(escape(atob(str)));

interface FetchResponse {
    sha: string | null;
    data: GithubDb | null;
}

export const fetchData = async (): Promise<FetchResponse> => {
    const response = await fetch(REPO_CONTENTS_URL, { headers: HEADERS });

    if (response.status === 404) {
        console.log("Data file not found in repository. Will create on first update.");
        return { sha: null, data: null };
    }

    if (!response.ok) {
        throw new Error(`Failed to fetch data from GitHub: ${response.statusText}`);
    }

    const content = await response.json();
    const decodedData = fromBase64(content.content);
    
    return {
        sha: content.sha,
        data: JSON.parse(decodedData) as GithubDb,
    };
};

export const updateData = async (data: GithubDb, sha: string | null, commitMessage: string): Promise<void> => {
    const content = JSON.stringify(data, null, 2);
    const encodedContent = toBase64(content);

    const body: { message: string, content: string, sha?: string } = {
        message: commitMessage,
        content: encodedContent,
    };

    if (sha) {
        body.sha = sha;
    }

    const response = await fetch(REPO_CONTENTS_URL, {
        method: 'PUT',
        headers: HEADERS,
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update data on GitHub: ${errorData.message}`);
    }
};
