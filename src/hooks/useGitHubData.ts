import { useEffect, useState } from 'react';
import {
  FEATURED_REPOSITORIES_FALLBACK,
  FEATURED_REPOSITORY_NAMES,
  GITHUB_PROFILE_FALLBACK,
  GITHUB_USERNAME
} from '../data/profileData';
import type { GitHubProfile, GitHubRepo } from '../types/app';

interface GitHubData {
  profile: GitHubProfile;
  repositories: GitHubRepo[];
  isLive: boolean;
}

const API_ROOT = `https://api.github.com/users/${GITHUB_USERNAME}`;

export function useGitHubData(): GitHubData {
  const [data, setData] = useState<GitHubData>({
    profile: GITHUB_PROFILE_FALLBACK,
    repositories: FEATURED_REPOSITORIES_FALLBACK,
    isLive: false
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadGitHubData() {
      try {
        const [profileResponse, repositoriesResponse] = await Promise.all([
          fetch(API_ROOT, { signal: controller.signal }),
          fetch(`${API_ROOT}/repos?sort=updated&per_page=100`, { signal: controller.signal })
        ]);

        if (!profileResponse.ok || !repositoriesResponse.ok) return;

        const [profile, allRepositories] = (await Promise.all([
          profileResponse.json(),
          repositoriesResponse.json()
        ])) as [GitHubProfile, GitHubRepo[]];
        const repositoryByName = new Map(allRepositories.filter(repo => !repo.fork).map(repo => [repo.name, repo]));
        const featured = FEATURED_REPOSITORY_NAMES.flatMap(name => {
          const repository = repositoryByName.get(name);
          return repository ? [repository] : [];
        });

        setData({
          profile: { ...GITHUB_PROFILE_FALLBACK, ...profile },
          repositories: featured.length === FEATURED_REPOSITORY_NAMES.length ? featured : FEATURED_REPOSITORIES_FALLBACK,
          isLive: true
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }

    void loadGitHubData();
    return () => controller.abort();
  }, []);

  return data;
}
