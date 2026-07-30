import { createAgentTools } from "./tools.js";
import { fileSelectionSchema, updatePlanSchema } from "./agent.schemas.js";
import {
    extractFileContents,
    formatFileContents,
    formatFileList,
    mergeUnique,
    normalizeAvailableFiles,
    normalizePath,
    pickHeuristicFiles
} from "./agent.helpers.js";

const UI_TASK_PATTERN = /(ui|frontend|front-end|design|style|theme|landing|dashboard|website|web app|page|screen|layout|responsive|mobile|desktop|button|card|hero|navbar|header|footer|animation|transition|hover|modern|premium|elegant|polished|redesign|e-?commerce|shop|store|product|products|cart|checkout|marketplace)/i;
const MODEL_TIMEOUT_MS = 10 * 60 * 1000;

function isUiTask(task) {
    return UI_TASK_PATTERN.test(String(task));
}

function buildUiDesignBrief() {
    const sections = [
        [
            "Design mandate",
            [
                "Create a complete, premium-quality website experience, not a starter template clone.",
                "Make the page feel intentionally art-directed from the first fold to the footer.",
                "Use a cohesive visual system rather than random styling choices.",
                "Treat the task like a real product launch, storefront, or portfolio reveal.",
                "Prefer a polished end result over quick placeholder-looking changes.",
                "If a section is weak, redesign the section instead of only nudging colors.",
                "If the layout is generic, rebuild the layout with stronger structure.",
                "If the text feels weak, rewrite the copy to sound credible and conversion-oriented.",
                "If the page looks empty, add real composition and breathing room.",
                "If the page looks cluttered, simplify and create hierarchy."
            ]
        ],
        [
            "Visual direction",
            [
                "Choose one visual direction and commit to it across the whole page.",
                "Examples of coherent directions: dark luxury, bright editorial, modern marketplace, minimal premium, glassy product reveal, or soft cinematic brand experience.",
                "Do not mix multiple unrelated design languages in one page.",
                "Use layered backgrounds, gradients, translucent surfaces, or subtle texture if they support the chosen direction.",
                "Use shadows and borders to separate layers instead of harsh outlines.",
                "Use generous whitespace when the design needs elegance.",
                "Use tighter rhythm and bolder composition when the design needs energy.",
                "Keep the palette controlled and purposeful.",
                "Prefer a few strong accent colors over many weak colors.",
                "Make the page look custom-built rather than assembled from defaults."
            ]
        ],
        [
            "Typography system",
            [
                "Create a clear hierarchy with a large hero headline, readable body text, and strong section titles.",
                "Use font sizes that feel deliberate, not random.",
                "Avoid default-looking type ramps that feel like a template.",
                "Let line height support readability instead of feeling cramped.",
                "Use compact labels for small supporting metadata.",
                "Use a stronger visual weight for CTA copy and key value statements.",
                "Use typography to guide scanning, not just to display words.",
                "Keep paragraph widths readable on large screens.",
                "Avoid overusing all caps unless it fits the brand direction.",
                "Make spacing between text blocks feel calm and structured."
            ]
        ],
        [
            "Layout architecture",
            [
                "Build the page as a sequence of intentional sections with a beginning, middle, and end.",
                "The hero should communicate the brand and intent immediately.",
                "After the hero, include supporting sections that deepen trust and motivation.",
                "Use grids, cards, rows, and split layouts to avoid monotony.",
                "Break long content into scannable modules.",
                "Alternate section density so the page has rhythm.",
                "Use a strong max width so content does not stretch awkwardly.",
                "Balance content and visuals across the page.",
                "Make every section feel like it belongs to the same system.",
                "Do not leave long blank zones unless they are deliberate breathing space."
            ]
        ],
        [
            "Hero section",
            [
                "The hero should feel like a headline moment, not a placeholder block.",
                "Include a sharp headline that tells the visitor what the site is about.",
                "Include a concise supporting sentence that adds clarity or aspiration.",
                "Include a primary call to action that feels obviously important.",
                "Include a secondary call to action if it helps the user compare options.",
                "Include a visual element that feels premium, such as a product preview, card stack, interface mock, abstract shape, or editorial illustration.",
                "Use background treatment in the hero to establish atmosphere.",
                "Use strong spacing so the content does not feel jammed together.",
                "Make the hero feel responsive on narrow screens.",
                "Make sure the hero still looks polished without relying on external assets."
            ]
        ],
        [
            "Ecommerce blueprint",
            [
                "If the task is e-commerce, the page should resemble a real storefront with strong merchandising.",
                "Include a brand header and navigation that feel store-like.",
                "Include a hero with a product or campaign angle.",
                "Include featured collections or featured products immediately after the hero.",
                "Include category cards or browsing shortcuts so users can navigate products quickly.",
                "Include a trust strip with shipping, returns, support, or quality signals.",
                "Include a best sellers section or curated picks section.",
                "Include social proof such as ratings, testimonials, reviews, or press mentions.",
                "Include a promotional banner or seasonal offer if it fits the concept.",
                "Include a footer that feels complete and useful.",
                "If appropriate, include a product detail teaser, bundle preview, or editorial product story.",
                "If the design benefits from it, include a cart or checkout-style CTA block."
            ]
        ],
        [
            "Product card rules",
            [
                "Product cards should look like commerce UI, not generic boxes.",
                "Use clear product imagery, even if it is a styled placeholder or abstract visual.",
                "Show title, short descriptor, and price or key action where relevant.",
                "Include rating badges, color dots, stock hints, or feature callouts when useful.",
                "Make hover states feel soft and premium.",
                "Use consistent image aspect ratios.",
                "Keep card padding comfortable and consistent.",
                "Use badges sparingly and only when they add meaning.",
                "Let the card hierarchy guide the eye from image to title to action.",
                "Make cards easy to scan in a grid or carousel."
            ]
        ],
        [
            "Category and collection sections",
            [
                "Add category cards or collection rows to help users explore the catalog.",
                "Make categories look clickable and clearly organized.",
                "Use compact labels and small visual cues for category browsing.",
                "Use a mix of image-led and text-led categories if it improves rhythm.",
                "Keep collection sections visually rich but not overloaded.",
                "Allow a section to introduce a story about the collection.",
                "Show a logical progression from broad categories to featured products.",
                "Use aligned grids so the section feels orderly.",
                "Avoid using only one repeated card type across the whole page.",
                "Break the page into browse-first and decision-first sections."
            ]
        ],
        [
            "Trust and conversion",
            [
                "Add trust signals such as shipping, returns, ratings, testimonials, or service promises.",
                "Make the conversion path obvious.",
                "Use CTA buttons that feel confident and high-intent.",
                "Make secondary actions clear but visually quieter.",
                "Use social proof to reduce friction.",
                "Make the user feel that the brand is established and reliable.",
                "Use numbers, badges, or concise proof points where they help credibility.",
                "Keep trust content visually integrated instead of dumping it into a plain row.",
                "Avoid vague marketing fluff with no concrete signal.",
                "Use conversion elements in a tasteful way that matches the design."
            ]
        ],
        [
            "Motion language",
            [
                "Use motion lightly and intentionally.",
                "Favor gentle fades, small upward reveals, and subtle scaling over loud animation.",
                "Use hover transitions on buttons, cards, and links.",
                "Use tiny motion to reinforce state changes, not to distract.",
                "Avoid over-animated interfaces that feel gimmicky.",
                "Make animated gradients or glows subtle and controlled.",
                "Keep transitions smooth and short enough to feel responsive.",
                "Use motion to create polish, not spectacle.",
                "Use stagger only when it helps reveal the structure elegantly.",
                "Avoid motion that harms readability or slows down interaction."
            ]
        ],
        [
            "Responsive behavior",
            [
                "The layout must look strong on desktop, tablet, and mobile.",
                "Stack columns cleanly on small screens.",
                "Make touch targets large enough for mobile use.",
                "Keep spacing comfortable when the viewport shrinks.",
                "Avoid tiny text that becomes unreadable on a phone.",
                "Reflow cards and grids naturally rather than forcing awkward widths.",
                "Keep hero content vertically balanced on narrow screens.",
                "Make any decorative side visuals collapse gracefully.",
                "Make mobile navigation simple and realistic if navigation is present.",
                "Do not rely on hover-only affordances."
            ]
        ],
        [
            "Accessibility",
            [
                "Use semantic structure and meaningful labels.",
                "Maintain strong color contrast between text and background.",
                "Make focus states visible and tasteful.",
                "Do not encode meaning by color alone.",
                "Ensure buttons and links feel distinct.",
                "Keep readable text sizes for body content.",
                "Avoid motion that could make the page uncomfortable.",
                "Use alt text for meaningful images or decorative empty alt for purely decorative ones.",
                "Keep the interface understandable without requiring perfect vision.",
                "Prefer clarity over decorative complexity when the two conflict."
            ]
        ],
        [
            "Implementation rules",
            [
                "Keep the code compatible with the current preview sandbox.",
                "Do not introduce new packages unless they are already in package.json.",
                "If you need icons, use inline SVG or simple CSS shapes instead of importing a missing icon library.",
                "Prefer existing project assets and built-in React/CSS patterns.",
                "Make minimal but complete edits to the affected files.",
                "Keep the component tree easy to read.",
                "Avoid unnecessary abstraction if a straightforward component is enough.",
                "Preserve app functionality while improving the experience.",
                "Do not break the Vite build.",
                "Do not reference files or paths that do not exist in the workspace."
            ]
        ],
        [
            "Forbidden patterns",
            [
                "Do not make a plain starter page with a single heading and default button.",
                "Do not leave the design with large empty white areas unless the concept intentionally needs it.",
                "Do not use random stock-like styles that look copied from a generic demo.",
                "Do not import unavailable libraries.",
                "Do not use overly bright colors without a reason.",
                "Do not stack too many different shadows, borders, and glows at once.",
                "Do not make the page feel like a default template with placeholder spacing.",
                "Do not write copy that sounds generic, vague, or filler-like.",
                "Do not rely on a single section to carry the entire design.",
                "Do not ship a UI that feels unfinished."
            ]
        ],
        [
            "Final quality gate",
            [
                "Before finalizing, review the whole page as a user would.",
                "Check whether the page feels cohesive from top to bottom.",
                "Check whether the sections have a logical order.",
                "Check whether the spacing feels intentional.",
                "Check whether the page feels premium instead of basic.",
                "Check whether the design is responsive and readable.",
                "Check whether the page avoids missing dependency imports.",
                "Check whether the page has enough detail to feel real.",
                "Check whether the motion is subtle and tasteful.",
                "Check whether the output is better than a starter template in every visible way."
            ]
        ]
    ];

    const archetypes = [
        {
            title: "Ecommerce storefront archetype",
            rules: [
                "The page should feel like a premium store, not a generic landing page.",
                "Prioritize merchandising hierarchy over decorative clutter.",
                "Show categories, best sellers, featured items, and trust signals.",
                "Include a campaign-style hero that feels like a collection launch.",
                "Use price, rating, or inventory cues when they help the shopping flow.",
                "Give every product tile a clear action or clear next step.",
                "Let the page support browsing, comparison, and conversion.",
                "Use editorial product photography treatment even if the content is placeholder.",
                "Make the footer useful for shopping support and navigation.",
                "Avoid making the page look like a brochure instead of a store."
            ]
        },
        {
            title: "SaaS landing archetype",
            rules: [
                "Lead with a sharp value proposition and a credible product narrative.",
                "Include feature cards, workflow blocks, stats, testimonials, and CTAs.",
                "Use product screenshots or interface-style visuals.",
                "Create an outcome-driven story, not a list of buzzwords.",
                "Make pricing or plan cues feel structured if relevant.",
                "Use trust badges and integrations where they matter.",
                "Keep the content conversion-focused and skimmable.",
                "Use a strong section sequence: problem, solution, features, proof, CTA.",
                "Avoid a vague startup template with generic copy.",
                "Make the product feel real and usable."
            ]
        },
        {
            title: "Dashboard archetype",
            rules: [
                "Use a shell that feels operational and data-rich.",
                "Create panels, charts, cards, metrics, tables, and side navigation when relevant.",
                "Prioritize information hierarchy and scanability.",
                "Use compact but readable spacing.",
                "Make states and controls feel polished.",
                "Use visual grouping to reduce cognitive load.",
                "Keep widgets consistent in tone and density.",
                "Make the dashboard feel like a real tool, not a demo mockup.",
                "Use subtle accent colors to indicate meaning.",
                "Keep navigation and core actions obvious."
            ]
        },
        {
            title: "Portfolio archetype",
            rules: [
                "Make the page feel personal, curated, and confident.",
                "Use a strong hero with a distinctive visual identity.",
                "Show featured work, case studies, or project highlights.",
                "Use editorial spacing and careful typography.",
                "Include about, process, testimonials, and contact cues.",
                "Make image composition feel intentional.",
                "Avoid a simple gallery that lacks narrative.",
                "Let the portfolio tell a story about taste and craft.",
                "Use motion sparingly to support presentation.",
                "Make the contact path easy and inviting."
            ]
        },
        {
            title: "Blog and editorial archetype",
            rules: [
                "Use a readable content rhythm with strong headings and comfortable line length.",
                "Create featured articles, category navigation, and highlight stories.",
                "Make metadata clear and visually calm.",
                "Use article cards with hierarchy and scannability.",
                "Treat imagery and captions with editorial care.",
                "Balance content density with white space.",
                "Make the experience feel like a magazine or modern publication.",
                "Avoid cluttering the page with too many competing elements.",
                "Keep the reading path clear.",
                "Use elegant separators and consistent spacing."
            ]
        },
        {
            title: "Restaurant and food archetype",
            rules: [
                "Make the design appetite-driven and atmospheric.",
                "Use menu highlights, signature dishes, reservation cues, and location info.",
                "Let photography or styled visuals take center stage.",
                "Use warm or appetizing color logic when the concept supports it.",
                "Include hours, address, and ordering or booking actions.",
                "Make specials and featured dishes stand out.",
                "Avoid plain menu listing without atmosphere.",
                "Let the page feel hospitality-focused and premium.",
                "Use text and image balance carefully.",
                "Make the call to action easy to find."
            ]
        },
        {
            title: "Travel archetype",
            rules: [
                "Create a sense of place and aspiration.",
                "Show destinations, experiences, offers, or trip categories.",
                "Use strong hero imagery or scene-setting visuals.",
                "Include booking cues, dates, pricing hints, or itinerary previews when relevant.",
                "Use cards for destinations or packages.",
                "Make the page feel exploratory and polished.",
                "Avoid generic travel brochure styling.",
                "Build trust with reviews, safety, and support cues.",
                "Keep the layout inviting and easy to browse.",
                "Let the page feel exciting without becoming chaotic."
            ]
        },
        {
            title: "Fitness and wellness archetype",
            rules: [
                "Use energetic but calm visual language.",
                "Show programs, classes, benefits, and transformation cues.",
                "Create confidence with testimonials and progress signals.",
                "Use bold headings and motivating copy.",
                "Avoid sterile medical styling unless the concept requires it.",
                "Make actions like join, book, or start feel prominent.",
                "Use strong imagery or abstract motion elements.",
                "Keep spacing active and empowering.",
                "Make the layout feel healthy and premium.",
                "Show the user what happens after they click."
            ]
        },
        {
            title: "Education archetype",
            rules: [
                "Make learning paths easy to understand.",
                "Show courses, modules, outcomes, and credibility cues.",
                "Use clear hierarchy for learners at different stages.",
                "Include CTAs like enroll, start, or explore curriculum.",
                "Use cards and feature blocks to explain value.",
                "Avoid looking like a plain academic brochure.",
                "Balance trust with accessibility.",
                "Make the page feel structured and supportive.",
                "Use progress or roadmap ideas when helpful.",
                "Keep the tone encouraging and practical."
            ]
        },
        {
            title: "Finance archetype",
            rules: [
                "Make the page feel secure, controlled, and precise.",
                "Use strong data presentation and trust cues.",
                "Show value propositions clearly and without hype.",
                "Avoid playful visuals unless the brand specifically wants them.",
                "Use restrained color and crisp alignment.",
                "Make actions like open account, invest, or get started obvious.",
                "Include proof, compliance, or security cues if relevant.",
                "Keep the design professional and authoritative.",
                "Use subtle motion only.",
                "Reduce visual noise and maximize confidence."
            ]
        },
        {
            title: "Healthcare archetype",
            rules: [
                "Make clarity and reassurance the top priorities.",
                "Use calm, readable, trustworthy visual language.",
                "Include services, specialties, appointment cues, and support.",
                "Avoid aggressive marketing language.",
                "Make contact and booking actions easy.",
                "Use clean spacing and accessible contrast.",
                "Make information easy to scan for urgent needs.",
                "Use cards for departments, conditions, or offerings.",
                "Keep imagery respectful and supportive.",
                "Make the interface feel dependable."
            ]
        },
        {
            title: "Marketplace archetype",
            rules: [
                "Show discovery pathways, categories, and featured listings.",
                "Balance browseability and trust.",
                "Use listing cards with enough detail to compare.",
                "Include filtering or sorting cues when appropriate.",
                "Make it feel like a platform rather than a static brochure.",
                "Keep actions obvious and repeated appropriately.",
                "Use hierarchy so users know where to start.",
                "Avoid cluttering listings with too many competing badges.",
                "Use a clean grid or modular list structure.",
                "Support both exploration and decision-making."
            ]
        },
        {
            title: "Event archetype",
            rules: [
                "Create excitement and urgency without clutter.",
                "Show date, location, agenda, speakers, or ticket cues.",
                "Make the main CTA about attending or registering.",
                "Use schedule blocks and highlight moments.",
                "Make the page feel like a real event brand.",
                "Use strong atmosphere and hierarchy.",
                "Add social proof or notable participants where relevant.",
                "Keep mobile registration simple.",
                "Avoid generic flyer-like composition.",
                "Use visual structure that helps people decide fast."
            ]
        },
        {
            title: "Community and social archetype",
            rules: [
                "Create a sense of belonging and active participation.",
                "Show members, posts, discussion themes, or community benefits.",
                "Use social proof and invitation cues.",
                "Make joining, posting, or exploring easy.",
                "Keep the interface welcoming and lively.",
                "Use cards and feeds without visual chaos.",
                "Make content discovery easy.",
                "Use lightweight interactions to suggest activity.",
                "Avoid looking like a basic forum clone.",
                "Make the brand personality clear."
            ]
        },
        {
            title: "Productivity app archetype",
            rules: [
                "Make the product feel organized, helpful, and efficient.",
                "Show how the app improves workflow or focus.",
                "Use interface previews or task-oriented visuals.",
                "Include feature blocks that map to user value.",
                "Keep the language direct and practical.",
                "Use clean grids and calm hierarchy.",
                "Avoid over-decorating the page.",
                "Make the CTA about starting to work better.",
                "Use subtle motion to imply smoothness.",
                "Emphasize clarity and usefulness."
            ]
        },
        {
            title: "AI tool archetype",
            rules: [
                "Make the product feel intelligent, modern, and capable.",
                "Show capabilities, use cases, and example outputs.",
                "Use futuristic but restrained visual language.",
                "Include prompt, output, or workflow previews if relevant.",
                "Make the CTA feel like trying the product now.",
                "Avoid sci-fi clichés that reduce credibility.",
                "Make the system feel powerful but accessible.",
                "Use trust, speed, and quality cues.",
                "Keep the layout crisp and high-tech.",
                "Make the interface feel engineered, not gimmicky."
            ]
        },
        {
            title: "Local business archetype",
            rules: [
                "Make the value proposition immediately understandable.",
                "Show services, hours, location, testimonials, and contact details.",
                "Use conversion-oriented sections without overcomplicating the page.",
                "Keep navigation easy and action-driven.",
                "Use real-world trust markers.",
                "Make the layout feel established and helpful.",
                "Avoid too much abstract branding if the business needs clarity.",
                "Use local cues and practical information.",
                "Make booking or contacting obvious.",
                "Let the page feel professional and ready to serve."
            ]
        }
    ];

    const componentSystem = [
        {
            title: "Header and navigation",
            rules: [
                "Header should support the brand, not distract from it.",
                "Use nav items that map to useful sections.",
                "Keep the logo or brand mark visible and confident.",
                "Make primary actions easy to spot.",
                "Avoid overcrowding the header with too many links.",
                "Keep the header responsive and usable.",
                "Use a sticky header only if it helps the flow.",
                "Make nav state and hover cues subtle.",
                "Do not let the header feel like a generic template top bar.",
                "Ensure the header matches the chosen visual direction."
            ]
        },
        {
            title: "Buttons and actions",
            rules: [
                "Buttons should feel tappable and premium.",
                "Use clear hierarchy between primary and secondary actions.",
                "Give buttons enough padding and visual weight.",
                "Use hover and focus states that feel refined.",
                "Avoid default browser-looking buttons.",
                "Make disabled or subtle actions still readable.",
                "Keep action labels short and specific.",
                "Use one dominant CTA style and one quieter variant.",
                "Make button spacing consistent across the page.",
                "Let CTAs guide the user to the next step."
            ]
        },
        {
            title: "Cards and surfaces",
            rules: [
                "Cards should feel like intentional surfaces.",
                "Use consistent padding, radius, and shadow logic.",
                "Give cards a clear purpose: feature, product, testimonial, stat, or link.",
                "Keep content inside cards scannable.",
                "Use hover lifts only if they feel natural.",
                "Avoid making every card identical unless consistency is the point.",
                "Vary card emphasis when needed.",
                "Make groupings feel modular and readable.",
                "Do not overload cards with text.",
                "Let cards support the page rhythm."
            ]
        },
        {
            title: "Forms and input areas",
            rules: [
                "Inputs should feel clean and obviously usable.",
                "Make labels easy to read and understand.",
                "Use helpful placeholder text only when needed.",
                "Keep validation states clear but not alarming.",
                "Make form sections visually separated from the rest of the page.",
                "Use large enough input sizing for comfort.",
                "Keep submit actions easy to locate.",
                "Do not use generic blue default form styling unless it matches the theme.",
                "Make search or filters feel integrated, not bolted on.",
                "Reduce friction in every field."
            ]
        },
        {
            title: "Footers",
            rules: [
                "Footer should complete the page and add trust.",
                "Include useful navigation, support, or brand details.",
                "Keep footer structure organized.",
                "Do not leave the footer as an afterthought.",
                "Use it to close the design neatly.",
                "Include legal or contact details if relevant.",
                "Make links easy to scan.",
                "Keep footer spacing proportional to the rest of the page.",
                "Let the footer feel designed, not default.",
                "Use the footer to reinforce the brand tone."
            ]
        },
        {
            title: "Imagery and illustration",
            rules: [
                "Use imagery to support the story, not to fill space.",
                "If no real assets exist, create abstract shapes, panels, or mock visuals that still feel purposeful.",
                "Keep image treatment aligned with the visual direction.",
                "Use consistent rounding and framing.",
                "Do not let images feel pasted on.",
                "Use decorative imagery sparingly and meaningfully.",
                "Make image blocks responsive and stable.",
                "Keep captions and labels integrated.",
                "Prefer a coherent mock system over random decorative images.",
                "Make the visual element strengthen the overall composition."
            ]
        },
        {
            title: "Motion and animation",
            rules: [
                "Motion should support comprehension and delight.",
                "Use transitions that feel smooth and controlled.",
                "Use subtle keyframe or CSS animation if the page benefits from life.",
                "Do not animate everything.",
                "Use motion to signal hover, reveal, and progression.",
                "Keep duration and easing consistent.",
                "Avoid bouncing, flashing, or excessive parallax.",
                "Make loading states feel calm and deliberate if they exist.",
                "Use motion to highlight the important things first.",
                "Keep accessibility and reduced motion in mind."
            ]
        },
        {
            title: "Spacing and rhythm",
            rules: [
                "Spacing should create calm and hierarchy.",
                "Use enough breathing room around major sections.",
                "Tighten spacing only when information density requires it.",
                "Avoid random gaps.",
                "Use consistent vertical rhythm between sections.",
                "Keep line and block spacing readable.",
                "Use spacing to express importance.",
                "Let whitespace be part of the design language.",
                "Do not make the page feel cramped or chaotic.",
                "Use spacing to guide attention."
            ]
        },
        {
            title: "Color discipline",
            rules: [
                "Choose a palette that matches the concept.",
                "Use accent colors intentionally.",
                "Keep body text and UI chrome within a controlled family.",
                "Do not use every bright color just because it looks modern.",
                "Ensure contrast works in all main sections.",
                "Use color to separate surface levels and emphasize actions.",
                "Keep background colors compatible with readability.",
                "Use gradients only where they add richness.",
                "Let the palette support the mood of the page.",
                "Avoid accidental rainbow designs."
            ]
        }
    ];

    const promptParts = [
        `Design guidance for high-quality UI generation:`,
        ``,
        `The following instructions are intentionally detailed so that even a normal prompt like "build an ecommerce website" results in a polished, production-looking interface.`,
        `Follow the guidance below as a strict design brief, not as optional inspiration.`,
        `If the user asks for a storefront, product experience, landing page, portfolio, SaaS page, dashboard, or any frontend screen, apply the same premium design mindset.`,
        `If the task is only a small UI update, still preserve the overall visual system and elevate the section instead of making tiny cosmetic edits.`,
        ``
    ];

    for (const [title, rules] of sections) {
        promptParts.push(`${title}:`);
        for (const rule of rules) {
            promptParts.push(`- ${rule}`);
        }
        promptParts.push(``);
    }

    for (const archetype of archetypes) {
        promptParts.push(`${archetype.title}:`);
        for (const rule of archetype.rules) {
            promptParts.push(`- ${rule}`);
        }
        promptParts.push(``);
    }

    for (const component of componentSystem) {
        promptParts.push(`${component.title}:`);
        for (const rule of component.rules) {
            promptParts.push(`- ${rule}`);
        }
        promptParts.push(``);
    }

    promptParts.push(
        `Output expectations:`,
        `- If you need to touch a component, prefer a cohesive rewrite of the relevant page or section over scattered micro-edits.`,
        `- If the current code is a generic starter shell, transform it into a complete experience with more structure and polish.`,
        `- If the task mentions e-commerce, lean into merchandising, trust, conversion, and product storytelling.`,
        `- If the task mentions any other website type, switch to the matching archetype above and use it as the governing layout logic.`,
        `- If the task mentions a website or landing page but does not define the style, choose a refined modern direction and apply it consistently.`,
        `- If a dependency is not already present in package.json, do not import it. Use React, CSS, and inline SVG instead.`,
        `- Prefer complete sections over tiny visual tweaks.`,
        `- Prefer a strong page composition over a single centered card.`,
        `- Prefer real structure over decorative filler.`,
        `- Prefer clear content hierarchy over empty style.`,
        `- Prefer a page that can be scrolled and explored over a static hero-only layout.`,
        `- Prefer distinct sections with a purpose instead of repeating one component forever.`,
        `- Prefer visual storytelling that supports the task, not random artistic effects.`,
        `- Prefer mobile-friendly layouts that reflow correctly.`,
        `- Prefer a final result that feels like a real launch-ready site.`,
        `- Make the generated code run cleanly inside the existing sandbox without extra setup.`,
        `- Prefer strong composition and clarity over template-like simplicity.`,
        `- Subtle motion is good. Excessive animation is not.`,
        `- The result should feel custom, credible, and complete.`,
        ``
    );

    return promptParts.join("\n");
}

function expandTaskForUi(task) {
    const rawTask = String(task ?? "").trim();

    if (!rawTask || !isUiTask(rawTask)) {
        return rawTask;
    }

    return `${rawTask}\n\n${buildUiDesignBrief()}`;
}

function buildFileSelectionPrompt(task, availableFiles) {
    const enrichedTask = expandTaskForUi(task);

    // Ask for a minimal file shortlist before we spend tokens reading file contents.
    return (
        `You are helping edit a codebase.\n\n` +
        `Task: ${enrichedTask}\n\n` +
        `Choose the smallest useful set of files to inspect next.\n` +
        `Return JSON with a top-level key named "files" containing the selected file paths.\n` +
        `Only return files that appear in the list below, and keep the set focused on files likely to affect the task.\n\n` +
        `Available files:\n${formatFileList(availableFiles)}\n`
    );
}

function buildUpdatePrompt(task, fileContents) {
    const enrichedTask = expandTaskForUi(task);

    // Give the model full file text so it can return complete replacement files.
    return (
        `You are editing files to satisfy the following task:\n\n` +
        `Task: ${enrichedTask}\n\n` +
        `Here are the relevant files and their full contents:\n\n` +
        `${formatFileContents(fileContents)}\n\n` +
        `Return JSON with a top-level key named "updates" containing the file updates.\n` +
        `Return only the files that need changes.\n` +
        `If the task requires a brand new file, include it here too.\n` +
        `For each file, return the full new content, not a diff.\n` +
        `Keep the edits minimal and focused on the task.\n`
    );
}

async function selectFilesToRead({ task, model, availableFiles }) {
    // Use structured output so we only get file paths back from the model.
    const selectionModel = model.withStructuredOutput(fileSelectionSchema, {
        method: "jsonMode",
        name: "file_selection"
    });

    const selection = await selectionModel.invoke(
        buildFileSelectionPrompt(task, availableFiles),
        { timeout: MODEL_TIMEOUT_MS }
    );
    // Add a small heuristic set so obvious files are still read even if the model misses them.
    const heuristicFiles = pickHeuristicFiles(task, availableFiles);

    const selectedFiles = mergeUnique([
        ...heuristicFiles,
        ...(selection?.files ?? [])
    ]).filter((file) => availableFiles.includes(file));

    if (selectedFiles.length > 0) {
        return selectedFiles;
    }

    return heuristicFiles.length > 0
        ? heuristicFiles
        : availableFiles.slice(0, Math.min(4, availableFiles.length));
}

async function planUpdates({ task, model, fileContents }) {
    // Ask for whole-file replacements so the write step stays simple.
    const planningModel = model.withStructuredOutput(updatePlanSchema, {
        method: "jsonMode",
        name: "update_plan"
    });

    const plan = await planningModel.invoke(
        buildUpdatePrompt(task, fileContents),
        { timeout: MODEL_TIMEOUT_MS }
    );

    return (plan?.updates ?? []).filter((update) => {
        return typeof update?.file === "string" && typeof update?.content === "string" && update.content.trim().length > 0;
    });
}

async function applyUpdates({ updates, fileContents, availableFileSet, tools }) {
    const applied = [];
    const created = [];
    const updated = [];

    for (const update of updates) {
        const targetFile = normalizePath(update.file);
        const currentContent = fileContents.get(targetFile);
        // If the file is already identical, skip the write instead of touching it.
        const fileExists = availableFileSet.has(targetFile);

        if (currentContent !== undefined && currentContent === update.content) {
            console.log(`[agent] skipping unchanged file: ${targetFile}`);
            continue;
        }

        if (!fileExists) {
            // New path: create the file through the create-files endpoint.
            console.log(`[agent] creating: ${targetFile}`);
            await tools.createFiles.invoke({
                files: [{
                    file: targetFile,
                    content: update.content
                }]
            });
            created.push(targetFile);
        } else {
            // Existing path: update the file in place.
            console.log(`[agent] updating: ${targetFile}`);
            await tools.updateFiles.invoke({
                file: targetFile,
                content: update.content
            });
            updated.push(targetFile);
        }

        applied.push(targetFile);
    }

    return {
        applied,
        created,
        updated
    };
}

export async function runAgent({ task, model, apiBaseUrl }) {
    console.log(`[agent] task: ${task}`);
    console.log(`[agent] model timeout: ${MODEL_TIMEOUT_MS}ms`);

    const tools = createAgentTools(apiBaseUrl);

    // Start with the workspace file list so we know what can be read or updated.
    const availableFiles = normalizeAvailableFiles(await tools.listFiles.invoke({}));
    if (availableFiles.length === 0) {
        console.log("[agent] no files discovered");
        return;
    }

    const availableFileSet = new Set(availableFiles);
    console.log(`[agent] discovered ${availableFiles.length} files`);

    // Read only the files that look relevant to the task.
    const filesToRead = await selectFilesToRead({ task, model, availableFiles });
    if (filesToRead.length === 0) {
        console.log("[agent] no files selected to read");
        return;
    }

    console.log(`[agent] reading: ${filesToRead.join(", ")}`);
    const readResult = await tools.readFiles.invoke({
        files: filesToRead
    });

    // Flatten the API response into a file -> content map for the planner.
    const fileContents = extractFileContents(readResult);
    console.log(`[agent] loaded ${fileContents.size} file contents`);

    // Turn the file contents into a list of concrete edits.
    const updates = await planUpdates({ task, model, fileContents });
    if (updates.length === 0) {
        console.log("[agent] model returned no updates");
        return;
    }

    // Write each edit with the correct endpoint based on whether the file already exists.
    const changeSet = await applyUpdates({ updates, fileContents, availableFileSet, tools });
    if (changeSet.applied.length === 0) {
        console.log("[agent] nothing changed after comparison");
        return;
    }

    console.log(`[agent] updated files: ${changeSet.applied.join(", ")}`);

    return {
        task,
        apiBaseUrl: tools.baseUrl,
        discoveredFiles: availableFiles.length,
        filesToRead,
        applied: changeSet.applied,
        createdFiles: changeSet.created,
        updatedFiles: changeSet.updated
    };
}
