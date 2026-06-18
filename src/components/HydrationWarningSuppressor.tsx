"use client";

import { useEffect } from "react";

export function HydrationWarningSuppressor() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      const originalError = console.error;
      console.error = (...args: any[]) => {
        if (
          typeof args[0] === "string" && 
          args[0].includes("hydration") &&
          args[0].includes("attributes")
        ) {
          // Suppress React hydration mismatch warnings in the dev console
          // specifically caused by browser extensions injecting attributes.
          return;
        }
        originalError.apply(console, args);
      };
    }
  }, []);

  return null;
}
