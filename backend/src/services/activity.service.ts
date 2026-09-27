import { fetchNoctaCommits } from "../lib/github.js";
import { envConfig } from "../config/envConfig.js";

export async function fetchNoctaCommitHistory() {
  const commits = await fetchNoctaCommits();
  const mappedData = commits.map((c) => {
    const committedAt = new Date(
      c.commit.author?.date ?? new Date().toISOString(),
    );
    const message = c.commit.message.split("\n")[0];
    const isMerge =
      (c.parents?.length ?? 0) > 1 || /^merge\b/i.test(message);

    return {
      id: c.sha,
      sha: c.sha.slice(0, 7),
      message,
      repository: envConfig.NOCTA_GITHUB_REPO,
      date: committedAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: committedAt.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      url: c.html_url,
      isMerge,
    };
  });
  return {
    count: mappedData.length,
    commits: mappedData,
  };
}
