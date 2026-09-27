import { Request, Response } from "express";
import { fetchNoctaCommitHistory } from "../services/activity.service.js";

export async function fetchNoctaCommitHistoryController(
  req: Request,
  res: Response,
) {
  try {
    const commit = await fetchNoctaCommitHistory();
    res.status(200).json({
      message: "Commit History Fetched",
      data: commit,
    });
  } catch (error) {
    console.error("Error fetching commit history", error);
    res.status(500).json({
      error: "Failed to fetch commit history",
    });
  }
}
