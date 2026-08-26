import type { Metadata } from "next"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"

export const metadata: Metadata = {
  title: "Try the Demo — Annam Kitchen",
  description:
    "Answer 5 quick questions and let Annam Kitchen generate your personalized chef-crafted meal plan.",
}

export default function DemoPage() {
  return <OnboardingWizard />
}
