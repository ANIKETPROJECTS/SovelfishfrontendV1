import express, { type Express } from "express";
import { open, readdir, stat } from "node:fs/promises";
import path from "node:path";

const BANNER_VIDEO_DIRECTORY = path.resolve(process.cwd(), "Bannervids");
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".m4v"]);
const POSTER_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_BANNER_VIDEOS = 4;
const GIT_LFS_POINTER_PREFIX = "version https://git-lfs.github.com/spec/v1";

function titleFromFilename(filename: string) {
  const baseName = path.basename(filename, path.extname(filename));
  return baseName
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function assetUrl(filename: string, modifiedAt: number) {
  return `/Bannervids/${encodeURIComponent(filename)}?v=${Math.trunc(modifiedAt)}`;
}

async function isGitLfsPointer(filePath: string) {
  const handle = await open(filePath, "r");
  try {
    const header = Buffer.alloc(96);
    const { bytesRead } = await handle.read(header, 0, header.length, 0);
    return header.toString("utf8", 0, bytesRead).startsWith(GIT_LFS_POINTER_PREFIX);
  } finally {
    await handle.close();
  }
}

export function registerBannerVideoRoutes(app: Express) {
  app.get("/api/banner-videos", async (_req, res) => {
    res.setHeader("Cache-Control", "no-store");

    try {
      const entries = await readdir(BANNER_VIDEO_DIRECTORY, { withFileTypes: true });
      const files = entries.filter((entry) => entry.isFile());
      const posterByBaseName = new Map<string, string>();

      for (const file of files) {
        const extension = path.extname(file.name).toLowerCase();
        if (!POSTER_EXTENSIONS.has(extension)) continue;
        const baseName = path.basename(file.name, path.extname(file.name)).toLowerCase();
        posterByBaseName.set(baseName, file.name);
      }

      const videos = files
        .filter((file) => VIDEO_EXTENSIONS.has(path.extname(file.name).toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }))
        .slice(0, MAX_BANNER_VIDEOS);

      const mediaFiles = videos.flatMap((video) => {
        const baseName = path.basename(video.name, path.extname(video.name)).toLowerCase();
        const posterName = posterByBaseName.get(baseName);
        return posterName ? [video.name, posterName] : [video.name];
      });
      const lfsPointerFiles = (
        await Promise.all(
          mediaFiles.map(async (filename) => ({
            filename,
            isPointer: await isGitLfsPointer(path.join(BANNER_VIDEO_DIRECTORY, filename)),
          })),
        )
      )
        .filter((file) => file.isPointer)
        .map((file) => file.filename);

      if (lfsPointerFiles.length > 0) {
        console.error(
          "[banner-videos] Git LFS pointer files found instead of media. Run `git lfs pull` on this server:",
          lfsPointerFiles.join(", "),
        );
        res.status(503).json({ message: "Banner media has not been downloaded from Git LFS on this server" });
        return;
      }

      const results = await Promise.all(videos.map(async (video) => {
        const videoPath = path.join(BANNER_VIDEO_DIRECTORY, video.name);
        const videoStats = await stat(videoPath);
        const baseName = path.basename(video.name, path.extname(video.name));
        const posterName = posterByBaseName.get(baseName.toLowerCase());
        let posterUrl: string | undefined;

        if (posterName) {
          const posterStats = await stat(path.join(BANNER_VIDEO_DIRECTORY, posterName));
          posterUrl = assetUrl(posterName, posterStats.mtimeMs);
        }

        return {
          id: video.name,
          title: titleFromFilename(video.name),
          videoUrl: assetUrl(video.name, videoStats.mtimeMs),
          posterUrl,
        };
      }));

      res.json(results);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        res.json([]);
        return;
      }

      console.error("[banner-videos] Failed to read the banner video folder:", error);
      res.status(500).json({ message: "Failed to load banner videos" });
    }
  });

  app.use(
    "/Bannervids",
    express.static(BANNER_VIDEO_DIRECTORY, {
      dotfiles: "deny",
      index: false,
      maxAge: "1y",
      immutable: true,
    }),
  );
}
