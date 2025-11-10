import type { AnalysisReport, AnalysisResponse, AnalysisResult } from '../types';

const API_BASE_URL = '/api';

export const analyzeImage = async (
  file: File,
  topic: string,
  motivational_texts?: string
): Promise<AnalysisResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('topic', topic);
  if (motivational_texts) {
    formData.append('motivational_texts', motivational_texts);
  }

  const response = await fetch(`/analyze-image/`, {
    method: 'POST',
    body: formData,
  });

  if (response.status !== 202) { // Expecting 202 Accepted
    const errorData = await response.json().catch(() => ({ message: 'Failed to start image analysis' }));
    throw new Error(errorData.detail || errorData.message);
  }

  return response.json();
};

export const checkStatus = async (run_id: string): Promise<AnalysisResult> => {
  const response = await fetch(`/status/${run_id}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Failed to get status for run ${run_id}` }));
    throw new Error(errorData.message);
  }

  return response.json();
};