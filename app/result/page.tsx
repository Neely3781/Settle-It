"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnalysisResult } from "@/components/analysis-result";
import { Loader2, ArrowLeft, Share2, Check, Copy } from "lucide-react";
import Link from "next/link";

type ShareMode = "shock" | "validation" | "tea";

const MODE_LABELS: Record<ShareMode, string> = {
  shock: "💥 Shock",
  validation: "💚 Validation", 
  tea: "🍵 Tea",
};

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedMode, setCopiedMode] = useState<string | null>(null);
  const [shareMode, setShareMode] = useState<ShareMode>("tea");

  useEffect(() => {
    const raw = sessionStorage.getItem("settle_it_result");
    if (!raw) {
      router.replace("/evaluate");
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setResult(parsed);
    } catch {
      router.replace("/evaluate");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const buildShareText = (mode: ShareMode) => {
    const score = result?.complexityScore ?? "—";
    const turningPoint = result?.turningPoint || "";
    const verdict = result?.verdict || "";
    
    switch (mode) {
      case "shock":
        return `I got my argument analyzed by AI. Complexity Score: **${score}/10**

The fight broke when: ${turningPoint.slice(0, 120)}...

Verdict: ${verdict.slice(0, 100)}...

Analyze yours at ${window.location.origin}`;
      case "validation":
        return `You weren't crazy.

The tone shifted when your need for clarity got interpreted as pressure. They felt overwhelmed. You felt rejected. That mismatch became the fight.

Complexity: ${score}/10

Get your own analysis at ${window.location.origin}`;
      case "tea":
      default:
        return `I uploaded my fight to AI and it immediately found the exact message where everything went wrong.

Complexity: **${score}/10**

Turning point: ${turningPoint.slice(0, 100)}...

Honestly? It was more accurate than my therapist.

${window.location.origin}`;
    }
  };

  const handleCopy = (mode: ShareMode) => {
    const text = buildShareText(mode);
    navigator.clipboard.writeText(text);
    setCopiedMode(mode);
    setTimeout(() => setCopiedMode(null), 2000);
  };

  const handleShare = async () => {
    if (!result) return;
    const text = buildShareText(shareMode);
    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Settle It Report",
          text,
        });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your verdict...</p>
        </div>
      </main>
    );
  }

  if (!result) return null;

  const score = result?.complexityScore ?? "—";
  const turningPoint = result?.turningPoint || "";
  const verdict = result?.verdict || "";

  return (
    <main className="flex-1">
      <div className="container mx-auto max-w-3xl px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleShare}>
            {copied ? (
              <Check className="mr-2 h-4 w-4 text-emerald-400" />
            ) : (
              <Share2 className="mr-2 h-4 w-4" />
            )}
            {copied ? "Copied!" : "Share"}
          </Button>
        </div>

        {/* VIRAL HERO SECTION - Above the fold */}
        <div className="mb-8 text-center">
          <Badge variant="secondary" className="mb-3">
            AI Psychologist Report
          </Badge>
          
          {/* Big Score */}
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className="text-6xl font-bold">{score}</span>
            <span className="text-2xl text-muted-foreground">/10</span>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">
            Complexity Score
          </p>

          {/* One-Line Verdict */}
          <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <p className="text-sm font-medium text-primary mb-2">THE VERDICT</p>
            <p className="text-lg font-medium leading-relaxed">
              {verdict}
            </p>
          </div>

          {/* Turning Point - THE MONEY SHOT */}
          {turningPoint && (
            <div className="mb-6 rounded-2xl border border-violet-500/30 bg-violet-500/10 p-6 text-left">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-violet-400">
                <span className="text-lg">⚡</span> THE TURNING POINT
              </p>
              <p className="text-lg font-medium leading-relaxed">
                {turningPoint}
              </p>
            </div>
          )}
        </div>

        {/* SHARE SECTION - Immediate viral tools */}
        <div className="mb-8 rounded-2xl border border-border/40 bg-card/50 p-6">
          <p className="mb-4 text-center text-sm font-medium text-muted-foreground">
            Copy a viral caption for your platform
          </p>
          
          <div className="grid gap-3 md:grid-cols-3">
            {(["shock", "validation", "tea"] as ShareMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => handleCopy(mode)}
                className="relative rounded-xl border border-border/40 bg-muted/30 p-4 text-left transition hover:border-primary/40 hover:bg-muted/50"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">{MODE_LABELS[mode]}</span>
                  {copiedMode === mode ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <p className="line-clamp-3 text-xs text-muted-foreground">
                  {buildShareText(mode).slice(0, 100)}...
                </p>
              </button>
            ))}
          </div>
          
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Click to copy. Paste into TikTok, X, Reddit, or Instagram.
          </p>
        </div>

        {/* Full Analysis */}
        <AnalysisResult result={result} />
      </div>
    </main>
  );
}
