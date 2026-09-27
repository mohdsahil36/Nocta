import { App } from "@octokit/app"; // github representation of the client
import { envConfig } from "../config/envConfig.js";

const app = new App({
  appId: envConfig.NOCTA_APP_ID,
  privateKey: envConfig.NOCTA_PRIVATE_KEY,
});

export async function getGithubClient() {
  const installationId = envConfig.NOCTA_INSTALLATION_ID;
  const octokit = app.getInstallationOctokit(installationId);
  return octokit;
}

export async function fetchNoctaCommits() {
  const octokit = await getGithubClient();
  const response = await octokit.request("GET /repos/{owner}/{repo}/commits", {
    owner: envConfig.NOCTA_GITHUB_OWNER,
    repo: envConfig.NOCTA_GITHUB_REPO,
    per_page: 100,
    page: 1,
  });
  return response.data;
}
