"use client"

import { useState } from "react"
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

type Dish = { name: string; meta: string }

type Plan = {
  id: string
  name: string
  tagline: string
  target: string
  icon: typeof Briefcase
  highlights: string[]
  dishes: Dish[]
  vegDishes: Dish[]
  accent: boolean
}

const PLANS: Plan[] = [
  {
    id: "workweek",
    name: "The 9-to-5 Workweek Plan",
    tagline: "Balanced Nutrition",
    target: "Busy IT & corporate professionals",
    icon: Briefcase,
    highlights: ["2 meals/day — lunch + dinner", "Balanced macros, portion-controlled", "Zero prep, delivered ready to eat"],
    dishes: [
      { name: "Herb-Grilled Fish & Millet Pulao", meta: "480 kcal · 34g protein" },
      { name: "Chicken Curry with Jeera Rice", meta: "520 kcal · 32g protein" },
      { name: "Rajma Power Bowl with Brown Rice", meta: "540 kcal · 22g protein" },
    ],
    vegDishes: [
      { name: "Paneer Tikka Quinoa Bowl", meta: "520 kcal · 28g protein" },
      { name: "Veg Kofta & Millet Pulao", meta: "470 kcal · 20g protein" },
      { name: "Rajma Power Bowl with Brown Rice", meta: "540 kcal · 22g protein" },
    ],
    accent: false,
  },
  {
    id: "macro-fit",
    name: "The High-Protein Macro-Fit Plan",
    tagline: "Performance Focus",
    target: "Gym-goers & athletes",
    icon: Dumbbell,
    highlights: ["3 protein-dense meals + 1 post-workout snack", "Exact calorie & macro breakdown per meal", "Chef-crafted for training days"],
    dishes: [
      { name: "Grilled Chicken Macro Plate", meta: "610 kcal · 46g protein" },
      { name: "Egg-White Bhurji Wrap", meta: "430 kcal · 32g protein" },
      { name: "Post-Workout Peanut Chikki Shake", meta: "280 kcal · 24g protein" },
    ],
    vegDishes: [
      { name: "High-Protein Soya Tikka Plate", meta: "580 kcal · 42g protein" },
      { name: "Paneer Bhurji Protein Wrap", meta: "450 kcal · 30g protein" },
      { name: "Post-Workout Peanut Chikki Shake", meta: "280 kcal · 24g protein" },
    ],
    accent: true,
  },
  {
    id: "essential",
    name: "The Essential Smart Plan",
    tagline: "Budget-Friendly",
    target: "Students & seniors",
    icon: PiggyBank,
    highlights: ["Clean comfort-food staples", "Accessible daily rate", "Home-style, easy on digestion"],
    dishes: [
      { name: "Dal Tadka, Jeera Rice & Salad", meta: "460 kcal · 18g protein" },
      { name: "Egg Curry with Phulka Rotis", meta: "440 kcal · 22g protein" },
      { name: "Curd Rice with Pomegranate", meta: "380 kcal · 12g protein" },
    ],
    vegDishes: [
      { name: "Dal Tadka, Jeera Rice & Salad", meta: "460 kcal · 18g protein" },
      { name: "Veg Khichdi with Ghee & Papad", meta: "410 kcal · 14g protein" },
      { name: "Curd Rice with Pomegranate", meta: "380 kcal · 12g protein" },
    ],
    accent: false,
  },
]

export function ResultsScreen({ data }: { data: WizardData }) {
  const [expanded, setExpanded] = useState<string | null>("macro-fit")
  const [selected, setSelected] = useState<string | null>(null)

  const dietLabel = data.diet ? data.diet.replace("-", " ") : "custom"
  const isVeg = data.diet === "vegetarian" || data.diet === "vegan"

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
              Calibrated to your goal and activity level. Tap a plan to preview sample dishes.
            </p>
          </motion.div>
        </header>

        {/* Plan cards */}
        <div className="flex flex-col gap-4">
          {PLANS.map((plan, i) => {
            const isOpen = expanded === plan.id
            const isSelected = selected === plan.id
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
                    : plan.accent
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
                      plan.accent ? "bg-primary text-primary-foreground" : "bg-secondary text-primary",
                    )}
                  >
                    <plan.icon className="size-5" />
                  </span>
                  <span className="flex flex-1 flex-col gap-0.5">
                    <span className="flex items-center gap-2">
                      <span className="font-serif text-lg font-semibold leading-snug text-foreground text-balance">
                        {plan.name}
                      </span>
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
                          <ul className="flex flex-col gap-2">
                            {(isVeg ? plan.vegDishes : plan.dishes).map((dish) => (
                              <li
                                key={dish.name}
                                className="flex items-center justify-between gap-3 rounded-xl bg-secondary px-4 py-3"
                              >
                                <span className="text-sm font-medium text-secondary-foreground">{dish.name}</span>
                                <span className="shrink-0 font-mono text-xs text-muted-foreground">{dish.meta}</span>
                              </li>
                            ))}
                          </ul>
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
