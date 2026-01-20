
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-graygreen to-pastelgreen">
      {/* Top Section */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
          rack<span className="text-darkgreen">trackr</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg text-pine">
          A modern personal finance tracker that helps you budget smarter,
          understand your spending, and save for what matters.
        </p>

        <div className="mt-8 flex gap-4">
          <Button size="lg" className="bg-darkgreen text-slate" asChild>
            <Link href="/auth/register">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" className="bg-slate text-darkgreen" asChild>
            <Link href="#features">Learn More</Link>
          </Button>
        </div>

        <div className="mt-20 animate-bounce text-pine">
          ↓ Scroll to explore
        </div>
      </section>
      {/* Feature Card Section */}
      <section
        id="features"
        className="mx-auto max-w-6xl px-6 py-24"
      >
        <h2 className="mb-12 text-center text-3xl font-semibold sm:text-4xl">
          What racktrackr does
        </h2>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            title="Smart Budgeting"
            description="Create time-based or open-ended budgets and track your spending against them in real time."
          />
          <FeatureCard
            title="Bank Sync (Plaid Sandbox)"
            description="Securely connect your bank accounts to automatically import transactions."
          />
          <FeatureCard
            title="Spending Insights"
            description="See clear charts, trends, and month-to-month explanations for where your money goes."
          />
          <FeatureCard
            title="Goals & Savings"
            description="Save for big purchases like a couch or Christmas and get suggestions to adjust your budget."
          />
          <FeatureCard
            title="Wishlist & Treats"
            description="Add items to your wishlist and get a friendly nudge when you’ve saved enough to buy one."
          />
          <FeatureCard
            title="Retirement Projection"
            description="Estimate how your investments could grow over time based on your age and contributions."
          />
        </div>
      </section>

      {/* Bottom Section */}
      <section className="bg-graygreen py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h3 className="text-3xl font-semibold">
            Start tracking smarter today
          </h3>
          <p className="mt-4 text-pastelgreen">
            Log in to connect your accounts, set your budgets, and take control
            of your financial future.
          </p>
          <Button className="mt-6 text-slate bg-darkgreen" size="lg" asChild>
            <Link href="/auth/login">Go to Login</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

/* Small reusable card component */
function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="p-6 transition bg-slate hover:shadow-md">
      <h4 className="mb-2 text-lg font-semibold">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
  );
}


// Layout:     flex grid min-h-screen max-w-xl mx-auto
// Spacing:    p-4 px-6 py-2 m-4 mt-6 gap-4
// Text:       text-sm text-lg text-2xl font-bold text-gray-700
// Color:      bg-blue-600 text-white border-gray-300
// Effects:    shadow-md rounded-lg hover:bg-blue-700
// Responsive: md:flex lg:grid-cols-3