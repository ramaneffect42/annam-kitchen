"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Drumstick,
  Egg,
  Sprout,
  Flame,
  Dumbbell,
  Sun,
  Armchair,
  Footprints,
  Zap,
  Check,
  UtensilsCrossed,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingOverlay } from "@/components/onboarding/loading-overlay"
import { ResultsScreen } from "@/components/onboarding/results-screen"

export type WizardData = {
  diet: string | null
  age: string
  height: string
  heightUnit: "cm" | "ft"
  weight: string
  weightUnit: "kg" | "lbs"
  goal: string | null
  allergies: string[]
  activity: string | null
}

const TOTAL_STEPS = 5

const dietOptions = [
  { value: "vegetarian", label: "Vegetarian", desc: "Plant-forward with dairy", icon: Leaf },
  { value: "non-vegetarian", label: "Non-Vegetarian", desc: "All proteins on the menu", icon: Drumstick },
  { value: "eggetarian", label: "Eggetarian", desc: "Vegetarian plus eggs", icon: Egg },
  { value: "vegan", label: "Vegan", desc: "100% plant-based", icon: Sprout },
]

const goalOptions = [
  { value: "weight-loss", label: "Weight Loss & Lean Out", desc: "Calorie-smart, high-satiety meals", icon: Flame },
  { value: "muscle", label: "Muscle Building", desc: "Protein-dense, performance fuel", icon: Dumbbell },
  { value: "wellness", label: "Everyday Energy & Wellness", desc: "Balanced nutrition for daily life", icon: Sun },
]

const allergyOptions = [
  "Dairy-Free",
  "Gluten-Free",
  "Nut-Free",
  "Soy-Free",
  "Low Sodium",
  "No Restrictions",
]

const activityOptions = [
  { value: "sedentary", label: "Sedentary", desc: "Desk job, light movement", icon: Armchair },
  { value: "moderate", label: "Moderately Active", desc: "Regular walks, light workouts", icon: Footprints },
  { value: "very-active", label: "Very Active", desc: "Gym, sports, high output", icon: Zap },
]

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "60%" : "-60%",
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? "-60%" : "60%",
    opacity: 0,
  }),
}

export function OnboardingWizard() {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [phase, setPhase] = useState<"form" | "loading" | "results">("form")
  const [data, setData] = useState<WizardData>({
    diet: null,
    age: "",
    height: "",
    heightUnit: "cm",
    weight: "",
    weightUnit: "kg",
    goal: null,
    allergies: [],
    activity: null,
  })

  const update = useCallback(<K extends keyof WizardData>(key: K, value: WizardData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }))
  }, [])

  const toggleAllergy = (tag: string) => {
    setData((prev) => {
      if (tag === "No Restrictions") {
        return { ...prev, allergies: prev.allergies.includes(tag) ? [] : [tag] }
      }
      const without = prev.allergies.filter((a) => a !== "No Restrictions")
      return {
        ...prev,
        allergies: without.includes(tag) ? without.filter((a) => a !== tag) : [...without, tag],
      }
    })
  }

  const stepValid = (() => {
    switch (step) {
      case 0:
        return data.diet !== null
      case 1:
        return data.age.trim() !== "" && data.height.trim() !== "" && data.weight.trim() !== ""
      case 2:
        return data.goal !== null
      case 3:
        return data.allergies.length > 0
      case 4:
        return data.activity !== null
      default:
        return false
    }
  })()

  const goNext = () => {
    if (!stepValid) return
    if (step === TOTAL_STEPS - 1) {
      setPhase("loading")
      return
    }
    setDirection(1)
    setStep((s) => s + 1)
  }

  const goBack = () => {
    if (step === 0) return
    setDirection(-1)
    setStep((s) => s - 1)
  }

  if (phase === "results") {
    return <ResultsScreen data={data} />
  }

  return (
    <main className="relative flex h-dvh w-full flex-col overflow-hidden bg-background">
      {/* Top bar: back to home + progress */}
      <header className="flex items-center gap-3 px-4 pt-4 pb-2">
        <Button
          variant="ghost"
          size="icon-sm"
          nativeButton={false}
          render={
            <Link href="/" aria-label="Back to home">
              <ArrowLeft className="size-4" />
            </Link>
          }
        />
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={TOTAL_STEPS}
          aria-valuenow={step + 1}
          aria-label={`Step ${step + 1} of ${TOTAL_STEPS}`}
        >
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 26 }}
          />
        </div>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {step + 1}/{TOTAL_STEPS}
        </span>
      </header>

      {/* Sliding step content */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="popLayout" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="absolute inset-0 overflow-y-auto"
          >
            <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-5 py-6">
              {step === 0 && (
                <StepShell
                  title="How do you eat?"
                  subtitle={"We'll only show recipes that fit your plate."}
                >
                  <div className="flex flex-col gap-3">
                    {dietOptions.map((opt) => (
                      <SelectCard
                        key={opt.value}
                        selected={data.diet === opt.value}
                        onSelect={() => update("diet", opt.value)}
                        icon={<opt.icon className="size-5" />}
                        label={opt.label}
                        desc={opt.desc}
                      />
                    ))}
                  </div>
                </StepShell>
              )}

              {step === 1 && (
                <StepShell
                  title="Tell us about you"
                  subtitle="Your biometrics shape your calorie and macro targets."
                >
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        inputMode="numeric"
                        min={10}
                        max={100}
                        placeholder="e.g. 29"
                        className="min-h-12 text-base"
                        value={data.age}
                        onChange={(e) => update("age", e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="height">Height</Label>
                      <div className="flex gap-2">
                        <Input
                          id="height"
                          type="number"
                          inputMode="decimal"
                          placeholder={data.heightUnit === "cm" ? "e.g. 172" : "e.g. 5.7"}
                          className="min-h-12 flex-1 text-base"
                          value={data.height}
                          onChange={(e) => update("height", e.target.value)}
                        />
                        <UnitToggle
                          options={["cm", "ft"]}
                          value={data.heightUnit}
                          onChange={(v) => update("heightUnit", v as "cm" | "ft")}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="weight">Current weight</Label>
                      <div className="flex gap-2">
                        <Input
                          id="weight"
                          type="number"
                          inputMode="decimal"
                          placeholder={data.weightUnit === "kg" ? "e.g. 74" : "e.g. 163"}
                          className="min-h-12 flex-1 text-base"
                          value={data.weight}
                          onChange={(e) => update("weight", e.target.value)}
                        />
                        <UnitToggle
                          options={["kg", "lbs"]}
                          value={data.weightUnit}
                          onChange={(v) => update("weightUnit", v as "kg" | "lbs")}
                        />
                      </div>
                    </div>
                  </div>
                </StepShell>
              )}

              {step === 2 && (
                <StepShell
                  title={"What's your goal?"}
                  subtitle="Every meal is portioned toward it."
                >
                  <div className="flex flex-col gap-3">
                    {goalOptions.map((opt) => (
                      <SelectCard
                        key={opt.value}
                        selected={data.goal === opt.value}
                        onSelect={() => update("goal", opt.value)}
                        icon={<opt.icon className="size-5" />}
                        label={opt.label}
                        desc={opt.desc}
                      />
                    ))}
                  </div>
                </StepShell>
              )}

              {step === 3 && (
                <StepShell
                  title="Any restrictions?"
                  subtitle="Select all that apply — our chefs cook around them."
                >
                  <div className="flex flex-wrap gap-2.5">
                    {allergyOptions.map((tag) => {
                      const selected = data.allergies.includes(tag)
                      return (
                        <motion.button
                          key={tag}
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleAllergy(tag)}
                          aria-pressed={selected}
                          className={cn(
                            "flex min-h-12 items-center gap-2 rounded-full border px-5 text-sm font-medium transition-colors",
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-foreground hover:border-primary/50",
                          )}
                        >
                          {selected && <Check className="size-4" />}
                          {tag}
                        </motion.button>
                      )
                    })}
                  </div>
                </StepShell>
              )}

              {step === 4 && (
                <StepShell
                  title="How active are you?"
                  subtitle="This calibrates your daily calorie budget."
                >
                  <div className="flex flex-col gap-3">
                    {activityOptions.map((opt) => (
                      <SelectCard
                        key={opt.value}
                        selected={data.activity === opt.value}
                        onSelect={() => update("activity", opt.value)}
                        icon={<opt.icon className="size-5" />}
                        label={opt.label}
                        desc={opt.desc}
                      />
                    ))}
                  </div>
                </StepShell>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <footer className="flex items-center justify-between gap-4 px-5 pb-6 pt-3">
        <Button
          variant="outline"
          size="icon-lg"
          onClick={goBack}
          disabled={step === 0}
          aria-label="Previous step"
          className="min-h-12 min-w-12 rounded-full bg-transparent"
        >
          <ChevronLeft className="size-5" />
        </Button>
        <Button
          size="lg"
          onClick={goNext}
          disabled={!stepValid}
          className="min-h-12 flex-1 rounded-full text-base"
        >
          {step === TOTAL_STEPS - 1 ? (
            <>
              <UtensilsCrossed className="size-4" />
              Build My Plan
            </>
          ) : (
            "Continue"
          )}
        </Button>
        <Button
          variant="outline"
          size="icon-lg"
          onClick={goNext}
          disabled={!stepValid || step === TOTAL_STEPS - 1}
          aria-label="Next step"
          className="min-h-12 min-w-12 rounded-full bg-transparent"
        >
          <ChevronRight className="size-5" />
        </Button>
      </footer>

      {/* AI calculation overlay */}
      <AnimatePresence>
        {phase === "loading" && <LoadingOverlay onComplete={() => setPhase("results")} />}
      </AnimatePresence>
    </main>
  )
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-3xl font-semibold text-foreground text-balance">{title}</h1>
        <p className="text-muted-foreground leading-relaxed">{subtitle}</p>
      </div>
      {children}
    </section>
  )
}

function SelectCard({
  selected,
  onSelect,
  icon,
  label,
  desc,
}: {
  selected: boolean
  onSelect: () => void
  icon: React.ReactNode
  label: string
  desc: string
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex min-h-16 w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border bg-card hover:border-primary/50",
      )}
    >
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl",
          selected ? "bg-primary text-primary-foreground" : "bg-secondary text-primary",
        )}
      >
        {icon}
      </span>
      <span className="flex flex-1 flex-col">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-sm text-muted-foreground">{desc}</span>
      </span>
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-border",
        )}
        aria-hidden="true"
      >
        {selected && <Check className="size-3.5" />}
      </span>
    </motion.button>
  )
}

function UnitToggle({
  options,
  value,
  onChange,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex min-h-12 items-center rounded-lg border border-border bg-secondary p-1" role="group" aria-label="Unit">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          aria-pressed={value === opt}
          className={cn(
            "min-h-10 rounded-md px-3 text-sm font-medium transition-colors",
            value === opt ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
