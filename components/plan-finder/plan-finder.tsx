"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowLeft,
  Briefcase,
  Check,
  CheckCircle2,
  Dumbbell,
  Leaf,
  Loader2,
  PiggyBank,
  RotateCcw,
  Sparkles,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api, type PlanId, type PlanPrediction, type PlanProfile } from "@/lib/api"
import { PLAN_DISHES, filterDishes } from "@/lib/meal-plans"
import { LIMITS, calculateTargets, inRange, toAge, toHeightCm, toWeightKg } from "@/lib/nutrition"

/* ------------------------------------------------------------------ */
/* Options                                                             */
/* ------------------------------------------------------------------ */

type Option<T extends string | number> = { value: T; label: string }

const DIETS: Option<PlanProfile["diet"]>[] = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "non-vegetarian", label: "Non-Vegetarian" },
  { value: "eggetarian", label: "Eggetarian" },
  { value: "vegan", label: "Vegan" },
]

const SEXES: Option<PlanProfile["sex"]>[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "unspecified", label: "Prefer not to say" },
]

const OCCUPATIONS: Option<PlanProfile["occupation"]>[] = [
  { value: "student", label: "Student" },
  { value: "professional", label: "Working professional" },
  { value: "retired", label: "Retired" },
  { value: "other", label: "Other" },
]

const GOALS: Option<PlanProfile["goal"]>[] = [
  { value: "weight-loss", label: "Weight loss" },
  { value: "muscle", label: "Build muscle" },
  { value: "wellness", label: "Everyday wellness" },
]

const ACTIVITIES: Option<PlanProfile["activity"]>[] = [
  { value: "sedentary", label: "Sedentary" },
  { value: "moderate", label: "Moderately active" },
  { value: "very-active", label: "Very active" },
]

const BUDGETS: Option<PlanProfile["budget"]>[] = [
  { value: "under-150", label: "Under ₹150" },
  { value: "150-300", label: "₹150–300" },
  { value: "300-500", label: "₹300–500" },
  { value: "500-plus", label: "₹500+" },
]

const MEALS: Option<"1" | "2" | "3">[] = [
  { value: "1", label: "1 meal" },
  { value: "2", label: "2 meals" },
  { value: "3", label: "3 meals" },
]

type Restriction = PlanProfile["restrictions"][number]

/** Backend value → label used by the dish filter in lib/meal-plans. */
const RESTRICTIONS: Option<Restriction>[] = [
  { value: "dairy", label: "Dairy-Free" },
  { value: "gluten", label: "Gluten-Free" },
  { value: "nuts", label: "Nut-Free" },
  { value: "soy", label: "Soy-Free" },
  { value: "low-sodium", label: "Low Sodium" },
]

const PLAN_INFO: Record<
  PlanId,
  { name: string; tagline: string; price: string; waitlistName: string; icon: typeof Briefcase }
> = {
  workweek: {
    name: "The 9-to-5 Workweek Plan",
    tagline: "Lunch + dinner handled, Monday to Friday",
    price: "₹149",
    waitlistName: "9-to-5 Workweek",
    icon: Briefcase,
  },
  "macro-fit": {
    name: "The High-Protein Macro-Fit Plan",
    tagline: "35g+ protein per meal, dialed-in macros",
    price: "₹189",
    waitlistName: "Gym High-Protein",
    icon: Dumbbell,
  },
  essential: {
    name: "The Essential Smart Plan",
    tagline: "Clean comfort food at a budget-friendly price",
    price: "₹99",
    waitlistName: "Student Budget Plan",
    icon: PiggyBank,
  },
}

const PLAN_ORDER: PlanId[] = ["workweek", "macro-fit", "essential"]

/* ------------------------------------------------------------------ */
/* Form state                                                          */
/* ------------------------------------------------------------------ */

type FormState = {
  diet: PlanProfile["diet"] | null
  sex: PlanProfile["sex"] | null
  occupation: PlanProfile["occupation"] | null
  goal: PlanProfile["goal"] | null
  activity: PlanProfile["activity"] | null
  budget: PlanProfile["budget"] | null
  meals: "1" | "2" | "3" | null
  age: string
  height: string
  heightInches: string
  heightUnit: "cm" | "ft"
  weight: string
  weightUnit: "kg" | "lbs"
  workouts: string
  restrictions: Restriction[]
}

const INITIAL_FORM: FormState = {
  diet: null,
  sex: null,
  occupation: null,
  goal: null,
  activity: null,
  budget: null,
  meals: null,
  age: "",
  height: "",
  heightInches: "",
  heightUnit: "cm",
  weight: "",
  weightUnit: "kg",
  workouts: "",
  restrictions: [],
}

const WORKOUT_LIMITS = { min: 0, max: 14 }

function toProfile(form: FormState): PlanProfile | null {
  const age = toAge(form.age)
  const heightCm = toHeightCm(form.height, form.heightUnit, form.heightInches)
  const weightKg = toWeightKg(form.weight, form.weightUnit)
  const workouts = toAge(form.workouts)
  if (!inRange(age, LIMITS.age) || !inRange(heightCm, LIMITS.heightCm) || !inRange(weightKg, LIMITS.weightKg)) {
    return null
  }
  if (!inRange(workouts, WORKOUT_LIMITS)) return null
  const { diet, sex, occupation, goal, activity, budget, meals } = form
  if (!diet || !sex || !occupation || !goal || !activity || !budget || !meals) return null
  return {
    age: age!,
    sex,
    height_cm: Math.round(heightCm! * 10) / 10,
    weight_kg: Math.round(weightKg! * 10) / 10,
    goal,
    activity,
    workouts_per_week: workouts!,
    diet,
    occupation,
    budget,
    meals_per_day: Number(meals),
    restrictions: form.restrictions,
  }
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function PlanFinder() {
  const [form, setForm] = React.useState<FormState>(INITIAL_FORM)
  const [submitted, setSubmitted] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<{ profile: PlanProfile; prediction: PlanPrediction } | null>(null)
  const resultsRef = React.useRef<HTMLDivElement>(null)

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const profile = toProfile(form)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    setError(null)
    if (!profile) {
      setError("Please answer every question — the highlighted fields need attention.")
      return
    }
    setLoading(true)
    try {
      const res = await api.predictPlan(profile)
      setResult({ profile, prediction: res.data! })
      requestAnimationFrame(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const missing = (value: unknown) => submitted && (value === null || value === "")

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center bg-primary text-primary-foreground">
              <Leaf className="size-4" aria-hidden="true" />
            </span>
            <span className="font-serif text-lg font-semibold tracking-tight text-foreground">Annam Kitchen</span>
          </Link>
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <Link href="/">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Home
              </Link>
            }
          />
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-10 md:px-6 md:py-14">
        <section className="flex max-w-2xl flex-col gap-3">
          <Badge variant="secondary" className="w-fit gap-1.5">
            <Sparkles className="size-3 text-primary" aria-hidden="true" />
            AI Plan Finder
          </Badge>
          <h1 className="font-serif text-4xl font-semibold text-balance text-foreground md:text-5xl">
            Find the plan that fits your life
          </h1>
          <p className="leading-relaxed text-muted-foreground">
            Answer a few questions and our recommendation model predicts which Annam Kitchen plan suits you best —
            and tells you why.
          </p>
        </section>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <FormSection title="About you">
              <Field label="Sex" invalid={missing(form.sex)}>
                <ChoiceGroup options={SEXES} value={form.sex} onChange={(v) => update("sex", v)} />
              </Field>
              <Field
                label="Age"
                htmlFor="pf-age"
                error={
                  form.age !== "" && !inRange(toAge(form.age), LIMITS.age)
                    ? `Enter a whole number between ${LIMITS.age.min} and ${LIMITS.age.max}.`
                    : undefined
                }
                invalid={missing(form.age)}
              >
                <Input
                  id="pf-age"
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 29"
                  value={form.age}
                  onChange={(e) => update("age", e.target.value)}
                />
              </Field>
              <HeightWeightFields form={form} setForm={setForm} submitted={submitted} />
              <Field label="What do you do?" invalid={missing(form.occupation)}>
                <ChoiceGroup options={OCCUPATIONS} value={form.occupation} onChange={(v) => update("occupation", v)} />
              </Field>
            </FormSection>

            <FormSection title="Your goals & routine">
              <Field label="Main goal" invalid={missing(form.goal)}>
                <ChoiceGroup options={GOALS} value={form.goal} onChange={(v) => update("goal", v)} />
              </Field>
              <Field label="Activity level" invalid={missing(form.activity)}>
                <ChoiceGroup options={ACTIVITIES} value={form.activity} onChange={(v) => update("activity", v)} />
              </Field>
              <Field
                label="Workouts per week"
                htmlFor="pf-workouts"
                error={
                  form.workouts !== "" && !inRange(toAge(form.workouts), WORKOUT_LIMITS)
                    ? `Enter a whole number between ${WORKOUT_LIMITS.min} and ${WORKOUT_LIMITS.max}.`
                    : undefined
                }
                invalid={missing(form.workouts)}
              >
                <Input
                  id="pf-workouts"
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 3"
                  value={form.workouts}
                  onChange={(e) => update("workouts", e.target.value)}
                />
              </Field>
              <Field label="Daily food budget" invalid={missing(form.budget)}>
                <ChoiceGroup options={BUDGETS} value={form.budget} onChange={(v) => update("budget", v)} />
              </Field>
              <Field label="Meals you want from us each day" invalid={missing(form.meals)}>
                <ChoiceGroup options={MEALS} value={form.meals} onChange={(v) => update("meals", v)} />
              </Field>
            </FormSection>
          </div>

          <FormSection title="Food preferences">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Diet" invalid={missing(form.diet)}>
                <ChoiceGroup options={DIETS} value={form.diet} onChange={(v) => update("diet", v)} />
              </Field>
              <Field label="Restrictions (optional)">
                <ChoiceGroup
                  options={RESTRICTIONS}
                  multiple
                  values={form.restrictions}
                  onToggle={(v) =>
                    update(
                      "restrictions",
                      form.restrictions.includes(v)
                        ? form.restrictions.filter((r) => r !== v)
                        : [...form.restrictions, v],
                    )
                  }
                />
              </Field>
            </div>
          </FormSection>

          {error && (
            <p className="border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="submit" size="lg" disabled={loading} className="sm:w-auto">
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Predicting…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" aria-hidden="true" />
                  {result ? "Update my recommendation" : "Find my plan"}
                </>
              )}
            </Button>
            {result && (
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => {
                  setForm(INITIAL_FORM)
                  setResult(null)
                  setSubmitted(false)
                  setError(null)
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }}
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Start over
              </Button>
            )}
          </div>
        </form>

        <div ref={resultsRef} className="scroll-mt-6">
          <AnimatePresence mode="wait">
            {result && (
              <Results
                key={result.prediction.prediction_id}
                profile={result.profile}
                prediction={result.prediction}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Results                                                             */
/* ------------------------------------------------------------------ */

function Results({ profile, prediction }: { profile: PlanProfile; prediction: PlanPrediction }) {
  const [chosen, setChosen] = React.useState<PlanId | null>(null)
  const [saving, setSaving] = React.useState<PlanId | null>(null)
  const [choiceError, setChoiceError] = React.useState<string | null>(null)

  const best = PLAN_INFO[prediction.plan]
  const BestIcon = best.icon
  const targets = calculateTargets({
    sex: profile.sex,
    age: profile.age,
    heightCm: profile.height_cm,
    weightKg: profile.weight_kg,
    goal: profile.goal,
    activity: profile.activity,
  })
  const restrictionLabels = RESTRICTIONS.filter((r) => profile.restrictions.includes(r.value)).map((r) => r.label)
  const dishes = filterDishes(PLAN_DISHES[prediction.plan], profile.diet, restrictionLabels).slice(0, 3)

  async function choose(plan: PlanId) {
    setSaving(plan)
    setChoiceError(null)
    try {
      await api.recordPlanChoice(prediction.prediction_id, plan)
      setChosen(plan)
    } catch (e) {
      setChoiceError(e instanceof Error ? e.message : "Couldn't save your choice. Please try again.")
    } finally {
      setSaving(null)
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      aria-labelledby="pf-result-heading"
      className="flex flex-col gap-6"
    >
      <div className="grid gap-6 md:grid-cols-5">
        {/* Recommended plan */}
        <div className="flex flex-col gap-5 border border-primary bg-card p-6 md:col-span-3">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center bg-primary text-primary-foreground">
              <BestIcon className="size-6" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold tracking-widest text-primary uppercase">Best match for you</p>
              <h2 id="pf-result-heading" className="font-serif text-2xl font-semibold text-balance text-foreground">
                {best.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {best.tagline} · from {best.price}/meal
              </p>
            </div>
          </div>

          {prediction.reasons.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Why this plan</p>
              <ul className="flex flex-col gap-2">
                {prediction.reasons.map((reason) => (
                  <li key={reason.feature} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                    {reason.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Sample dishes for you
            </p>
            {dishes.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {dishes.map((dish) => (
                  <li
                    key={dish.name}
                    className="flex items-center justify-between gap-3 bg-secondary px-4 py-3 text-sm"
                  >
                    <span className="font-medium text-secondary-foreground">{dish.name}</span>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      {dish.kcal} kcal · {dish.proteinG}g protein
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="bg-secondary px-4 py-3 text-sm text-secondary-foreground">
                None of this plan&apos;s sample dishes fit all your restrictions yet — our chefs will build a custom
                menu for you.
              </p>
            )}
          </div>
        </div>

        {/* Model output */}
        <div className="flex flex-col gap-5 border border-border bg-card p-6 md:col-span-2">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">How well each plan fits</p>
            <dl className="flex flex-col gap-3">
              {PLAN_ORDER.map((plan) => {
                const pct = Math.round(prediction.probabilities[plan] * 100)
                return (
                  <div key={plan} className="flex flex-col gap-1.5">
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <dt className={cn("text-foreground", plan === prediction.plan && "font-semibold")}>
                        {PLAN_INFO[plan].name.replace(/^The /, "")}
                      </dt>
                      <dd className="font-mono text-xs text-muted-foreground tabular-nums">{pct}%</dd>
                    </div>
                    <div className="h-2 bg-secondary" aria-hidden="true">
                      <motion.div
                        className={cn("h-full", plan === prediction.plan ? "bg-primary" : "bg-muted-foreground/40")}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )
              })}
            </dl>
          </div>

          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Your daily targets</p>
            <p className="flex items-baseline gap-1.5">
              <span className="font-serif text-3xl font-semibold text-foreground tabular-nums">
                {targets.calories.toLocaleString("en-IN")}
              </span>
              <span className="text-sm text-muted-foreground">kcal / day</span>
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {targets.proteinG}g protein · {targets.carbsG}g carbs · {targets.fatG}g fat
            </p>
          </div>
        </div>
      </div>

      {/* Choice → feedback for the model */}
      <div className="flex flex-col gap-4 border border-border bg-secondary/50 p-6">
        {chosen ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" role="status">
            <p className="flex items-center gap-2 text-sm text-foreground">
              <Check className="size-4 text-primary" aria-hidden="true" />
              Thanks! You picked <span className="font-semibold">{PLAN_INFO[chosen].name}</span>. This helps our model
              learn.
            </p>
            <Button
              nativeButton={false}
              render={
                <Link href={`/?plan=${encodeURIComponent(PLAN_INFO[chosen].waitlistName)}#waitlist`}>
                  Join the waitlist
                </Link>
              }
            />
          </div>
        ) : (
          <>
            <p className="text-sm text-foreground">Which plan would you actually choose?</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {PLAN_ORDER.map((plan) => (
                <Button
                  key={plan}
                  variant={plan === prediction.plan ? "default" : "outline"}
                  disabled={saving !== null}
                  onClick={() => choose(plan)}
                >
                  {saving === plan && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                  {PLAN_INFO[plan].name.replace(/^The /, "").replace(/ Plan$/, "")}
                </Button>
              ))}
            </div>
            {choiceError && (
              <p className="text-sm text-destructive" role="alert">
                {choiceError}
              </p>
            )}
          </>
        )}
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Recommendations come from a machine-learning model (v{prediction.model.version}) trained on simulated customer
        profiles
        {prediction.model.real_samples > 0
          ? ` plus ${prediction.model.real_samples.toLocaleString("en-IN")} real choices made on this page`
          : ""}
        . Calorie targets use the Mifflin-St Jeor equation. Not medical advice.
      </p>
    </motion.section>
  )
}

/* ------------------------------------------------------------------ */
/* Form building blocks                                                */
/* ------------------------------------------------------------------ */

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-5 border border-border bg-card p-6">
      <legend className="sr-only">{title}</legend>
      <h2 className="font-serif text-xl font-semibold text-foreground" aria-hidden="true">
        {title}
      </h2>
      {children}
    </fieldset>
  )
}

function Field({
  label,
  htmlFor,
  error,
  invalid,
  children,
}: {
  label: string
  htmlFor?: string
  error?: string
  invalid?: boolean
  children: React.ReactNode
}) {
  const labelId = React.useId()
  return (
    <div className="flex flex-col gap-2" role={htmlFor ? undefined : "group"} aria-labelledby={htmlFor ? undefined : labelId}>
      <Label id={labelId} htmlFor={htmlFor} className={cn(invalid && "text-destructive")}>
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : invalid ? (
        <p className="text-xs text-destructive">Required.</p>
      ) : null}
    </div>
  )
}

type ChoiceGroupProps<T extends string> =
  | { options: Option<T>[]; multiple?: false; value: T | null; onChange: (value: T) => void }
  | { options: Option<T>[]; multiple: true; values: T[]; onToggle: (value: T) => void }

function ChoiceGroup<T extends string>(props: ChoiceGroupProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {props.options.map((opt) => {
        const selected = props.multiple ? props.values.includes(opt.value) : props.value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={selected}
            onClick={() => (props.multiple ? props.onToggle(opt.value) : props.onChange(opt.value))}
            className={cn(
              "flex min-h-10 items-center gap-1.5 border px-3.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:border-primary/60",
            )}
          >
            {selected && props.multiple && <Check className="size-3.5" aria-hidden="true" />}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function UnitToggle<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: T[]
  value: T
  onChange: (value: T) => void
  label: string
}) {
  return (
    <div className="flex border border-border bg-secondary p-0.5" role="group" aria-label={label}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          aria-pressed={value === opt}
          onClick={() => onChange(opt)}
          className={cn(
            "min-h-9 px-3 text-sm font-medium transition-colors",
            value === opt ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

function HeightWeightFields({
  form,
  setForm,
  submitted,
}: {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  submitted: boolean
}) {
  const heightCm = toHeightCm(form.height, form.heightUnit, form.heightInches)
  const weightKg = toWeightKg(form.weight, form.weightUnit)
  const heightTouched = form.height !== "" || form.heightInches !== ""

  const changeHeightUnit = (unit: "cm" | "ft") => {
    if (unit === form.heightUnit) return
    if (heightCm === null) {
      setForm((prev) => ({ ...prev, heightUnit: unit, height: "", heightInches: "" }))
    } else if (unit === "ft") {
      const inches = Math.round(heightCm / 2.54)
      setForm((prev) => ({
        ...prev,
        heightUnit: unit,
        height: String(Math.floor(inches / 12)),
        heightInches: String(inches % 12),
      }))
    } else {
      setForm((prev) => ({ ...prev, heightUnit: unit, height: String(Math.round(heightCm)), heightInches: "" }))
    }
  }

  const changeWeightUnit = (unit: "kg" | "lbs") => {
    if (unit === form.weightUnit) return
    const weight = weightKg === null ? "" : String(Math.round(unit === "kg" ? weightKg : weightKg / 0.45359237))
    setForm((prev) => ({ ...prev, weightUnit: unit, weight }))
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field
        label="Height"
        htmlFor="pf-height"
        invalid={submitted && !heightTouched}
        error={
          heightTouched && !inRange(heightCm, LIMITS.heightCm)
            ? form.heightUnit === "cm"
              ? `${LIMITS.heightCm.min}–${LIMITS.heightCm.max} cm.`
              : "Feet and inches (0–11)."
            : undefined
        }
      >
        <div className="flex gap-2">
          {form.heightUnit === "cm" ? (
            <Input
              id="pf-height"
              type="number"
              inputMode="decimal"
              placeholder="e.g. 172"
              className="min-w-0 flex-1"
              value={form.height}
              onChange={(e) => setForm((prev) => ({ ...prev, height: e.target.value }))}
            />
          ) : (
            <>
              <Input
                id="pf-height"
                type="number"
                inputMode="numeric"
                placeholder="ft"
                aria-label="Height, feet"
                className="min-w-0 flex-1"
                value={form.height}
                onChange={(e) => setForm((prev) => ({ ...prev, height: e.target.value }))}
              />
              <Input
                type="number"
                inputMode="numeric"
                placeholder="in"
                aria-label="Height, inches"
                className="min-w-0 flex-1"
                value={form.heightInches}
                onChange={(e) => setForm((prev) => ({ ...prev, heightInches: e.target.value }))}
              />
            </>
          )}
          <UnitToggle label="Height unit" options={["cm", "ft"]} value={form.heightUnit} onChange={changeHeightUnit} />
        </div>
      </Field>
      <Field
        label="Weight"
        htmlFor="pf-weight"
        invalid={submitted && form.weight === ""}
        error={
          form.weight !== "" && !inRange(weightKg, LIMITS.weightKg)
            ? form.weightUnit === "kg"
              ? `${LIMITS.weightKg.min}–${LIMITS.weightKg.max} kg.`
              : `${Math.round(LIMITS.weightKg.min / 0.45359237)}–${Math.round(LIMITS.weightKg.max / 0.45359237)} lbs.`
            : undefined
        }
      >
        <div className="flex gap-2">
          <Input
            id="pf-weight"
            type="number"
            inputMode="decimal"
            placeholder={form.weightUnit === "kg" ? "e.g. 68" : "e.g. 150"}
            className="min-w-0 flex-1"
            value={form.weight}
            onChange={(e) => setForm((prev) => ({ ...prev, weight: e.target.value }))}
          />
          <UnitToggle label="Weight unit" options={["kg", "lbs"]} value={form.weightUnit} onChange={changeWeightUnit} />
        </div>
      </Field>
    </div>
  )
}
