"use client";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { useSession } from "next-auth/react";

export default function WIP() {

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
            <p className="text-center">Data</p>
          </HoverCardContent>
        </HoverCard>
    </div>
  );
}
