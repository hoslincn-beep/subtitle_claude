export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}

export interface DownloadQuery {
  videoId: string;
  platform: string;
  lang: string;
  type: string; // cc | auto-generated | translated
  format: string;
}

export interface BilingualRequest {
  videoId: string;
  platform: string;
  firstLang: string;
  secondLang: string;
  firstLangCode: string;
  secondLangCode: string;
  format: string;
}
