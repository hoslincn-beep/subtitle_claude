export interface VideoInfo {
  videoId: string;
  platform: string;
  title: string;
  author: string;
  duration?: number;
  thumbnail?: string;
  uploadDate?: string;
  description?: string;
}

export interface AnalyzeRequest {
  url: string;
}

import type { SubtitleTrack } from "./subtitle";

export interface AnalyzeResponse {
  success: boolean;
  videoInfo?: VideoInfo;
  ccSubtitles: SubtitleTrack[];
  autoTranslated: SubtitleTrack[];
  hasVoice: boolean;
  message?: string;
  error?: string;
}
