"use client";

import { FormEvent, useMemo, useState } from "react";


declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type StoryDraft = {
  name: string;
  age: string;
  hobby: string;
  favoriteFood: string;
  artStyle: string;
};

const steps = [
  "Name",
  "Age",
  "Hobby",
  "Favorite Food",
  "Art Style",
  "Story Tone",
  "Goal",
  "Review"
];

export default function CreatePage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState<string[]>([]);
  const [seed, setSeed] = useState("");
  const [visualDNA, setVisualDNA] = useState("");
  const [form, setForm] = useState<StoryDraft>({
    name: "",
    age: "",
    hobby: "",
    favoriteFood: "",
    artStyle: ""
  });

  const completion = useMemo(() => Math.round((step / 8) * 100), [step]);

  async function onBuyStory() {
    const response = await fetch("/storybook/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 19900 })
    });

    const data = await response.json();
    if (!window.Razorpay || !data.orderId) return;

    const razorpay = new window.Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      order_id: data.orderId,
      amount: data.amount,
      currency: data.currency,
      name: "Paraspect Storybook",
      description: "10-page personalized story",
      prefill: { name: form.name }
    });

    razorpay.open();
  }

  async function onGenerate(event: FormEvent) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/storybook/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      setStory(data.pages ?? []);
      setVisualDNA(data.visualDNA ?? "");
      setSeed(data.seed ?? "");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
          <span>Step {step} of 8</span>
          <span>{completion}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100">
          <div className="h-2 rounded-full bg-paraspect-sky" style={{ width: `${completion}%` }} />
        </div>
        <p className="mt-3 text-sm font-medium text-slate-700">Current: {steps[step - 1]}</p>
      </div>

      <form onSubmit={onGenerate} className="grid gap-4 rounded-2xl bg-white p-5 shadow">
        <input className="rounded-lg border p-3" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="rounded-lg border p-3" placeholder="Age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required />
        <input className="rounded-lg border p-3" placeholder="Hobby" value={form.hobby} onChange={(e) => setForm({ ...form, hobby: e.target.value })} required />
        <input className="rounded-lg border p-3" placeholder="Favorite Food" value={form.favoriteFood} onChange={(e) => setForm({ ...form, favoriteFood: e.target.value })} required />
        <input className="rounded-lg border p-3" placeholder="Art Style" value={form.artStyle} onChange={(e) => setForm({ ...form, artStyle: e.target.value })} required />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="rounded-full border px-4 py-2 text-sm"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(8, s + 1))}
            className="rounded-full border px-4 py-2 text-sm"
          >
            Next
          </button>
          <button type="submit" className="rounded-full bg-paraspect-teal px-4 py-2 text-sm font-semibold text-white" disabled={loading}>
            {loading ? "Generating..." : "Generate 10-Page Story"}
          </button>
        </div>
      </form>

      {story.length > 0 && (
        <section className="rounded-2xl bg-white p-5 shadow">
          <h2 className="text-xl font-bold">Generated Story</h2>
          <p className="mt-1 text-sm text-slate-500">Visual DNA: {visualDNA} · Seed: {seed}</p>
          <ol className="mt-4 space-y-3">
            {story.map((page, idx) => (
              <li key={idx} className="rounded-lg bg-slate-50 p-3 text-sm">
                <strong>Page {idx + 1}:</strong> {page}
              </li>
            ))}
          </ol>
        <div className="mt-4">
            <button
              type="button"
              onClick={onBuyStory}
              className="rounded-full bg-paraspect-amber px-5 py-2 text-sm font-semibold text-white"
            >
              Buy Story
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
