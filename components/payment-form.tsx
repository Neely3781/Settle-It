"use client";

import { useEffect, useState } from "react";
import {
  PaymentElement,
  PaymentRequestButtonElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PaymentFormProps {
  clientSecret: string;
  images: string[];
  context: string;
  onComplete: (result: any) => void;
  onError: (msg: string) => void;
}

export function PaymentForm({
  clientSecret,
  images,
  context,
  onComplete,
  onError,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!stripe || !clientSecret) return;

    const pr = stripe.paymentRequest({
      country: "US",
      currency: "usd",
      total: {
        label: "Settle It Analysis",
        amount: 99,
      },
      requestPayerName: false,
      requestPayerEmail: false,
    });

    pr.canMakePayment().then((result: any) => {
      if (result) {
        setPaymentRequest(pr);
      }
    });
  }, [stripe, clientSecret]);

  useEffect(() => {
    if (!paymentRequest || !stripe || !clientSecret) return;

    const handler = async (ev: any) => {
      setLoading(true);
      onError("");

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: ev.paymentMethod.id,
        },
        { handleActions: false }
      );

      if (confirmError) {
        ev.complete("fail");
        onError(confirmError.message || "Payment failed.");
        setLoading(false);
        return;
      }

      // Only proceed if payment actually succeeded
      if (paymentIntent?.status !== "succeeded") {
        ev.complete("success");
        onError("Payment is processing. Please wait a moment and refresh if needed.");
        setLoading(false);
        return;
      }

      ev.complete("success");
      setIsSuccess(true);

      // Payment succeeded — run analysis
      try {
        const analyzeRes = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ images, context }),
        });

        const analyzeData = await analyzeRes.json();
        if (!analyzeRes.ok) {
          onError(analyzeData.error || "Analysis failed.");
          setLoading(false);
          return;
        }

        onComplete(analyzeData);
      } catch (e: any) {
        onError(e.message || "Something went wrong.");
        setLoading(false);
      }
    };

    paymentRequest.on("paymentmethod", handler);
    return () => {
      paymentRequest.off("paymentmethod", handler);
    };
  }, [paymentRequest, stripe, clientSecret, images, context, onComplete, onError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    onError("");

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        onError(submitError.message || "Payment validation failed.");
        setLoading(false);
        return;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/result`,
        },
        redirect: "if_required",
      });

      if (confirmError) {
        onError(confirmError.message || "Payment failed.");
        setLoading(false);
        return;
      }

      // Only proceed if payment actually succeeded
      if (paymentIntent?.status !== "succeeded") {
        onError("Payment is processing. Please complete the payment to unlock your report.");
        setLoading(false);
        return;
      }

      setIsSuccess(true);

      // Payment succeeded — run analysis
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images, context }),
      });

      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) {
        onError(analyzeData.error || "Analysis failed.");
        setLoading(false);
        return;
      }

      onComplete(analyzeData);
    } catch (e: any) {
      onError(e.message || "Something went wrong.");
      setLoading(false);
    }
  };

  // Show success state while analysis runs
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Payment confirmed! Generating your report...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {paymentRequest && (
        <>
          <PaymentRequestButtonElement
            options={{
              paymentRequest,
              style: {
                paymentRequestButton: {
                  type: "buy",
                  theme: "dark",
                  height: "48px",
                },
              },
            }}
          />
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or pay with card</span>
            </div>
          </div>
        </>
      )}
      <PaymentElement
        options={{
          layout: {
            type: "tabs",
            defaultCollapsed: false,
          },
          paymentMethodOrder: ["card", "cashapp", "apple_pay", "google_pay"],
          wallets: {
            applePay: "auto",
            googlePay: "auto",
          },
        }}
      />
      <Button
        type="submit"
        disabled={!stripe || !elements || loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {loading ? "Processing..." : "Pay $0.99 & Analyze"}
      </Button>
    </form>
  );
}
