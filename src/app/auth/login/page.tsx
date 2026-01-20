"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!email.trim() || !password) {
      setFormError("Please enter your email and password.");
      return;
    }

    try {
      setIsSubmitting(true);

      // NextAuth Credentials sign-in
      const res = await signIn("credentials", {
        redirect: false,
        username: email.trim().toLowerCase(),
        password,
        callbackUrl: "/landing",
      });

      if (!res) {
        setFormError("Something went wrong. Please try again.");
        return;
      }

      if (res.error) {
        setFormError("Invalid email or password.");
        return;
      }

      // NextAuth returns a URL when successful
      window.location.href = res.url ?? "/dashboard";
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-pastelgreen to-muted px-6 py-16">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Sign in to <span className="text-darkgreen">racktrackr</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Securely track budgets, spending, goals, and your wishlist.
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                placeholder="your-password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {formError ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {formError}
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>

            <div className="flex items-center justify-between text-sm">
              <Link
                href="/auth/register"
                className="text-primary underline underline-offset-4"
              >
                Create an account
              </Link>
            </div>
          </form>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Using Plaid Sandbox for demo data.
        </p>
      </div>
    </main>
  );
}
