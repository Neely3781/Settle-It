"use client";

import { useCallback, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Brain, Eye, Scale, Sparkles, MessageSquare, ShieldCheck, Upload, ImageIcon, X, Loader2, Lock } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { PaymentForm } from "@/components/payment-form";
import { compressImages } from "@/lib/compress-image";
import Link from "next/link";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey && stripeKey.startsWith("pk_")
  ? loadStripe(stripeKey)
  : null;

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>([]);
  const [context, setContext] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Analyzing...");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remainingSlots = 8 - images.length;
    if (remainingSlots <= 0) return;
    const toProcess = Array.from(files).slice(0, remainingSlots);
    const newImages: string[] = [];
    for (const file of toProcess) {
      newImages.push(await fileToBase64(file));
    }
    setImages((prev) => [...prev, ...newImages]);
  }, [images.length]);

  const removeImage = (idx: number) => {
    setImages((prev) => {
      const next = [...prev];
      next.splice(idx, 1);
      return next;
    });
  };

  const handleAnalysisComplete = (result: any) => {
    sessionStorage.setItem("settle_it_result", JSON.stringify(result));
    router.push("/result");
  };

  const handleStartPayment = async () => {
    if (images.length === 0) {
      setError("Please upload at least one screenshot.");
      return;
    }
    setError(null);
    setLoadingText("Setting up payment...");
    setProgress(10);
    setLoading(true);
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 99 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment setup failed.");
      setProgress(100);
      setClientSecret(data.clientSecret);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleSkipPayment = async () => {
    if (images.length === 0) {
      setError("Please upload at least one screenshot.");
      return;
    }
    setError(null);
    setLoadingText("Compressing images...");
    setProgress(10);
    setLoading(true);

    try {
      // Compress images to avoid 413 Payload Too Large
      setLoadingText("Compressing images...");
      const compressedImages = await compressImages(images, 1200, 0.7);

      setLoadingText("Analyzing your conversation...");
      setProgress(30);

      // Animate progress while waiting
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 85) return p;
          return p + Math.random() * 8;
        });
      }, 1200);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: compressedImages, context }),
      });
      const data = await res.json();
      if (!res.ok) {
        let msg = data.error || "Analysis failed.";
        if (data.raw) {
          msg += `\n\nRaw response: ${String(data.raw).slice(0, 300)}`;
        }
        throw new Error(msg);
      }
      clearInterval(interval);
      setProgress(100);
      handleAnalysisComplete(data);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="container relative mx-auto max-w-5xl px-4 py-12 md:py-16">
          <div className="flex flex-col items-center text-center">
            {/* Social Proof Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              <span>12,847 messy arguments decoded</span>
            </div>

            <h1 className="mb-6 max-w-3xl text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Upload your Screenshots.
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Get Your verdict.
              </span>
            </h1>
            <p className="mb-4 max-w-2xl text-lg text-muted-foreground md:text-xl">
              What would a psychologist find in your argument?
            </p>
            <p className="mb-10 max-w-2xl text-muted-foreground">
              Upload the screenshots. Get insight on the possible manipulation, gaslighting, and or turning points you missed from a phycologist-perspective.
            </p>

            {/* Upload Area */}
            <div className="w-full max-w-xl space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(false);
                  handleFiles(e.dataTransfer.files);
                }}
                className={`group relative flex w-full cursor-pointer flex-col items-center rounded-3xl border-2 border-dashed bg-card/50 p-8 transition md:p-10 ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border/60 hover:border-primary/40 hover:bg-card"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    handleFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition group-hover:scale-105">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div className="mt-4 space-y-1 text-center">
                  <p className="text-lg font-semibold">Drag & drop screenshots here</p>
                  <p className="text-sm text-muted-foreground">
                    {images.length > 0
                      ? `${images.length} uploaded - add up to 8 total`
                      : "or click to upload up to 8 images"}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>PNG, JPG, WEBP supported</span>
                </div>
              </div>

              {/* Image Previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                  {images.map((src, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-border/40 bg-muted"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`Screenshot ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          removeImage(idx);
                        }}
                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition hover:bg-black/80 group-hover:opacity-100"
                        aria-label="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Context input */}
            <div className="mt-4 w-full max-w-xl space-y-2 text-left">
              <label htmlFor="home-context" className="text-sm font-medium">
                Context
              </label>
              <Textarea
                id="home-context"
                placeholder="Who is this person to you? What was the fight about? Any backstory - like how long you've known each other, recent tension, or what triggered the exchange - helps the analysis go deeper."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Optional, but the more context you give, the sharper the verdict.
              </p>
            </div>

            {error && (
              <div className="mt-4 w-full max-w-xl rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {!clientSecret ? (
              <div className="mt-6 flex w-full max-w-xl flex-col gap-3">
                {loading ? (
                  <div className="w-full rounded-2xl border border-border/40 bg-card/50 p-5">
                    <div className="mb-3 flex items-center justify-between text-sm">
                      <span className="font-medium">{loadingText}</span>
                      <span className="text-muted-foreground">
                        {Math.min(Math.round(progress), 100)}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 transition-all duration-700 ease-out"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <Button
                      onClick={handleStartPayment}
                      disabled={images.length === 0}
                      size="lg"
                      className="w-full text-lg"
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      {images.length === 0
                        ? "Upload at least 1 image"
                        : "Get your verdict for $0.99"}
                    </Button>

                  </>
                )}
              </div>
            ) : (
              <div className="mt-6 w-full max-w-xl space-y-4">
                <div className="rounded-lg border border-border/40 bg-muted/30 p-4 text-sm text-muted-foreground">
                  Complete payment to unlock your AI psychologist report.
                </div>
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "night",
                      variables: {
                        colorPrimary: "#e5e5e5",
                        colorText: "#e5e5e5",
                        colorBackground: "#1c1917",
                        colorTextPlaceholder: "#737373",
                      },
                    },
                  }}
                >
                  <PaymentForm
                    clientSecret={clientSecret}
                    images={images}
                    context={context}
                    onComplete={handleAnalysisComplete}
                    onError={setError}
                  />
                </Elements>
              </div>
            )}

            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                Takes 10 seconds
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
                Screenshots deleted after analysis
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                More accurate than therapy
              </span>
            </div>

            {/* Live Activity Badge */}
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-400"></span>
              </span>
              <span className="font-medium">47 people analyzing their texts right now</span>
            </div>

            {/* Trust Bar */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">$0.99 · No subscription</span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Screenshots auto-deleted</span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">12,847 analyzed this month</span>
            </div>

            {/* Example Verdict Video - Phone Card */}
            <div className="mt-10 flex justify-center">
              <div className="relative w-[280px] rounded-[2.5rem] border-4 border-border/40 bg-black p-2 shadow-2xl">
                {/* Phone notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-10"></div>
                <div className="rounded-[2rem] overflow-hidden bg-black">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-auto rounded-[2rem]"
                  >
                    <source src="/Argument-insider-home-page-video.mov" type="video/mp4" />
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-10 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Settle It. All rights reserved.</p>
      </footer>
    </main>
  );
}

function StepCard({
  icon,
  step,
  title,
  description,
}: {
  icon: React.ReactNode;
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-border/40 bg-card p-8 text-center transition hover:border-primary/30 hover:shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
        {icon}
      </div>
      <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Step {step}
      </span>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card p-6 transition hover:border-primary/30 hover:shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
