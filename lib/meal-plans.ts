export type Diet = "vegetarian" | "non-vegetarian" | "eggetarian" | "vegan"

/** What a dish contains, from most to least restrictive. */
export type DishType = "vegan" | "vegetarian" | "egg" | "non-veg"

/** Tags a dish carries that a restriction can rule out. */
export type DishTag = "dairy" | "gluten" | "nuts" | "soy" | "high-sodium"

export type Dish = {
  name: string
  kcal: number
  proteinG: number
  type: DishType
  tags: DishTag[]
}

export type PlanId = "workweek" | "macro-fit" | "essential"

const ALLOWED_TYPES: Record<Diet, DishType[]> = {
  vegan: ["vegan"],
  vegetarian: ["vegan", "vegetarian"],
  eggetarian: ["vegan", "vegetarian", "egg"],
  "non-vegetarian": ["vegan", "vegetarian", "egg", "non-veg"],
}

/** Restriction labels from the onboarding wizard → the dish tag they exclude. */
export const RESTRICTION_TAG: Record<string, DishTag> = {
  "Dairy-Free": "dairy",
  "Gluten-Free": "gluten",
  "Nut-Free": "nuts",
  "Soy-Free": "soy",
  "Low Sodium": "high-sodium",
}

export const PLAN_DISHES: Record<PlanId, Dish[]> = {
  workweek: [
    { name: "Herb-Grilled Fish & Millet Pulao", kcal: 480, proteinG: 34, type: "non-veg", tags: [] },
    { name: "Chicken Curry with Jeera Rice", kcal: 520, proteinG: 32, type: "non-veg", tags: ["dairy"] },
    { name: "Paneer Tikka Quinoa Bowl", kcal: 520, proteinG: 28, type: "vegetarian", tags: ["dairy"] },
    { name: "Rajma Power Bowl with Brown Rice", kcal: 540, proteinG: 22, type: "vegan", tags: [] },
    { name: "Egg Curry with Brown Rice", kcal: 490, proteinG: 24, type: "egg", tags: [] },
    { name: "Veg Kofta & Millet Pulao", kcal: 470, proteinG: 20, type: "vegetarian", tags: ["dairy", "nuts"] },
    { name: "Chana Masala with Phulka Rotis", kcal: 500, proteinG: 19, type: "vegan", tags: ["gluten"] },
    { name: "Tofu & Veg Stir-Fry with Millet", kcal: 460, proteinG: 26, type: "vegan", tags: ["soy"] },
  ],
  "macro-fit": [
    { name: "Grilled Chicken Macro Plate", kcal: 610, proteinG: 46, type: "non-veg", tags: [] },
    { name: "Egg-White Bhurji Wrap", kcal: 430, proteinG: 32, type: "egg", tags: ["gluten"] },
    { name: "Paneer Bhurji Protein Wrap", kcal: 450, proteinG: 30, type: "vegetarian", tags: ["dairy", "gluten"] },
    { name: "High-Protein Soya Tikka Plate", kcal: 580, proteinG: 42, type: "vegan", tags: ["soy"] },
    { name: "Post-Workout Peanut Chikki Shake", kcal: 280, proteinG: 24, type: "vegetarian", tags: ["dairy", "nuts"] },
    { name: "Grilled Fish & Sweet Potato Plate", kcal: 520, proteinG: 40, type: "non-veg", tags: [] },
    { name: "Sprouted Moong & Chickpea Protein Bowl", kcal: 490, proteinG: 26, type: "vegan", tags: [] },
    { name: "Tofu Tikka & Quinoa Plate", kcal: 540, proteinG: 36, type: "vegan", tags: ["soy"] },
  ],
  essential: [
    { name: "Dal Tadka, Jeera Rice & Salad", kcal: 460, proteinG: 18, type: "vegetarian", tags: ["dairy"] },
    { name: "Egg Curry with Phulka Rotis", kcal: 440, proteinG: 22, type: "egg", tags: ["gluten"] },
    { name: "Curd Rice with Pomegranate", kcal: 380, proteinG: 12, type: "vegetarian", tags: ["dairy"] },
    { name: "Veg Khichdi with Ghee & Papad", kcal: 410, proteinG: 14, type: "vegetarian", tags: ["dairy", "high-sodium"] },
    { name: "Sambar Rice with Beans Poriyal", kcal: 420, proteinG: 13, type: "vegan", tags: [] },
    { name: "Chicken Stew with Appam", kcal: 470, proteinG: 28, type: "non-veg", tags: [] },
    { name: "Lemon Rice & Chana Sundal", kcal: 400, proteinG: 14, type: "vegan", tags: ["nuts"] },
    { name: "Ragi Mudde with Mixed Veg Saaru", kcal: 390, proteinG: 12, type: "vegan", tags: [] },
  ],
}

/** Dishes that fit the diet and avoid every selected restriction. */
export function filterDishes(dishes: Dish[], diet: Diet | null, restrictions: string[]): Dish[] {
  const allowed = ALLOWED_TYPES[diet ?? "vegan"]
  const excluded = restrictions.map((r) => RESTRICTION_TAG[r]).filter(Boolean)
  return dishes.filter(
    (dish) => allowed.includes(dish.type) && !dish.tags.some((tag) => excluded.includes(tag)),
  )
}

export function recommendPlan(goal: string | null, age: number | null): PlanId {
  if (goal === "muscle") return "macro-fit"
  if (age !== null && (age >= 60 || age <= 22)) return "essential"
  return "workweek"
}
