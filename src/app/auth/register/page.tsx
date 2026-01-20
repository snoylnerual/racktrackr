"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import Link from "next/link";
import { z } from "zod";

const RegisterSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(50, "Name is too long").optional(),
    email: z.string().trim().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters").max(100),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormInformation = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const [form, setForm] = useState<FormInformation>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormInformation, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function onChange<K extends keyof FormInformation>(key: K, value: FormInformation[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    setFormError(null);
    setSuccessMsg(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    const parsed = RegisterSchema.safeParse(form);
    if (!parsed.success) {
      const nextErrors: Partial<Record<keyof FormInformation, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FormInformation | undefined;
        if (key) nextErrors[key] = issue.message;
      }
      setFieldErrors(nextErrors);
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch("/api/prisma/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name?.trim() || undefined,
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { message?: string };

      if (!res.ok) {
        setFormError(data.message || "Could not create account. Please try again.");
        return;
      }

      setSuccessMsg("Account created! You can now sign in.");
      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
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
            Create your <span className="text-darkgreen">racktrackr</span> account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track spending, budgets, goals, and your wishlist — securely.
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                autoComplete="name"
                value={form.name}
                onChange={(e) => onChange("name", e.target.value)}
                placeholder="Lauren"
              />
              {fieldErrors.name ? <p className="text-sm text-destructive">{fieldErrors.name}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
                placeholder="you@example.com"
                required
              />
              {fieldErrors.email ? <p className="text-sm text-destructive">{fieldErrors.email}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => onChange("password", e.target.value)}
                placeholder="At least 8 characters"
                required
              />
              {fieldErrors.password ? (
                <p className="text-sm text-destructive">{fieldErrors.password}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Use 8+ characters. Don’t reuse a password from another site.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) => onChange("confirmPassword", e.target.value)}
                required
              />
              {fieldErrors.confirmPassword ? (
                <p className="text-sm text-destructive">{fieldErrors.confirmPassword}</p>
              ) : null}
            </div>

            {formError ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {formError}
              </div>
            ) : null}

            {successMsg ? (
              <div className="rounded-md border border-primary/30 bg-primary/10 p-3 text-sm">
                {successMsg}{" "}
                <Link href="/auth/login" className="underline underline-offset-4">
                  Sign in
                </Link>
                .
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-medium text-primary underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </form>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          This is a personal project. Uses the Plaid Sandbox for demo data.
        </p>
      </div>
    </main>
  );
}
