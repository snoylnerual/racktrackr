"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { useSession } from "next-auth/react";

// TODO: different charts
// the plan is to do a modular dashboard where you can choose which 
// charts best work for you and save them off. The saving off will
// most likely start with one front page that has static dashboard
// choices. Then I would like to add the possibility to choose from
// a selection of many charts. Then the possibility to add some 
// custom charts. Then the possibility to move them around and the
// last charts that you had on your dashboard will stay there.
// Then hopefully different sets of dashboards that you can save off
// and click to pull up. You would have a maximum of different
// dashboards you could create.

// Example charts
// Spending over time trend line (day, month, year)
// spending over time bar chart (day, month, year)
    // possibly be able to click the (day,month,year) and have all
    // of the transactions pull up on a separate page
// pie chart for categorical spending
// overall account balance
// overall plus and minus for accounts
// savings line chart
// budget progress bars

// start with recharts, possibly explore charts.js, and finally do d3.js
// d3.js works good for custom visuals but has a steep learning curve
// victory id good for data analytics
// nivo is good for pretty dashboards

export default function Dashboard() {

  const { status } = useSession();
  
  if (status === "loading") {
    return <span>Loading...</span>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-pastelgreen to-muted">
      <HoverCard>
          <HoverCardTrigger asChild>
            <h1
              className="flex cursor-help select-none text-6xl font-bold tracking-tight sm:text-9xl"
              aria-label="Work in progress"
            >
              {["W", "I", "P"].map((letter) => (
                <span
                  key={letter}
                  className="
                    inline-block
                    transition-transform
                    ease-out
                    hover:scale-110
                    text-pine"
                >
                  {letter}
                </span>
              ))}
            </h1>
          </HoverCardTrigger>

          <HoverCardContent side={"bottom"} className="w-md max-w-[90vw] bg-pastelgreen">
            <h2 className="pb-3 text-center font-semibold">This page is under construction.</h2>
            <p className="text-center">
              The dashboard page will hold charts, trends, and month-to-month explanations of your financial habits. 
              The intent is to have modular informational charts that you can use to customize your page with your
              desired information.
            </p>
          </HoverCardContent>
        </HoverCard>
    </div>
  );
}
