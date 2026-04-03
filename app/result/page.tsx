"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnalysisResult } from "@/components/analysis-result";
import { Loader2, ArrowLeft, Share2, Check } from "lucide-react";
import Link from "next/link";

type ShareMode = "turningPoint" | "verdict" | "receipt";

const MODE_LABELS: Record<ShareMode, string> = {
  turningPoint: "Turning Point",
  verdict: "The Verdict",
  receipt: "Just the Receipt",
};

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shareMode, setShareMode] = useState<ShareMode>("turningPoint");

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
    switch (mode) {
      case "turningPoint": {
        const tp = result?.turningPoint || "";
        return `I got my argument analyzed by Settle It. Complexity Score: ${score}/10.\n\nThe turning point? ${tp}\n\nAnalyze yours at ${window.location.origin}`;
      }
      case "verdict": {
        const v = result?.verdict || "";
        return `I got my argument analyzed by Settle It. Complexity Score: ${score}/10.\n\nThe verdict: ${v}\n\nAnalyze yours at ${window.location.origin}`;
      }
      case "receipt":
      default:
        return `My argument just got rated ${score}/10 by an AI psychologist.\n\nUpload your receipts and get the verdict at ${window.location.origin}`;
    }
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
          <p className="text-muted-foreground">Loading your report...</p>
        </div>
      </main>
    );
  }

  if (!result) return null;

  return (
    <main className="flex-1">
      <div className="container mx-auto max-w-3xl px-4 py-12 md:py-20">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              {copied ? (
                <Check className="mr-2 h-4 w-4 text-emerald-400" />
              ) : (
                <Share2 className="mr-2 h-4 w-4" />
              )}
              {copied ? "Copied!" : "Share"}
            </Button>
          </div>
        </div>

        <div className="mb-8 text-center">
          <Badge variant="secondary" className="mb-3">
            AI Psychologist Report
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            The Verdict
          </h1>
          <p className="mt-2 text-muted-foreground">
            A structured 3rd-party perspective on your conversation.
          </p>
        </div>

        {/* Share format selector */}
        <div className="mb-8 rounded-2xl border border-border/40 bg-card/50 p-5">
          <p className="mb-3 text-sm font-medium">Share format</p>
          <div className="flex flex-wrap gap-2">
            {(["turningPoint", "verdict", "receipt"] as ShareMode[]).map(
              (mode) => (
                <button
                  key={mode}
                  onClick={() => setShareMode(mode)}
                  className={`rounded-full px-4 py-1.5 text-sm transition ${
                    shareMode === mode
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {MODE_LABELS[mode]}
                </button>
              )
            )}
          </div>
          <div className="mt-4 rounded-xl border border-border/40 bg-muted/30 p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {buildShareText(shareMode)}
            </p>
          </div>
        </div>

        <AnalysisResult result={result} />
      </div>
    </main>
  );
}
