# Lumen Credit architecture

```mermaid
flowchart LR
    User[Underwriter / analyst] --> Vercel[React dashboard\nVercel]
    Vercel -->|HTTPS JSON| Render[FastAPI service\nRender]
    Render --> Validate[Pydantic validation\nInput bounds + sanitization]
    Validate --> Score[Scoring service\nLogistic Regression]
    Score --> Artifact[loan_default_model.pkl\nFallback: Loan_default.pkl]
    Score --> Explain[Risk category + explanation]
    Explain --> SQLite[(SQLite audit trail)]
    SQLite --> Analytics[Analytics + history routes]
    Analytics --> Vercel
    Render --> Docs[Swagger / OpenAPI\n/api/docs]
```

## Request flow

1. React validates required numeric ranges and submits the 16 model fields plus optional previous defaults.
2. FastAPI rejects unknown fields, sanitizes bounded text, applies CORS and rate limiting, and maps dataset categories to their encoded values.
3. The saved artifact produces a default probability. The service derives the binary status, three risk categories, and plain-language factors.
4. The applicant payload, score, category, status, model version, and timestamp are stored in SQLite.
5. Dashboard widgets query aggregate analytics and recent history without exposing raw model internals.
