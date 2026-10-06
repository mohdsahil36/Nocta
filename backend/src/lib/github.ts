import { App } from "@octokit/app"; // github representation of the client
import { envConfig } from "../config/envConfig.js";
import { HttpError } from "./http-error.js";

const app = new App({
  appId: Number(envConfig.NOCTA_APP_ID),
  privateKey: envConfig.NOCTA_PRIVATE_KEY,
});

export async function getGithubClient() {
  const installationId = envConfig.NOCTA_INSTALLATION_ID;
  const octokit = await app.getInstallationOctokit(installationId);
  return octokit;
}

function githubStatus(error: unknown): number | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status: unknown }).status === "number"
  ) {
    return (error as { status: number }).status;
  }
  return undefined;
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
    const message =
      error instanceof Error ? error.message : "Unknown GitHub error";
    const status = githubStatus(error);

    if (/invalid keydata/i.test(message)) {
      throw HttpError.upstream(
        "GITHUB_KEY_INVALID",
        "GitHub App private key is invalid",
        {
          hint: "Set NOCTA_PRIVATE_KEY to the full App .pem. On Render, paste as one line with literal \\n between PEM lines.",
          cause: error,
        },
      );
    }

    if (status === 401 || status === 403) {
      throw HttpError.upstream(
        "GITHUB_AUTH_FAILED",
        "GitHub App could not authenticate",
        {
          hint: "Verify NOCTA_APP_ID, NOCTA_INSTALLATION_ID, and that the App is installed on the repo with Contents: Read.",
          cause: error,
        },
      );
    }

    if (status === 404) {
      throw HttpError.upstream(
        "GITHUB_REPO_NOT_FOUND",
        "GitHub repository not found for this App",
        {
          hint: "Check NOCTA_GITHUB_OWNER / NOCTA_GITHUB_REPO and App installation access.",
          cause: error,
        },
      );
    }

    throw HttpError.upstream(
      "GITHUB_COMMITS_FAILED",
      status
        ? `GitHub returned ${status} while fetching commits`
        : "Failed to fetch commits from GitHub",
      {
        hint: message,
        cause: error,
      },
    );
  }
}
