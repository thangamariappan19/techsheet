/**
 * Dedup script: identifies near-duplicate blog posts by topic cluster
 * and marks all but the best keeper as isPublished: false.
 *
 * Run: node scripts/dedup-posts.js
 * Add --dry-run to preview without writing.
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

// Topic clusters: each entry = list of filename substrings that belong to the same topic.
// Within each cluster, KEEP the last item (most specific / unique), mark the rest isPublished: false.
// You can reorder items inside a cluster to change which one is kept.
const CLUSTERS = [
    // Hydration / resumability / hydration cliff
    {
        label: 'Hydration & Resumability',
        keep: 1,
        patterns: [
            'hydration-cliff',
            'hydration-gap',
            'hydration-hump',
            'beyond-hydration',
            'isomorphic-signal-bridge',
            'javascript-double-tax',
            'mastering-resumability',
        ],
    },
    // Agentic shift AI
    {
        label: 'Agentic Shift AI',
        keep: 1,
        patterns: [
            'the-agentic-shift',
            'agentic-shift-how',
            'rise-of-agentic-ai',
            'beyond-code-generation-how-agentic',
        ],
    },
    // AI reasoning era
    {
        label: 'AI Reasoning Era',
        keep: 1,
        patterns: [
            'the-ai-reasoning-era',
            'era-of-reasoning',
            'the-shift-to-agentic-reasoning',
        ],
    },
    // AI tsunami / arms race / paradigm shift (AI news analysis near-duplicates)
    {
        label: 'AI News Analysis Roundup',
        keep: 1,
        patterns: [
            'the-ai-tsunami',
            'the-ai-arms-race',
            'the-ai-paradigm-shift',
            'the-ai-frontier',
            'the-ai-agent-era',
            'ai-engineering-is-the-new-frontend',
            'the-ai-paradigm',
        ],
    },
    // Signals / fine-grained reactivity / virtual DOM
    {
        label: 'Signals & Fine-Grained Reactivity',
        keep: 1,
        patterns: [
            'beyond-the-virtual-dom-a-deep-dive-into-fine-grained',
            'mastering-signals',
            'beyond-the-hook-a-technical-deep-dive-into-signal',
            'beyond-the-virtual-dom-mastering-the-signal',
        ],
    },
    // Architecture of scale / don't rot / longevity
    {
        label: 'Architecture of Scale / Longevity',
        keep: 1,
        patterns: [
            'the-architecture-of-scale-building',
            'the-architecture-of-longevity',
            'the-architecture-of-scale-why',
            'the-architecture-of-resilience',
            'architecting-for-scale-how-to-transition',
            'the-architect-s-dilemma-building-scale',
            'the-architect-s-dilemma-building-scalable',
            'architecture-debt-trap-building',
            'architecture-debt-trap-how',
        ],
    },
    // Micro-frontends
    {
        label: 'Micro-Frontends',
        keep: 2,
        patterns: [
            'beyond-micro-frontends-the-architect',
            'beyond-micro-frontends-building',
            'deconstructing-the-monolith',
            'the-distributed-frontend-why-micro',
            'beyond-the-hype-a-pragmatic-guide-to-micro-frontends',
            'death-of-the-monolithic-spa',
        ],
    },
    // Local-first / CRDT
    {
        label: 'Local-First & CRDTs',
        keep: 1,
        patterns: [
            'beyond-state-managers-architecting-local-first',
            'beyond-apis-architecting-deterministic-web-apps-with-local',
            'beyond-the-cloud-orchestrating-deterministic-local',
            'beyond-the-request-response-cycle-building-instant-local',
            'local-first-architecture-implementing-electricsql',
            'beyond-the-distributed-cache-mastering-the-sidecar',
            'beyond-the-cloud-orchestrating',
        ],
    },
    // DST (Deterministic Simulation Testing)
    {
        label: 'Deterministic Simulation Testing',
        keep: 1,
        patterns: [
            'escaping-the-heisenbug',
            'beyond-unit-tests-mastering-deterministic-simulation',
            'beyond-chaos-architecting-distributed-systems-with-deterministic',
        ],
    },
    // WASM / containers
    {
        label: 'WASM & Containers',
        keep: 1,
        patterns: [
            'beyond-containers-building-cellular',
            'beyond-containers-architecting-polyglot',
            'beyond-the-cold-start-architecting-zero-scale',
        ],
    },
    // Island architecture
    {
        label: 'Island Architecture',
        keep: 1,
        patterns: [
            'mastering-island-architecture',
            'mastering-the-island-architecture',
        ],
    },
    // React server components + Vercel AI SDK
    {
        label: 'React Server Components',
        keep: 1,
        patterns: [
            'mastering-react-server-components',
            'ai-native-front-end-architecture-mastering-vercel',
            'beyond-the-hydration-gap-architecting-high-performance',
        ],
    },
    // Frontend architecture playbook / manifesto / blueprint / resilient
    {
        label: 'Frontend Architecture Playbook',
        keep: 1,
        patterns: [
            'the-frontend-architecture-playbook',
            'the-frontend-architect-s-manifesto',
            'the-architect-s-blueprint',
            'architecture-as-a-product',
            'beyond-the-framework-a-senior-architect',
            'architecting-the-un-breakable-frontend',
        ],
    },
    // "Beyond the hype" architecture posts
    {
        label: 'Beyond the Hype Architecture',
        keep: 1,
        patterns: [
            'beyond-the-hype-architecting-scale-proof',
            'frontend-architecture-beyond-the-hype',
        ],
    },
];

function setPublished(filePath, value) {
    let content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes('isPublished:')) {
        content = content.replace(/^isPublished:\s*.+$/m, `isPublished: ${value}`);
    } else {
        // insert before closing --- of frontmatter
        content = content.replace(/^---\n([\s\S]*?)\n---/, (_, body) => `---\n${body}\nisPublished: ${value}\n---`);
    }
    if (!DRY_RUN) fs.writeFileSync(filePath, content, 'utf-8');
}

function main() {
    const allFiles = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md')).sort();

    let totalHidden = 0;
    let totalKept = 0;

    for (const cluster of CLUSTERS) {
        const matched = allFiles.filter(f =>
            cluster.patterns.some(p => f.includes(p))
        ).sort(); // chronological order

        if (matched.length <= cluster.keep) {
            console.log(`✅ [${cluster.label}] Only ${matched.length} post(s) — no dedup needed`);
            continue;
        }

        // Keep the LAST N (most recent = likely most refined), hide the rest
        const toHide = matched.slice(0, matched.length - cluster.keep);
        const toKeep = matched.slice(matched.length - cluster.keep);

        console.log(`\n📦 [${cluster.label}] ${matched.length} posts → keeping ${cluster.keep}, hiding ${toHide.length}`);
        for (const f of toKeep) {
            console.log(`  ✅ KEEP: ${f}`);
            setPublished(path.join(CONTENT_DIR, f), true);
            totalKept++;
        }
        for (const f of toHide) {
            console.log(`  🚫 HIDE: ${f}`);
            setPublished(path.join(CONTENT_DIR, f), false);
            totalHidden++;
        }
    }

    console.log(`\n${'─'.repeat(60)}`);
    console.log(`Summary: ${totalHidden} posts hidden, ${totalKept} posts kept`);
    if (DRY_RUN) console.log('(DRY RUN — no files were modified)');
}

main();
