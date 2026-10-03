"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowLeft,
  Briefcase,
  Dumbbell,
  PiggyBank,
  ChevronDown,
  Sparkles,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { WizardData } from "@/components/onboarding/onboarding-wizard"
import { PLAN_DISHES, RESTRICTION_TAG, filterDishes, recommendPlan, type PlanId } from "@/lib/meal-plans"
import { calculateTargets, toAge, toHeightCm, toWeightKg, type DailyTargets } from "@/lib/nutrition"

const DISHES_SHOWN = 3

type Plan = {
  id: PlanId
  name: string
  tagline: string
  target: string
  icon: typeof Briefcase
  highlights: string[]
}

function targetsFor(data: WizardData): DailyTargets | null {
  const age = toAge(data.age)
  const heightCm = toHeightCm(data.height, data.heightUnit, data.heightInches)
  const weightKg = toWeightKg(data.weight, data.weightUnit)
  if (age === null || heightCm === null || weightKg === null) return null
  if (!data.sex || !data.goal || !data.activity) return null
  return calculateTargets({ sex: data.sex, age, heightCm, weightKg, goal: data.goal, activity: data.activity })
}

const PLANS: Plan[] = [
  {
    id: "workweek",
    name: "The 9-to-5 Workweek Plan",
    tagline: "Balanced Nutrition",
    target: "Busy IT & corporate professionals",
    icon: Briefcase,
    highlights: ["2 meals/day — lunch + dinner", "Balanced macros, portion-controlled", "Zero prep, delivered ready to eat"],
  },
  {
    id: "macro-fit",
    name: "The High-Protein Macro-Fit Plan",
    tagline: "Performance Focus",
    target: "Gym-goers & athletes",
    icon: Dumbbell,
    highlights: ["3 protein-dense meals + 1 post-workout snack", "Exact calorie & macro breakdown per meal", "Chef-crafted for training days"],
  },
  {
    id: "essential",
    name: "The Essential Smart Plan",
    tagline: "Budget-Friendly",
    target: "Students & seniors",
    icon: PiggyBank,
    highlights: ["Clean comfort-food staples", "Accessible daily rate", "Home-style, easy on digestion"],
  },
]

export function ResultsScreen({ data }: { data: WizardData }) {
  const targets = useMemo(() => targetsFor(data), [data])
  const recommendedId = recommendPlan(data.goal, toAge(data.age))
  const [expanded, setExpanded] = useState<string | null>(recommendedId)
  const [selected, setSelected] = useState<string | null>(null)

  const dietLabel = data.diet ? data.diet.replace("-", " ") : "custom"
  const activeRestrictions = data.allergies.filter((a) => a in RESTRICTION_TAG)

  return (
    <main className="min-h-dvh w-full bg-background">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 py-6">
        {/* Header */}
        <header className="flex flex-col gap-4">
          <Button
            variant="ghost"
            size="icon-sm"
            nativeButton={false}
            className="self-start"
            render={
              <Link href="/" aria-label="Back to home">
                <ArrowLeft className="size-4" />
              </Link>
            }
          />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2"
          >
            <Badge variant="secondary" className="w-fit gap-1.5">
              <Sparkles className="size-3 text-primary" />
              Your custom meal matrix
            </Badge>
            <h1 className="font-serif text-3xl font-semibold text-foreground text-balance">
              3 plans built for your {dietLabel} profile
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              {activeRestrictions.length > 0
                ? `Sample dishes are filtered to be ${activeRestrictions.join(", ")}. `
                : ""}
              Tap a plan to preview sample dishes.
            </p>
          </motion.div>
        </header>

        {/* Daily targets */}
        {targets && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            aria-labelledby="targets-heading"
            className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="targets-heading" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Your daily targets
              </h2>
              <span className="font-mono text-xs text-muted-foreground">
                maintenance ≈ {targets.tdee.toLocaleString("en-IN")} kcal
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-4xl font-semibold text-foreground tabular-nums">
                {targets.calories.toLocaleString("en-IN")}
              </span>
              <span className="text-sm text-muted-foreground">kcal / day</span>
            </div>
            <dl className="grid grid-cols-3 gap-2">
              {[
                { label: "Protein", value: targets.proteinG },
                { label: "Carbs", value: targets.carbsG },
                { label: "Fat", value: targets.fatG },
              ].map((macro) => (
                <div key={macro.label} className="flex flex-col gap-0.5 rounded-xl bg-secondary px-3 py-2.5">
                  <dt className="text-xs text-muted-foreground">{macro.label}</dt>
                  <dd className="font-mono text-base font-semibold text-secondary-foreground tabular-nums">
                    {macro.value}g
                  </dd>
                </div>
              ))}
            </dl>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Estimated with the Mifflin-St Jeor equation from your age, height, weight, and activity level.
              Not medical advice — check with a doctor or dietitian if you have a health condition.
            </p>
          </motion.section>
        )}

        {/* Plan cards */}
        <div className="flex flex-col gap-4">
          {PLANS.map((plan, i) => {
            const isOpen = expanded === plan.id
            const isSelected = selected === plan.id
            const isRecommended = plan.id === recommendedId
            const dishes = filterDishes(PLAN_DISHES[plan.id], data.diet, data.allergies).slice(0, DISHES_SHOWN)
            return (
              <motion.article
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.12 }}
                className={cn(
                  "overflow-hidden rounded-2xl border bg-card transition-colors",
                  isSelected
                    ? "border-primary ring-2 ring-primary"
                    : isRecommended
                      ? "border-primary/40"
                      : "border-border",
                )}
              >
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : plan.id)}
                  aria-expanded={isOpen}
                  className="flex min-h-12 w-full items-start gap-4 p-5 text-left"
                >
                  <span
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-xl",
                      isRecommended ? "bg-primary text-primary-foreground" : "bg-secondary text-primary",
                    )}
                  >
                    <plan.icon className="size-5" />
                  </span>
                  <span className="flex flex-1 flex-col gap-0.5">
                    {isRecommended && (
                      <Badge className="mb-1 w-fit">Recommended for you</Badge>
                    )}
                    <span className="font-serif text-lg font-semibold leading-snug text-foreground text-balance">
                      {plan.name}
                    </span>
                    <span className="text-sm font-medium text-primary">{plan.tagline}</span>
                    <span className="text-sm text-muted-foreground">{plan.target}</span>
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    className="mt-1 text-muted-foreground"
                    aria-hidden="true"
                  >
                    <ChevronDown className="size-5" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-4 border-t border-border px-5 pb-5 pt-4">
                        <ul className="flex flex-col gap-2">
                          {plan.highlights.map((h) => (
                            <li key={h} className="flex items-start gap-2 text-sm text-foreground">
                              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                              {h}
                            </li>
                          ))}
                        </ul>
                        <div className="flex flex-col gap-2">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Sample daily dishes
                          </p>
                          {dishes.length > 0 ? (
                            <ul className="flex flex-col gap-2">
                              {dishes.map((dish) => (
                                <li
                                  key={dish.name}
                                  className="flex items-center justify-between gap-3 rounded-xl bg-secondary px-4 py-3"
                                >
                                  <span className="text-sm font-medium text-secondary-foreground">{dish.name}</span>
                                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                                    {dish.kcal} kcal · {dish.proteinG}g protein
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="rounded-xl bg-secondary px-4 py-3 text-sm text-secondary-foreground">
                              None of this plan&apos;s sample dishes fit all your restrictions yet — our chefs
                              will build a custom menu for you.
                            </p>
                          )}
                        </div>
                        <motion.div whileTap={{ scale: 0.98 }}>
                          <Button
                            size="lg"
                            className="min-h-12 w-full rounded-full text-base"
                            onClick={() => setSelected(plan.id)}
                          >
                            {isSelected ? (
                              <>
                                <Check className="size-4" />
                                Plan Selected
                              </>
                            ) : (
                              "Select This Plan"
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            )
          })}
        </div>

        {/* Selected confirmation */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 rounded-2xl border border-primary/40 bg-primary/5 p-5 text-center"
            >
              <p className="text-sm text-foreground leading-relaxed">
                Great choice! Join the waitlist and we&apos;ll notify you the moment{" "}
                <span className="font-semibold">{PLANS.find((p) => p.id === selected)?.name}</span> is ready to order.
              </p>
              <Button
                nativeButton={false}
                className="min-h-12 rounded-full px-6"
                render={<Link href="/#waitlist">Join the Waitlist</Link>}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
