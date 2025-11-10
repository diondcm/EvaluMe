┌─────────────┐
│ User Uploads│
│ Image +     │
│ Topic       │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│ Frontend (Cloud Run)    │
│ - Validates file type   │
│ - Shows upload progress │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Backend API (Cloud Run) │
│ - Receives multipart    │
│ - Validates payload     │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Text Extraction         │
│ - Gemini API call       │
│ - OCR + cleanup         │
│ - Returns plain text    │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Parallel Agent          │
│ Execution               │
│ ┌──────────┐            │
│ │ Agent 1  │◄───────────┤
│ │ Agent 2  │◄───────────┤
│ └──────────┘            │
│                         │
│ Result Aggregation      │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Frontend Display        │
│ - Score visualization   │
│ - Feedback sections     │
│ - PDF generation        │
└─────────────────────────┘