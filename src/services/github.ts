import axios from 'axios';
import { GitHubProject } from '@/types';

const GITHUB_API_URL = 'https://api.github.com';

export const fetchRepositories = async (username: string): Promise<GitHubProject[]> => {
    try {
        const response = await axios.get(`${GITHUB_API_URL}/users/${username}/repos`, {
            headers: {
                'Authorization': process.env.NEXT_PUBLIC_GITHUB_TOKEN 
                    ? `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}` 
                    : undefined,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching repositories:', error);
        throw error;
    }
};

export const fetchRepositoryDetails = async (owner: string, repo: string): Promise<GitHubProject> => {
    try {
        const response = await axios.get(`${GITHUB_API_URL}/repos/${owner}/${repo}`, {
            headers: {
                'Authorization': process.env.NEXT_PUBLIC_GITHUB_TOKEN 
                    ? `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}` 
                    : undefined,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching repository details:', error);
        throw error;
    }
};