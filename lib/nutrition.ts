export type Sex = "male" | "female" | "unspecified"
export type Goal = "weight-loss" | "muscle" | "wellness"
export type Activity = "sedentary" | "moderate" | "very-active"

export const LIMITS = {
  age: { min: 13, max: 100 },
  heightCm: { min: 120, max: 230 },
  weightKg: { min: 30, max: 250 },
} as const

const ACTIVITY_MULTIPLIER: Record<Activity, number> = {
  sedentary: 1.2,
  moderate: 1.55,
  "very-active": 1.725,
}

const GOAL_CALORIE_FACTOR: Record<Goal, number> = {
  "weight-loss": 0.8,
  muscle: 1.1,
  wellness: 1,
}

const PROTEIN_G_PER_KG: Record<Goal, number> = {
  "weight-loss": 1.6,
  muscle: 1.8,
  wellness: 1.2,
}

// Mifflin-St Jeor sex constant; "unspecified" uses the midpoint.
const SEX_CONSTANT: Record<Sex, number> = {
  male: 5,
  female: -161,
  unspecified: -78,
}

const MIN_CALORIES = 1200

function toNumber(value: string): number | null {
  if (value.trim() === "") return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export function toHeightCm(height: string, unit: "cm" | "ft", inches = ""): number | null {
  const main = toNumber(height)
  if (main === null) return null
  if (unit === "cm") return main
  const extra = inches.trim() === "" ? 0 : toNumber(inches)
  if (extra === null || extra < 0 || extra >= 12) return null
  return (main * 12 + extra) * 2.54
}

export function toWeightKg(weight: string, unit: "kg" | "lbs"): number | null {
  const n = toNumber(weight)
  if (n === null) return null
  return unit === "kg" ? n : n * 0.45359237
}

export function toAge(age: string): number | null {
  const n = toNumber(age)
  return n !== null && Number.isInteger(n) ? n : null
}

export function inRange(value: number | null, range: { min: number; max: number }): boolean {
  return value !== null && value >= range.min && value <= range.max
}

export type DailyTargets = {
  bmr: number
  tdee: number
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

export function calculateTargets(input: {
  sex: Sex
  age: number
  heightCm: number
  weightKg: number
  goal: Goal
  activity: Activity
}): DailyTargets {
  const { sex, age, heightCm, weightKg, goal, activity } = input

  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + SEX_CONSTANT[sex]
  const tdee = bmr * ACTIVITY_MULTIPLIER[activity]
  const calories = Math.max(MIN_CALORIES, Math.round((tdee * GOAL_CALORIE_FACTOR[goal]) / 10) * 10)

  // Protein by body weight, capped at 35% of calories so it stays sensible at high body weights.
  const proteinG = Math.round(Math.min(PROTEIN_G_PER_KG[goal] * weightKg, (calories * 0.35) / 4))
  const fatG = Math.round((calories * 0.25) / 9)
  const carbsG = Math.round((calories - proteinG * 4 - fatG * 9) / 4)

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calories,
    proteinG,
    carbsG,
    fatG,
  }
}
