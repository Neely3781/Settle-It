"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Scale,
  Sparkles,
  Brain,
  MessageCircle,
  Footprints,
  Activity,
  AlertTriangle,
} from "lucide-react";

interface AnalysisResultProps {
  result: {
    verdict?: string;
    turningPoint?: string;
    psychologicalDynamics?: string;
    translationLayer?: {
      personA?: string;
      personB?: string;
    };
    pathForward?: string[];
    complexityScore?: number;
    fixability?: string;
    brutalTruth?: string;
  };
}

export function AnalysisResult({ result }: AnalysisResultProps) {
  // Extract key insights for viral formatting
  const score = result.complexityScore ?? "—";
  const isHighComplexity = (result.complexityScore || 0) >= 7;
  const isFixable = result.fixability?.toLowerCase().includes("yes") || 
                    result.fixability?.toLowerCase().includes("repairable");

  return (
    <div className="space-y-6">
      {/* BRUTAL TRUTH - Viral gold */}
      {result.brutalTruth && (
        <div className="rounded-2xl border-2 border-amber-500/30 bg-amber-500/10 p-6">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <span className="font-bold text-amber-400">BRUTAL TRUTH</span>
          </div>
          <p className="text-lg font-medium leading-relaxed">
            {result.brutalTruth}
          </p>
        </div>
      )}

      {/* THE VERDICT - Concise summary */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
              <Scale className="h-5 w-5 text-indigo-400" />
            </span>
            The Verdict
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground leading-relaxed">
            {result.verdict}
          </p>
          
          {/* Fixability badge */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="text-sm text-muted-foreground shrink-0">Fixability:</span>
            <Badge 
              variant={isFixable ? "default" : "secondary"}
              className={`${isFixable ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20" : ""} whitespace-normal h-auto py-1 px-3 text-left max-w-full`}
            >
              {result.fixability || "Unknown"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* THE TURNING POINT - Highlighted */}
      {result.turningPoint && (
        <Card className="border-violet-500/30 bg-violet-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                <Sparkles className="h-5 w-5 text-violet-400" />
              </span>
              The Turning Point
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border-l-4 border-violet-400 bg-muted/30 p-4">
              <p className="text-lg font-medium leading-relaxed text-foreground">
                {result.turningPoint}
              </p>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              This is where the emotional tone shifted. Everything before was buildup. Everything after was fallout.
            </p>
          </CardContent>
        </Card>
      )}

      {/* TRANSLATION LAYER - Screenshot format */}
      {result.translationLayer && (
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10">
                <MessageCircle className="h-5 w-5 text-rose-400" />
              </span>
              Translation Layer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Person A */}
              {result.translationLayer.personA && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    What they were really feeling
                  </p>
                  <div className="rounded-xl border-l-4 border-indigo-400 bg-muted/30 p-4">
                    <p className="font-medium text-foreground">{result.translationLayer.personA}</p>
                  </div>
                </div>
              )}
              
              {/* Person B */}
              {result.translationLayer.personB && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    What you were really feeling
                  </p>
                  <div className="rounded-xl border-l-4 border-violet-400 bg-muted/30 p-4">
                    <p className="font-medium text-foreground">{result.translationLayer.personB}</p>
                  </div>
                </div>
              )}
            </div>
            
            <p className="mt-4 text-sm text-muted-foreground">
              The gap between what was said and what was felt created the conflict.
            </p>
          </CardContent>
        </Card>
      )}

      {/* PSYCHOLOGICAL DYNAMICS */}
      {result.psychologicalDynamics && (
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-fuchsia-500/10">
                <Brain className="h-5 w-5 text-fuchsia-400" />
              </span>
              Psychological Dynamics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-foreground">{result.psychologicalDynamics}</p>
            
            {isHighComplexity && (
              <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
                <p className="text-sm text-amber-400">
                  High complexity score means multiple emotional patterns are overlapping. This isn't just one issue — it's several dynamics tangled together.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* THE PATH FORWARD */}
      {result.pathForward && result.pathForward.length > 0 && (
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <Footprints className="h-5 w-5 text-emerald-400" />
              </span>
              The Path Forward
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {result.pathForward.map((item, idx) => (
                <li
                  key={idx}
                  className="flex gap-3 rounded-xl border border-border/40 bg-muted/20 p-4"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400"
                  >
                    {idx + 1}
                  </span>
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
