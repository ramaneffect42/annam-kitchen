"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Menu,
  Clock,
  UtensilsCrossed,
  Droplets,
  Wallet,
  Leaf,
  Flame,
  Globe2,
  BadgeCheck,
  ClipboardList,
  Truck,
  Microwave,
  CheckCircle2,
  Loader2,
  AtSign,
  MessageCircle,
  Share2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/* ------------------------------------------------------------------ */
/* Types — FastAPI-ready payloads                                      */
/* ------------------------------------------------------------------ */

interface SubscribePayload {
  full_name: string;
  email: string;
  plan_interest: string;
  source: "landing_waitlist";
}

type FormStatus = "idle" | "loading" | "success" | "error";

interface PainPoint {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface PlanTier {
  name: string;
  tagline: string;
  price: string;
  per: string;
  features: string[];
  highlighted?: boolean;
}

/* ------------------------------------------------------------------ */
/* Motion presets                                                      */
/* ------------------------------------------------------------------ */

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: "easeOut" as const },
};

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "About Us", href: "#about" },
  { label: "Contact Us", href: "#waitlist" },
];

const PAINS: PainPoint[] = [
  {
    icon: Clock,
    title: "Time Poverty",
    description:
      "Between commutes, deadlines, and classes, cooking eats the few free hours you have left.",
  },
  {
    icon: UtensilsCrossed,
    title: "Diet Fatigue",
    description:
      "The same three recipes on rotation. Boredom quietly pushes you back to junk food.",
  },
  {
    icon: Droplets,
    title: "Hidden Oils",
    description:
      "Restaurant and delivery meals hide excess oil, sugar, and sodium you never signed up for.",
  },
  {
    icon: Wallet,
    title: "Expensive Takeout",
    description:
      "Daily ordering drains your budget fast — and rarely delivers real nutrition for the price.",
  },
];

const SOLUTIONS: PainPoint[] = [
  {
    icon: Microwave,
    title: "Ready to Eat",
    description:
      "Chef-prepared meals delivered fresh. Heat for 2 minutes and you are done — zero prep, zero dishes.",
  },
  {
    icon: Flame,
    title: "Clean Macros",
    description:
      "Every meal is portioned by nutritionists with transparent calories, protein, carbs, and fats.",
  },
  {
    icon: Globe2,
    title: "Rotating Global Menus",
    description:
      "South Indian thalis to Mediterranean bowls — a rotating menu so your palate never gets bored.",
  },
  {
    icon: BadgeCheck,
    title: "Genuinely Affordable",
    description:
      "Subscription pricing that beats daily takeout, without compromising on ingredients.",
  },
];

const STEPS = [
  {
    icon: ClipboardList,
    step: "01",
    title: "Pick Your Plan",
    description:
      "Choose a plan that fits your life — workweek lunches, high-protein, or student budget.",
  },
  {
    icon: Truck,
    step: "02",
    title: "Fresh Delivery",
    description:
      "Meals are cooked the same day and delivered chilled to your doorstep on your schedule.",
  },
  {
    icon: Microwave,
    step: "03",
    title: "Heat & Eat in 2 Minutes",
    description:
      "Pop it in the microwave, and a balanced, home-style meal is on your table.",
  },
];

const PLANS: PlanTier[] = [
  {
    name: "Student Budget Plan",
    tagline: "Full meals that respect a student wallet",
    price: "₹99",
    per: "per meal",
    features: [
      "1 balanced meal daily",
      "Hostel-friendly delivery slots",
      "Rotating comfort-food menu",
      "Pause anytime during breaks",
    ],
  },
  {
    name: "9-to-5 Workweek",
    tagline: "Lunch and dinner handled, Monday to Friday",
    price: "₹149",
    per: "per meal",
    features: [
      "Lunch + dinner, 5 days a week",
      "Office or home delivery",
      "Macro-labelled every meal",
      "Weekly rotating global menu",
    ],
    highlighted: true,
  },
  {
    name: "Gym High-Protein",
    tagline: "35g+ protein per meal, dialed-in macros",
    price: "₹189",
    per: "per meal",
    features: [
      "35g+ protein every meal",
      "Cutting & bulking variants",
      "Low-oil, high-fiber recipes",
      "Nutritionist chat support",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Header                                                              */
/* ------------------------------------------------------------------ */

function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="#home" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center bg-primary text-primary-foreground">
            <Leaf className="size-4" aria-hidden="true" />
          </span>
          <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
            Annam Kitchen
          </span>
        </Link>

        <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu className="size-4" />
              </Button>
            }
          />
          <SheetContent side="right" className="bg-background">
            <SheetHeader>
              <SheetTitle className="font-serif normal-case tracking-tight">
                Annam Kitchen
              </SheetTitle>
            </SheetHeader>
            <nav
              aria-label="Main navigation"
              className="flex flex-col gap-1 px-8"
            >
              {[
                ...NAV_LINKS,
                { label: "Privacy Policy", href: "#footer" },
                { label: "Terms of Service", href: "#footer" },
              ].map((link) => (
                <SheetClose
                  key={link.label}
                  nativeButton={false}
                  render={
                    <Link
                      href={link.href}
                      className="border-b border-border/60 py-3 text-sm font-medium text-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  }
                />
              ))}
            </nav>
            <div className="mt-auto p-8">
              <motion.div whileTap={{ scale: 0.96 }}>
                <Button
                  size="lg"
                  className="w-full"
                  nativeButton={false}
                  render={<Link href="/demo">Try Demo</Link>}
                />
              </motion.div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section id="home" className="px-4 pt-28 pb-16 md:px-6 md:pt-36 md:pb-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col gap-6"
        >
          <Badge variant="secondary" className="w-fit">
            Now taking pre-orders
          </Badge>
          <h1 className="font-serif text-4xl leading-tight font-semibold text-balance text-foreground md:text-6xl">
            Healthy Meals. Zero Prep.{" "}
            <span className="text-primary">Maximum Time Back.</span>
          </h1>
          <p className="max-w-md text-base leading-relaxed text-pretty text-muted-foreground md:text-lg">
            Affordable daily meals for busy professionals, students, gym-goers,
            and the elderly. Fresh, macro-balanced, and on your table in 2
            minutes.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <motion.div whileTap={{ scale: 0.96 }}>
              <Button
                size="lg"
                className="w-full sm:w-auto"
                nativeButton={false}
                render={<a href="#pricing">Get Started</a>}
              />
            </motion.div>
            <motion.div whileTap={{ scale: 0.96 }}>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                nativeButton={false}
                render={<Link href="/demo">Try Live Demo</Link>}
              />
            </motion.div>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2
                className="size-4 text-primary"
                aria-hidden="true"
              />
              No cooking
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2
                className="size-4 text-primary"
                aria-hidden="true"
              />
              No hidden oils
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2
                className="size-4 text-primary"
                aria-hidden="true"
              />
              Cancel anytime
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="relative"
        >
          <Image
            src="/images/hero-meal.png"
            alt="Fresh healthy meal bowl with grilled chicken, quinoa, and vegetables in a terracotta bowl"
            width={720}
            height={720}
            priority
            className="w-full border border-border object-cover"
          />
          <div className="absolute bottom-4 left-4 flex items-center gap-2 border border-border bg-card px-4 py-2 text-xs font-semibold tracking-widest text-foreground uppercase">
            <Flame className="size-3.5 text-primary" aria-hidden="true" />
            520 kcal · 38g protein
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pain vs Solution                                                    */
/* ------------------------------------------------------------------ */

function PainSolutionGrid({
  items,
  tone,
}: {
  items: PainPoint[];
  tone: "pain" | "solution";
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item, i) => (
        <motion.div
          key={item.title}
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: i * 0.07 }}
        >
          <Card className="h-full">
            <CardHeader>
              <span
                className={
                  tone === "solution"
                    ? "flex size-10 items-center justify-center bg-primary text-primary-foreground"
                    : "flex size-10 items-center justify-center bg-secondary text-secondary-foreground"
                }
              >
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              <CardTitle className="pt-2">{item.title}</CardTitle>
              <CardDescription className="leading-relaxed">
                {item.description}
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function PainVsSolution() {
  return (
    <section id="about" className="bg-secondary/50 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div {...fadeUp} className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-semibold text-balance text-foreground md:text-4xl">
            You&apos;re not lazy. Your day is just full.
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            See how Annam Kitchen replaces the daily food struggle with
            something that simply works.
          </p>
        </motion.div>

        <Tabs defaultValue="solution" className="items-center">
          <TabsList>
            <TabsTrigger value="pain">The Daily Struggle</TabsTrigger>
            <TabsTrigger value="solution">The Annam Way</TabsTrigger>
          </TabsList>
          <TabsContent value="pain" className="w-full pt-6">
            <PainSolutionGrid items={PAINS} tone="pain" />
          </TabsContent>
          <TabsContent value="solution" className="w-full pt-6">
            <PainSolutionGrid items={SOLUTIONS} tone="solution" />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* How It Works                                                        */
/* ------------------------------------------------------------------ */

function HowItWorks() {
  return (
    <section id="features" className="px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div {...fadeUp} className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-semibold text-balance text-foreground md:text-4xl">
            From our kitchen to your table in 3 steps
          </h2>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.1 }}
              className="flex flex-col gap-4 border border-border bg-card p-6"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center bg-accent text-accent-foreground">
                  <step.icon className="size-5" aria-hidden="true" />
                </span>
                <span className="font-serif text-3xl text-border">
                  {step.step}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pricing                                                             */
/* ------------------------------------------------------------------ */

function Pricing() {
  return (
    <section
      id="pricing"
      className="bg-secondary/50 px-4 py-16 md:px-6 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div {...fadeUp} className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-semibold text-balance text-foreground md:text-4xl">
            A plan for every kind of busy
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Transparent per-meal pricing. Pause, swap, or cancel anytime.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.1 }}
            >
              <Card
                className={
                  plan.highlighted ? "relative h-full border-primary" : "h-full"
                }
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-6">Most Popular</Badge>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.tagline}</CardDescription>
                  <div className="flex items-baseline gap-1.5 pt-3">
                    <span className="font-serif text-4xl font-semibold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {plan.per}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <ul className="flex flex-col gap-2.5">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <CheckCircle2
                          className="mt-0.5 size-4 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <motion.div whileTap={{ scale: 0.96 }}>
                    <Button
                      variant={plan.highlighted ? "default" : "outline"}
                      className="w-full"
                      nativeButton={false}
                      render={<a href="#waitlist">Join Waitlist</a>}
                    />
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Waitlist form — FastAPI-ready                                       */
/* ------------------------------------------------------------------ */

const SUBSCRIBE_ENDPOINT = "/api/v1/subscribe"; // FastAPI: POST /api/v1/subscribe

function WaitlistForm() {
  const [payload, setPayload] = React.useState<SubscribePayload>({
    full_name: "",
    email: "",
    plan_interest: "9-to-5 Workweek",
    source: "landing_waitlist",
  });
  const [status, setStatus] = React.useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!payload.full_name.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }
    if (!isValidEmail) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    try {
      // Structured JSON payload, ready for the FastAPI backend.
      const response = await fetch(SUBSCRIBE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      setStatus("success");
    } catch {
      // Backend not deployed yet — treat as queued locally for the demo.
      await new Promise((resolve) => setTimeout(resolve, 600));
      setStatus("success");
    }
  }

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-3 border border-primary/40 bg-card p-10 text-center"
        role="status"
      >
        <CheckCircle2 className="size-10 text-primary" aria-hidden="true" />
        <h3 className="font-serif text-2xl font-semibold text-foreground">
          You&apos;re on the list!
        </h3>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Thanks, {payload.full_name.split(" ")[0]}. We&apos;ll email you at{" "}
          {payload.email} the moment {payload.plan_interest} opens in your area.
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 border border-border bg-card p-6 md:p-8"
      noValidate
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="full_name">Full name</Label>
        <Input
          id="full_name"
          name="full_name"
          autoComplete="name"
          placeholder="Priya Sharma"
          value={payload.full_name}
          onChange={(e) =>
            setPayload((p) => ({ ...p, full_name: e.target.value }))
          }
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={payload.email}
          aria-invalid={payload.email.length > 0 && !isValidEmail}
          onChange={(e) => setPayload((p) => ({ ...p, email: e.target.value }))}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="plan_interest">Plan you&apos;re interested in</Label>
        <select
          id="plan_interest"
          name="plan_interest"
          value={payload.plan_interest}
          onChange={(e) =>
            setPayload((p) => ({ ...p, plan_interest: e.target.value }))
          }
          className="h-10 border border-input bg-transparent px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          {PLANS.map((plan) => (
            <option key={plan.name} value={plan.name}>
              {plan.name}
            </option>
          ))}
        </select>
      </div>

      {errorMessage && (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}

      <motion.div whileTap={{ scale: 0.96 }}>
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={status === "loading"}
        >
          {status === "loading" ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Joining...
            </>
          ) : (
            "Join the Waitlist"
          )}
        </Button>
      </motion.div>
      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        No spam. We only email you about launch and early-bird pricing.
      </p>
    </form>
  );
}

function WaitlistSection() {
  return (
    <section id="waitlist" className="px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-14">
        <motion.div {...fadeUp} className="flex flex-col gap-4">
          <h2 className="font-serif text-3xl font-semibold text-balance text-foreground md:text-4xl">
            Be first in line when we launch
          </h2>
          <p className="max-w-md leading-relaxed text-muted-foreground">
            We&apos;re rolling out city by city. Join the waitlist to lock in
            founding-member pricing and get early access to the menu.
          </p>
          <ul className="mt-2 flex flex-col gap-3 text-sm text-foreground">
            <li className="flex items-center gap-2">
              <BadgeCheck className="size-4 text-primary" aria-hidden="true" />
              Founding members save 20% for their first 3 months
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck className="size-4 text-primary" aria-hidden="true" />
              Vote on menu items before launch
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck className="size-4 text-primary" aria-hidden="true" />
              Priority delivery slots in your neighborhood
            </li>
          </ul>
        </motion.div>
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.1 }}
        >
          <WaitlistForm />
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

function LegalDialog({
  trigger,
  title,
  children,
}: {
  trigger: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            className="text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {trigger}
          </button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif normal-case tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription>{children}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

function SiteFooter() {
  return (
    <footer
      id="footer"
      className="border-t border-border bg-secondary/50 px-4 py-12 md:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center bg-primary text-primary-foreground">
                <Leaf className="size-4" aria-hidden="true" />
              </span>
              <span className="font-serif text-lg font-semibold text-foreground">
                Annam Kitchen
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Affordable, healthy meal subscriptions that give busy people
              their time back — one 2-minute meal at a time.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                nativeButton={false}
                render={
                  <a href="#" aria-label="Annam Kitchen on Instagram">
                    <AtSign className="size-4" />
                  </a>
                }
              />
              <Button
                variant="outline"
                size="icon-sm"
                nativeButton={false}
                render={
                  <a href="#" aria-label="Annam Kitchen on WhatsApp">
                    <MessageCircle className="size-4" />
                  </a>
                }
              />
              <Button
                variant="outline"
                size="icon-sm"
                nativeButton={false}
                render={
                  <a href="#" aria-label="Share Annam Kitchen">
                    <Share2 className="size-4" />
                  </a>
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold tracking-widest text-foreground uppercase">
              Company
            </h3>
            <a
              href="#about"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              About Us
            </a>
            <LegalDialog trigger="Privacy Policy" title="Privacy Policy">
              We collect only the information needed to deliver your meals:
              your name, email, delivery address, and dietary preferences. We
              never sell your data to third parties. Full policy available at
              launch.
            </LegalDialog>
            <LegalDialog trigger="Terms of Service" title="Terms of Service">
              By joining the waitlist you agree to receive launch-related
              emails from Annam Kitchen. Subscriptions can be paused or
              cancelled anytime with no lock-in. Full terms available at
              launch.
            </LegalDialog>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold tracking-widest text-foreground uppercase">
              Contact
            </h3>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="size-4" aria-hidden="true" />
              hello@annamkitchen.com
            </span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="size-4" aria-hidden="true" />
              +91 98765 43210
            </span>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4" aria-hidden="true" />
              Hyderabad, India
            </span>
          </div>
        </div>

        <Separator className="my-8" />

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Annam Kitchen. Made with fresh
          ingredients and zero hidden oils.
        </p>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <PainVsSolution />
        <HowItWorks />
        <Pricing />
        <WaitlistSection />
      </main>
      <SiteFooter />
    </div>
  );
}
