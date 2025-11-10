import React, { useState, useRef, useCallback, useEffect } from 'react';
import { analyzeImage, checkStatus } from '../services/geminiService';
import type { AnalysisReport, AnalysisResult, AnalysisStatus } from '../types';
import Spinner from './Spinner';
import UploadIcon from './icons/UploadIcon';
import PdfIcon from './icons/PdfIcon';

const MAX_FILE_SIZE_MB = 100;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Define types for global vars from CDN
declare global {
  interface Window {
    jspdf: any;
    html2canvas: any;
  }
}

const ImageAnalyzer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisReport, setAnalysisReport] = useState<Partial<AnalysisReport> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [topic, setTopic] = useState<string>('');
  const [motivationalTexts, setMotivationalTexts] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const extractedTextRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const pollStatus = useCallback(async (id: string) => {
    try {
      const result = await checkStatus(id);
      setAnalysisStatus(result);

      const { linguistic_analysis, argumentative_analysis } = result;

      const newReport: Partial<AnalysisReport> = { title: 'Image Analysis Report' };

      if (linguistic_analysis.status === 'COMPLETED') {
        newReport.overview = linguistic_analysis.result;
      }

      if (argumentative_analysis.status === 'COMPLETED') {
        newReport.recommendations = argumentative_analysis.result;
      }

      setAnalysisReport(newReport);

      if (linguistic_analysis.status === 'FAILED') {
        setError(`Linguistic analysis failed: ${linguistic_analysis.result}`);
        setIsLoading(false);
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        return;
      }

      if (argumentative_analysis.status === 'FAILED') {
        setError(`Argumentative analysis failed: ${argumentative_analysis.result}`);
        setIsLoading(false);
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        return;
      }

      if (
        (linguistic_analysis.status === 'COMPLETED' || linguistic_analysis.status === 'FAILED') &&
        (argumentative_analysis.status === 'COMPLETED' || argumentative_analysis.status === 'FAILED')
      ) {
        setIsLoading(false);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      }
    } catch (err) {
      console.error('Polling failed:', err);
      setError('Failed to get analysis status.');
      setIsLoading(false);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    }
  }, []);

  useEffect(() => {
    if (runId) {
      pollingIntervalRef.current = setInterval(() => {
        pollStatus(runId);
      }, 2000); // Polling every 2 seconds as per guide
    }
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [runId, pollStatus]);

  const handleUpload = useCallback(async (file: File) => {
    if (!topic) {
      setError('Please provide a topic for analysis.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisReport(null);
    setRunId(null);
    setExtractedText(null);
    setAnalysisStatus(null);

    try {
      const { run_id, extracted_text } = await analyzeImage(file, topic, motivationalTexts);
      setRunId(run_id);
      setExtractedText(extracted_text);
    } catch (err) {
      console.error('Upload failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during upload.';
      setError(`Failed to upload image. ${errorMessage}`);
      setIsLoading(false);
    }
  }, [topic, motivationalTexts]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if topic is filled
    if (!topic.trim()) {
      setError('Please enter a topic before uploading an image.');
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Invalid file type. Please select an image.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`File size exceeds the ${MAX_FILE_SIZE_MB} MB limit.`);
      return;
    }

    setError(null);
    setSelectedFile(file);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));
    handleUpload(file);
  };

  const handleClear = () => {
    // Stop polling if active
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Clear preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Reset all state
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisReport(null);
    setIsLoading(false);
    setError(null);
    setRunId(null);
    setExtractedText(null);
    setAnalysisStatus(null);
  };

  const handleDownloadPdf = async () => {
    if (!window.jspdf) {
      setError('PDF generation library is not available.');
      return;
    }

    try {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const maxWidth = pageWidth - (2 * margin);
      let yPosition = margin;

      // Helper function to add text with word wrapping and page breaks
      const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');

        // Clean text - remove markdown bold markers and HTML tags
        const cleanText = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/<[^>]*>/g, '');
        const lines = pdf.splitTextToSize(cleanText, maxWidth);

        lines.forEach((line: string) => {
          // Check if we need a new page
          if (yPosition + 7 > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin, yPosition);
          yPosition += 7;
        });
      };

      const addSpacing = (space: number = 5) => {
        yPosition += space;
      };

      // Title
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Image Analysis Report', pageWidth / 2, yPosition, { align: 'center' });
      addSpacing(10);

      // Add image if available
      if (previewUrl) {
        const img = new Image();
        img.src = previewUrl;
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve; // Continue even if image fails to load
        });

        try {
          const imgWidth = 80;
          const imgHeight = (img.height * imgWidth) / img.width;

          // Check if image fits on current page
          if (yPosition + imgHeight > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }

          pdf.addImage(previewUrl, 'JPEG', (pageWidth - imgWidth) / 2, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 10;
        } catch (imgErr) {
          console.warn('Could not add image to PDF:', imgErr);
        }
      }

      // Extracted Text Section
      if (extractedText) {
        addText('Extracted Text from Image', 14, true);
        addSpacing(5);
        addText(extractedText, 10, false);
        addSpacing(10);
      }

      // Linguistic Analysis Section
      if (analysisReport?.overview) {
        addText('Linguistic Analysis', 14, true);
        addSpacing(5);
        addText(analysisReport.overview, 10, false);
        addSpacing(10);
      }

      // Argumentative Analysis Section
      if (analysisReport?.recommendations) {
        addText('Argumentative Analysis', 14, true);
        addSpacing(5);
        addText(analysisReport.recommendations, 10, false);
        addSpacing(10);
      }

      // Footer on last page
      const totalPages = pdf.internal.pages.length - 1; // Subtract the first null page
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
          `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      pdf.save('image-analysis-report.pdf');
    } catch (err) {
      console.error("PDF generation failed:", err);
      setError("Could not generate PDF. Please try again.");
    }
  };

  const renderStatus = (status: AnalysisStatus | undefined) => {
    if (!status) return <span className="text-gray-400">PENDING</span>;
    if (status.status === 'COMPLETED') return <span className="text-green-400">COMPLETED</span>;
    if (status.status === 'FAILED') return <span className="text-red-400">FAILED</span>;
    return <span className="text-yellow-400">IN PROGRESS</span>;
  }

  return (
    <div className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full border border-gray-700 relative">
      {/* Clear button in top-right corner - only show if there's content to clear */}
      {(selectedFile || previewUrl || analysisReport || extractedText) && (
        <button
          onClick={handleClear}
          className="absolute top-4 right-4 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
          title="Clear all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400 group-hover:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
      <div className="flex flex-col items-center">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          data-testid="file-input"
        />
        <div className="w-full mb-4">
          <label htmlFor="topic-input" className="block text-sm font-medium text-gray-300 mb-2">
            Topic for Analysis <span className="text-red-500">*</span>
          </label>
          <input
            id="topic-input"
            type="text"
            placeholder="Enter topic for analysis (e.g., 'nature', 'architecture')"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className={`w-full p-3 bg-gray-700 border rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none transition-colors ${
              !topic.trim() ? 'border-red-500 focus:border-red-600' : 'border-gray-600 focus:border-blue-500'
            }`}
            disabled={isLoading}
            required
          />
          {!topic.trim() && (
            <p className="text-sm text-red-400 mt-1">This field is required</p>
          )}
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || !topic.trim()}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UploadIcon />
          {selectedFile ? 'Upload Another Image' : 'Upload Image'}
        </button>
        <p className="text-sm text-gray-400 mt-2">Max file size: {MAX_FILE_SIZE_MB} MB</p>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-center">
          {error}
        </div>
      )}

      <div className="mt-8 space-y-8">
        {previewUrl && (
          <div ref={previewRef} className="text-center">
            <h3 className="text-xl font-semibold mb-4 text-gray-300">Image Preview</h3>
            <img src={previewUrl} alt="Selected preview" className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg" />
          </div>
        )}

        {isLoading && <Spinner />}

        {extractedText && (
          <div ref={extractedTextRef} className="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <h3 className="font-semibold text-lg mb-2 text-teal-400">Extracted Text</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{extractedText}</p>
          </div>
        )}

        {runId && (
          <div ref={reportRef} className="p-6 bg-gray-900 rounded-lg">
            <h2 className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">Analysis Report</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2 text-teal-400">Linguistic Analysis</h3>
                <p>Status: {renderStatus(analysisStatus?.linguistic_analysis)}</p>
                {analysisReport?.overview && (
                  <div className="mt-2 bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <p className="text-gray-300 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: analysisReport.overview?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') || '' }}></p>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-teal-400">Argumentative Analysis</h3>
                <p>Status: {renderStatus(analysisStatus?.argumentative_analysis)}</p>
                {analysisReport?.recommendations && (
                  <div className="mt-2 bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <p className="text-gray-300 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: analysisReport.recommendations?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') || '' }}></p>
                  </div>
                )}
              </div>
            </div>
            {analysisReport?.overview && analysisReport?.recommendations && (
              <div className="mt-8 flex justify-center">
                  <button onClick={handleDownloadPdf} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                      <PdfIcon />
                      Download Report as PDF
                  </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageAnalyzer;