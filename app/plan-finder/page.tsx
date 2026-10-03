import type { Metadata } from "next"
import { PlanFinder } from "@/components/plan-finder/plan-finder"

export const metadata: Metadata = {
  title: "AI Plan Finder — Annam Kitchen",
  description:
    "Tell us about your routine, goals, and budget, and our recommendation model predicts the Annam Kitchen meal plan that fits you best.",
}

export default function PlanFinderPage() {
  return <PlanFinder />
}
