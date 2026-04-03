import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-03-25.dahlia",
});

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();

    if (!amount || typeof amount !== "number") {
      return NextResponse.json(
        { error: "Invalid amount provided." },
        { status: 400 }
      );
    }

    const priceId = process.env.STRIPE_PRICE_ID;
    
    if (priceId) {
      // Use Stripe Product/Price for cleaner reporting
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 99,
        currency: "usd",
        payment_method_types: ["card", "cashapp"],
        description: "Psychologist process for conversation analysis",
        statement_descriptor: "SETTLE.IT",
        metadata: {
          price_id: priceId,
        },
      });
      return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    }

    // Fallback: raw amount (no product)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 99,
      currency: "usd",
      payment_method_types: ["card", "cashapp"],
      description: "Psychologist process for conversation analysis",
      statement_descriptor: "SETTLE.IT",
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
