export interface AnalysisReport {
  title: string;
  overview: string;
  recommendations: string;
}

export type AnalysisStepStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface AnalysisStatus {
  status: AnalysisStepStatus;
  result?: any;
}

export interface LinguisticAnalysisResult {
  status: AnalysisStepStatus;
  result: string;
}

export interface ArgumentativeAnalysisResult {
  status: AnalysisStepStatus;
  result: string;
}

export interface AnalysisResult {
  text_extraction: AnalysisStatus;
  linguistic_analysis: LinguisticAnalysisResult;
  argumentative_analysis: ArgumentativeAnalysisResult;
}

export interface AnalysisResponse {
  run_id: string;
  status: string;
  extracted_text: string;
}