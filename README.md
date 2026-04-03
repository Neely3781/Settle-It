# Settle It

A viral AI-powered app that lets users upload screenshots of arguments or conversations, add context, and receive a structured psychological analysis from an AI psychologist — for $0.99 per evaluation.

## Features

- **Upload Screenshots**: Drop in up to 4 conversation screenshots
- **Add Context**: Explain the backstory for deeper analysis
- **Pay $0.99**: One-time fee via Stripe (no subscriptions)
- **AI Psychologist Report**:
  - **The Verdict**: Neutral summary of what happened
  - **The Turning Point**: Exact moment things went sideways
  - **Psychological Dynamics**: Attachment styles, defense mechanisms, patterns
  - **Translation Layer**: What each person was really feeling underneath
  - **The Path Forward**: Actionable recommendations
  - **Complexity Score**: 1-10 rating + fixability assessment

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS + shadcn/ui**
- **Stripe** (Payments)
- **Moonshot Kimi K2.5** (Conversation analysis)

## Getting Started

### 1. Install dependencies

```bash
cd my-app
npm install
```

### 2. Set up environment variables

Edit `.env.local` in the `my-app` folder:

```env
# Stripe (get test keys at https://stripe.com)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Moonshot Kimi (get API key at https://platform.moonshot.ai)
MOONSHOT_API_KEY=sk-...
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production

```bash
npm run build
```

## How It Works

1. User uploads screenshots on `/evaluate`
2. User clicks "Unlock Analysis — $0.99"
3. Backend creates a Stripe PaymentIntent for $0.99
4. User enters card details and pays
5. On success, images + context are sent to Moonshot Kimi K2.5
6. AI returns structured JSON analysis
7. Results are displayed on `/result` with share functionality

## Viral Mechanics

- The result page is designed like a premium report card
- Users can copy/share a summary with their Complexity Score
- Dark mode + gradient aesthetic gives it a "premium therapy" feel
- The hook is clear: "Upload the receipts. Get the verdict."

## Notes

- Make sure your Stripe account is configured for USD payments
- Moonshot API usage is charged separately based on image sizes
- For production, consider adding rate limiting and data retention policies
