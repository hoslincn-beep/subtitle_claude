import type { SubtitleTrack, SubtitleFormat } from "@/types/subtitle";
import { listSubtitles as ytdlpList, downloadSubtitle as ytdlpDownload } from "./ytdlp";
import { getYoutubeVideoInfo, getYoutubeCaptions } from "./api";
import { listSubtitlesViaBrowser, downloadSubtitleViaBrowser } from "./browser";
import { getCachedSubtitle, setCachedSubtitle } from "./cache";
import { getVideoInfo, cacheVideoInfo } from "@/lib/video/info";
import { validateAndParseUrl } from "@/lib/video/validator";
import type { AnalyzeResponse } from "@/types/video";

export async function analyzeVideo(url: string): Promise<AnalyzeResponse> {
  // Step 0: Validate URL
  const validation = validateAndParseUrl(url);
  if (!validation.isValid) {
    return {
      success: false,
      ccSubtitles: [],
      autoTranslated: [],
      hasVoice: true,
      error: "invalid_url",
      message: "您请求的视频不存在，请检查视频链接是否正确",
    };
  }

  const { platform, videoId, sanitizedUrl } = validation;

  // Step 1: Check cache for video info
  let videoInfo;
  const cachedInfo = await getVideoInfo(videoId!, platform!, sanitizedUrl);
  if (cachedInfo) {
    videoInfo = cachedInfo;
  }

  // Step 2: Try yt-dlp (priority)
  let ccSubtitles: SubtitleTrack[] = [];
  let autoTranslated: SubtitleTrack[] = [];

  const ytdlpResult = await ytdlpList(sanitizedUrl);
  if (ytdlpResult.videoInfo) {
    videoInfo = {
      videoId: videoId!,
      platform: platform!,
      ...ytdlpResult.videoInfo,
    };
    // Cache video info
    cacheVideoInfo(videoInfo).catch(() => {});
  }
  ccSubtitles = ytdlpResult.ccSubtitles;
  autoTranslated = ytdlpResult.autoTranslated;

  // Step 3: Try platform API (fallback if no subtitles from yt-dlp)
  if (ccSubtitles.length === 0 && autoTranslated.length === 0 && platform === "youtube") {
    const apiResult = await getYoutubeCaptions(videoId!);
    ccSubtitles = apiResult.ccSubtitles;
    autoTranslated = apiResult.autoTranslated;

    if (!videoInfo) {
      const ytInfo = await getYoutubeVideoInfo(videoId!);
      if (ytInfo) {
        videoInfo = {
          videoId: videoId!,
          platform: "youtube",
          ...ytInfo,
        };
        cacheVideoInfo(videoInfo).catch(() => {});
      }
    }
  }

  // Step 4: Try browser simulation (last resort)
  if (ccSubtitles.length === 0 && autoTranslated.length === 0) {
    const browserResult = await listSubtitlesViaBrowser(sanitizedUrl);
    ccSubtitles = browserResult.ccSubtitles;
    autoTranslated = browserResult.autoTranslated;
    if (browserResult.videoInfo && !videoInfo) {
      videoInfo = {
        videoId: videoId!,
        platform: platform!,
        ...browserResult.videoInfo,
      };
      cacheVideoInfo(videoInfo).catch(() => {});
    }
  }

  // Deduplicate: remove any autoTranslated that also appear in ccSubtitles
  const ccLangSet = new Set(ccSubtitles.map((s) => s.langCode));
  autoTranslated = autoTranslated.filter((s) => !ccLangSet.has(s.langCode));

  const hasAnySubtitles = ccSubtitles.length > 0 || autoTranslated.length > 0;

  return {
    success: true,
    videoInfo: videoInfo || undefined,
    ccSubtitles,
    autoTranslated,
    hasVoice: hasAnySubtitles,
    message: hasAnySubtitles
      ? undefined
      : "该视频未检测到任何字幕文件，无法下载",
  };
}

export async function downloadSubtitle(
  videoUrl: string,
  langCode: string,
  format: SubtitleFormat,
  subtitleType: string = "cc"
): Promise<{ content: string | null; cached: boolean }> {
  const validation = validateAndParseUrl(videoUrl);
  if (!validation.isValid || !validation.videoId) {
    return { content: null, cached: false };
  }

  const { videoId, platform, sanitizedUrl } = validation;

  // Step 1: Check cache
  const cached = await getCachedSubtitle(
    videoId!,
    platform!,
    langCode,
    subtitleType,
    format
  );
  if (cached) {
    return { content: cached, cached: true };
  }

  // Step 2: Try yt-dlp download
  let content = await ytdlpDownload(sanitizedUrl, langCode, format);

  // Step 3: Try browser download
  if (!content) {
    content = await downloadSubtitleViaBrowser(sanitizedUrl, langCode, format);
  }

  // Step 4: Cache the result
  if (content) {
    await setCachedSubtitle(
      videoId!,
      platform!,
      sanitizedUrl,
      langCode,
      subtitleType,
      format,
      content
    );
  }

  return { content, cached: false };
}
