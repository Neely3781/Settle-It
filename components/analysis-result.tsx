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
  };
}

export function AnalysisResult({ result }: AnalysisResultProps) {
  const sections = [
    {
      id: "verdict",
      icon: <Scale className="h-5 w-5 text-indigo-400" />,
      title: "The Verdict",
      content: result.verdict,
    },
    {
      id: "turningPoint",
      icon: <Sparkles className="h-5 w-5 text-violet-400" />,
      title: "The Turning Point",
      content: result.turningPoint,
    },
    {
      id: "psychologicalDynamics",
      icon: <Brain className="h-5 w-5 text-fuchsia-400" />,
      title: "Psychological Dynamics",
      content: result.psychologicalDynamics,
    },
    {
      id: "translationLayer",
      icon: <MessageCircle className="h-5 w-5 text-rose-400" />,
      title: "Translation Layer",
      content: null,
      custom: (
        <div className="space-y-4">
          {result.translationLayer?.personA && (
            <div className="rounded-xl border-l-4 border-indigo-400 bg-muted/30 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Person A
              </p>
              <p className="text-foreground">{result.translationLayer.personA}</p>
            </div>
          )}
          {result.translationLayer?.personB && (
            <div className="rounded-xl border-l-4 border-violet-400 bg-muted/30 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Person B
              </p>
              <p className="text-foreground">{result.translationLayer.personB}</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "pathForward",
      icon: <Footprints className="h-5 w-5 text-emerald-400" />,
      title: "The Path Forward",
      content: null,
      custom: (
        <ul className="space-y-3">
          {result.pathForward?.map((item, idx) => (
            <li
              key={idx}
              className="flex gap-3 rounded-xl border border-border/40 bg-muted/20 p-4"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {idx + 1}
              </span>
              <span className="text-foreground">{item}</span>
            </li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Score card */}
      <Card className="border-border/40 bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-fuchsia-500/5">
        <CardContent className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Complexity Score</p>
              <p className="text-2xl font-bold">{result.complexityScore ?? "—"}/10</p>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-sm text-muted-foreground">Fixability</p>
            <p className="font-medium">{result.fixability || "—"}</p>
          </div>
        </CardContent>
      </Card>

      {sections.map((section) => {
        if (!section.content && !section.custom) return null;
        return (
          <Card key={section.id} className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  {section.icon}
                </span>
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {section.custom ? (
                section.custom
              ) : (
                <p className="leading-7 text-foreground">{section.content}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
