import type { Request, Response } from "express";
import { fetchNoctaCommitHistory } from "../../services/activity/activity.service.js";

export async function fetchNoctaCommitHistoryController(
  _req: Request,
  res: Response,
) {
  const commit = await fetchNoctaCommitHistory();
  res.status(200).json({
    message: "Commit History Fetched",
    data: commit,
  });
}
