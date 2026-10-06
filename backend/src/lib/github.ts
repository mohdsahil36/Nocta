import { App } from "@octokit/app"; // github representation of the client
import { envConfig } from "../config/envConfig.js";

const app = new App({
  appId: Number(envConfig.NOCTA_APP_ID),
  privateKey: envConfig.NOCTA_PRIVATE_KEY,
});

export async function getGithubClient() {
  const installationId = envConfig.NOCTA_INSTALLATION_ID;
  const octokit = await app.getInstallationOctokit(installationId);
  return octokit;
}

export async function fetchNoctaCommits() {
  const octokit = await getGithubClient();
  try {
    const response = await octokit.request("GET /repos/{owner}/{repo}/commits", {
      owner: envConfig.NOCTA_GITHUB_OWNER,
      repo: envConfig.NOCTA_GITHUB_REPO,
      per_page: 100,
      page: 1,
    });
    return response.data;
  } catch (error) {
    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as { status: unknown }).status === "number"
        ? (error as { status: number }).status
        : undefined;
    const message =
      error instanceof Error ? error.message : "Unknown GitHub error";
    const err = new Error(
      status
        ? `GitHub ${status}: ${message}`
        : `GitHub request failed: ${message}`,
    );
    (err as Error & { status?: number }).status = status;
    throw err;
  }
}
