export interface AnalysisResult {
  ats_score: number;
  found_keywords: string[];
  missing_keywords: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  summary: string;
  jd_match_score?: number | null;
  jd_missing_skills?: string[] | null;
}

export interface ResumeAnalysis {
  id: number;
  user_id: number | null;
  filename: string;
  ats_score: number;
  analysis_json: AnalysisResult;
  created_at: string;
}

export interface User {
  email: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}
