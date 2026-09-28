"use client";

import { useState, useCallback } from "react";
import { CheckCircle, XCircle, AlertTriangle, Zap, RotateCcw } from "lucide-react";

const CWV_THRESHOLDS = {
    lcp:  { good: 2500,  needs: 4000,  unit: "ms",    label: "LCP",  name: "Largest Contentful Paint" },
    inp:  { good: 200,   needs: 500,   unit: "ms",    label: "INP",  name: "Interaction to Next Paint" },
    cls:  { good: 0.1,   needs: 0.25,  unit: "",      label: "CLS",  name: "Cumulative Layout Shift" },
    fcp:  { good: 1800,  needs: 3000,  unit: "ms",    label: "FCP",  name: "First Contentful Paint" },
    ttfb: { good: 800,   needs: 1800,  unit: "ms",    label: "TTFB", name: "Time to First Byte" },
};

const JS_BUDGET_GUIDANCE = [
    { max: 100,  label: "Excellent",   color: "text-green-500",  bg: "bg-green-500/10",  border: "border-green-500/30" },
    { max: 200,  label: "Good",        color: "text-blue-500",   bg: "bg-blue-500/10",   border: "border-blue-500/30" },
    { max: 350,  label: "Borderline",  color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
    { max: 9999, label: "Over Budget", color: "text-red-500",    bg: "bg-red-500/10",    border: "border-red-500/30" },
];

function getRating(metric, value) {
    const t = CWV_THRESHOLDS[metric];
    if (value === "" || value === null) return null;
    const n = parseFloat(value);
    if (isNaN(n)) return null;
    if (n <= t.good)  return "good";
    if (n <= t.needs) return "needs";
    return "poor";
}

function getJSBudgetInfo(kb) {
    const n = parseFloat(kb);
    if (isNaN(n)) return null;
    return JS_BUDGET_GUIDANCE.find(g => n <= g.max) || JS_BUDGET_GUIDANCE[JS_BUDGET_GUIDANCE.length - 1];
}

function RatingBadge({ rating }) {
    if (!rating) return null;
    const map = {
        good:  { icon: CheckCircle,   label: "Good",        cls: "text-green-500" },
        needs: { icon: AlertTriangle, label: "Needs Work",  cls: "text-yellow-500" },
        poor:  { icon: XCircle,       label: "Poor",        cls: "text-red-500" },
    };
    const { icon: Icon, label, cls } = map[rating];
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${cls}`}>
            <Icon className="w-3.5 h-3.5" /> {label}
        </span>
    );
}

function MetricInput({ id, value, onChange, threshold }) {
    const rating = getRating(id, value);
    const t = threshold;

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
                <label htmlFor={id} className="text-sm font-semibold text-foreground">
                    {t.label}
                    <span className="ml-1.5 text-xs text-muted-foreground font-normal">({t.name})</span>
                </label>
                <RatingBadge rating={rating} />
            </div>
            <div className="relative">
                <input
                    id={id}
                    type="number"
                    min="0"
                    step={t.unit === "" ? "0.01" : "10"}
                    placeholder={`e.g. ${t.good}${t.unit}`}
                    value={value}
                    onChange={e => onChange(id, e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-12 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                />
                {t.unit && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                        {t.unit}
                    </span>
                )}
            </div>
            <p className="text-[11px] text-muted-foreground">
                Good: ≤{t.good}{t.unit} · Needs work: ≤{t.needs}{t.unit} · Poor: &gt;{t.needs}{t.unit}
            </p>
        </div>
    );
}

function ScoreGauge({ score }) {
    const color = score >= 90 ? "#22c55e" : score >= 50 ? "#eab308" : "#ef4444";
    const label = score >= 90 ? "Good" : score >= 50 ? "Needs Work" : "Poor";
    const circumference = 2 * Math.PI * 36;
    const strokeDash = (score / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-24 h-24">
            <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90 absolute inset-0">
                <circle cx="48" cy="48" r="36" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
                <circle
                    cx="48" cy="48" r="36" fill="none"
                    stroke={color} strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${strokeDash} ${circumference}`}
                    style={{ transition: "stroke-dasharray 0.6s ease" }}
                />
            </svg>
            <div className="relative flex flex-col items-center leading-tight">
                <span className="text-2xl font-black" style={{ color }}>{score}</span>
                <span className="text-[10px] font-semibold" style={{ color }}>{label}</span>
            </div>
        </div>
    );
}

function getRecommendations(values, jsBudget) {
    const tips = [];
    if (getRating("lcp", values.lcp) !== "good") {
        tips.push({ metric: "LCP", tip: "Preload your largest image with <link rel=\"preload\">. Use a CDN. Consider SSR or SSG to eliminate server latency." });
    }
    if (getRating("inp", values.inp) !== "good") {
        tips.push({ metric: "INP", tip: "Break up long tasks with scheduler.yield() or setTimeout(0). Avoid heavy event handlers — debounce input and defer non-critical updates." });
    }
    if (getRating("cls", values.cls) !== "good") {
        tips.push({ metric: "CLS", tip: "Always set explicit width/height on images and embeds. Reserve space for ads and dynamically injected content using aspect-ratio CSS." });
    }
    if (getRating("fcp", values.fcp) !== "good") {
        tips.push({ metric: "FCP", tip: "Inline your critical CSS. Remove render-blocking scripts. Ensure TTFB is fast — FCP can never beat TTFB." });
    }
    if (getRating("ttfb", values.ttfb) !== "good") {
        tips.push({ metric: "TTFB", tip: "Enable HTTP/2 or HTTP/3. Add edge caching (Vercel Edge, Cloudflare). Reduce server processing time — check database query times." });
    }
    const jsKB = parseFloat(jsBudget);
    if (!isNaN(jsKB) && jsKB > 200) {
        tips.push({ metric: "JS Bundle", tip: `${jsKB}KB is over the recommended 200KB. Audit with 'npx bundlephobia' or webpack-bundle-analyzer. Code-split at route boundaries. Replace heavy libs (moment.js → date-fns, lodash → native).` });
    }
    return tips;
}

const DEFAULTS = { lcp: "", inp: "", cls: "", fcp: "", ttfb: "" };

export default function PerformanceBudgetCalculator() {
    const [values, setValues] = useState(DEFAULTS);
    const [jsBudget, setJsBudget] = useState("");

    const handleChange = useCallback((id, val) => {
        setValues(prev => ({ ...prev, [id]: val }));
    }, []);

    const handleReset = () => {
        setValues(DEFAULTS);
        setJsBudget("");
    };

    const ratings = Object.keys(CWV_THRESHOLDS).map(id => getRating(id, values[id])).filter(Boolean);
    const score = ratings.length === 0 ? null : Math.round(
        (ratings.filter(r => r === "good").length * 100 +
         ratings.filter(r => r === "needs").length * 50) / ratings.length
    );

    const recommendations = getRecommendations(values, jsBudget);
    const jsBudgetInfo = getJSBudgetInfo(jsBudget);
    const hasAnyValue = Object.values(values).some(v => v !== "") || jsBudget !== "";

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                            <Zap className="w-5 h-5 text-primary" />
                        </div>
                        <h1 className="text-2xl font-black text-foreground">Core Web Vitals Checker</h1>
                    </div>
                    <p className="text-muted-foreground text-sm max-w-lg">
                        Enter your site's measured metrics from Chrome DevTools, PageSpeed Insights, or CrUX data.
                        Get an instant pass/fail assessment against Google's thresholds and specific fix recommendations.
                    </p>
                </div>
                {hasAnyValue && (
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted transition-all"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reset
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: inputs */}
                <div className="flex flex-col gap-6">
                    <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-5">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Core Web Vitals</h2>
                        {Object.entries(CWV_THRESHOLDS).map(([id, t]) => (
                            <MetricInput key={id} id={id} value={values[id]} onChange={handleChange} threshold={t} />
                        ))}
                    </div>

                    {/* JS Budget */}
                    <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">JavaScript Budget</h2>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="jsBudget" className="text-sm font-semibold text-foreground">
                                Total JS (parsed + executed)
                            </label>
                            <div className="relative">
                                <input
                                    id="jsBudget"
                                    type="number"
                                    min="0"
                                    step="10"
                                    placeholder="e.g. 180"
                                    value={jsBudget}
                                    onChange={e => setJsBudget(e.target.value)}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-12 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">KB</span>
                            </div>
                            {jsBudgetInfo && (
                                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border w-fit ${jsBudgetInfo.color} ${jsBudgetInfo.bg} ${jsBudgetInfo.border}`}>
                                    {jsBudgetInfo.label}
                                </span>
                            )}
                            <p className="text-[11px] text-muted-foreground">
                                Budget: ≤100KB excellent · ≤200KB good · ≤350KB borderline · &gt;350KB over budget
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right: results */}
                <div className="flex flex-col gap-6">
                    {/* Score */}
                    {score !== null && (
                        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col items-center gap-3">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground self-start">Overall Score</h2>
                            <ScoreGauge score={score} />
                            <p className="text-xs text-muted-foreground text-center">
                                Based on {ratings.length} of {Object.keys(CWV_THRESHOLDS).length} metrics entered
                            </p>
                        </div>
                    )}

                    {/* Metric summary */}
                    {hasAnyValue && (
                        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-3">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Metric Summary</h2>
                            {Object.entries(CWV_THRESHOLDS).map(([id, t]) => {
                                const rating = getRating(id, values[id]);
                                if (!rating) return null;
                                const colors = { good: "bg-green-500", needs: "bg-yellow-500", poor: "bg-red-500" };
                                return (
                                    <div key={id} className="flex items-center gap-3 text-sm">
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[rating]}`} />
                                        <span className="font-semibold w-12">{t.label}</span>
                                        <span className="font-mono text-muted-foreground">
                                            {values[id]}{t.unit}
                                        </span>
                                        <RatingBadge rating={rating} />
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Recommendations */}
                    {recommendations.length > 0 && (
                        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-4">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Fix Recommendations</h2>
                            {recommendations.map((r, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <span className="text-xs font-bold text-primary uppercase tracking-wide">{r.metric}</span>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{r.tip}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {!hasAnyValue && (
                        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 flex flex-col items-center gap-3 text-center">
                            <Zap className="w-8 h-8 text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">
                                Enter your metrics from{" "}
                                <a href="https://pagespeed.web.dev" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
                                    PageSpeed Insights
                                </a>
                                {" "}or Chrome DevTools → Lighthouse to see your score and recommendations.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
                Thresholds sourced from{" "}
                <a href="https://web.dev/vitals" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
                    web.dev/vitals
                </a>
                . JS budget based on Alex Russell's 2023 mobile-first guidance.
            </p>
        </div>
    );
}
