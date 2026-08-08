# Knit Dev — Frontend UI Documentation

> A complete walkthrough of the Knit Dev interface, from the first screen a user sees all the way through to the full sandbox workspace.

---

## Table of Contents

1. [Overview](#overview)
2. [Page 1 — Landing / Hero Screen](#page-1--landing--hero-screen)
   - [Navigation Bar](#navigation-bar)
   - [Hero Content Area](#hero-content-area)
   - [Scrollable Inspiration Reel](#scrollable-inspiration-reel)
   - [CTA — Launch Form](#cta--launch-form)
   - [Feature Cards](#feature-cards)
   - [Ticker Bar](#ticker-bar)
3. [Page 2 — Main Workspace (IDE)](#page-2--main-workspace-ide)
   - [Top Header Bar](#top-header-bar)
   - [Left Sidebar](#left-sidebar)
     - [AI Prompt Tab (Chat Panel)](#ai-prompt-tab-chat-panel)
     - [Explorer Tab (File Explorer)](#explorer-tab-file-explorer)
   - [Main Content Area](#main-content-area)
     - [Code Editor](#code-editor)
     - [Live Preview Panel](#live-preview-panel)
   - [Terminal Drawer](#terminal-drawer)
4. [Theme System](#theme-system)
5. [Component Map](#component-map)

---

## Overview

**Knit Dev** is an AI-powered browser-based IDE (Integrated Development Environment) sandbox. The UI has exactly two screens:

| Screen | When it appears |
|--------|-----------------|
| **Landing / Hero** | Default — when no sandbox has been started yet |
| **Workspace IDE** | After the user launches a sandbox — the full editor environment |

The transition between these two views is entirely managed in `src/App.jsx` — if `sandboxData` is `null`, the Hero is shown; otherwise the full workspace renders.

---

## Page 1 — Landing / Hero Screen

> **Component:** `src/components/Hero.jsx`

This is the first thing a user sees. It is a full-page landing screen designed to explain the product and get users to launch their first sandbox.

---

### Navigation Bar

Located at the **very top**, fixed in place with a subtle blurred backdrop.

| Element | Description |
|---------|-------------|
| **Knit Dev Logo** | The `KnitLogo` SVG icon (3 interlocking thread paths — rose, amber, sage gradient) followed by the text "Knit Dev" |
| **Theme Toggle Button** | Top-right corner. Switches between **dark mode** (moon icon) and **light mode** (sun icon). Uses the browser's View Transitions API for a smooth circular reveal animation from the click point. |

---

### Hero Content Area

Centred vertically and horizontally in the viewport. Contains:

#### 1. Eyebrow Badge
A small glowing pill badge that reads:
> ✦ AI-Powered Sandbox — Now in Beta

#### 2. Headline
Large, bold display text split over two lines:
```
Your idea, running
in under a minute.
```
The word **"running"** is rendered in an accent/highlight colour using the `.title-accent` class.

#### 3. Background Decorations
Two absolutely-positioned blobs (`.hero-blob` and `.hero-blob-2`) sit behind the content. These are large blurred gradient circles that give the background a soft, ambient purple/indigo glow. They are purely decorative (`aria-hidden="true"`).

---

### Scrollable Inspiration Reel

A **horizontally scrollable carousel** of 4 quote cards sits between the headline and the CTA. Each card contains:

- A card number (`01`, `02`, `03`, `04`)
- A **Quote icon** (from Lucide)
- A design/engineering quote
- The author's name

The four cards are colour-coded with themed accents:

| Card | Colour Theme | Quote |
|------|-------------|-------|
| 01 | **Sage (green)** | *"Simplicity is subtraction of the obvious..."* — John Maeda |
| 02 | **Sky (blue)** | *"Details are not the details. They make the design."* — Charles Eames |
| 03 | **Amber (yellow)** | *"The best way to predict the future is to invent it."* — Alan Kay |
| 04 | **Rose (pink/red)** | *"First, solve the problem. Then, write the code."* — John Johnson |

A small **"Scroll to explore inspiration →"** hint with an animated arrow appears above the reel.

---

### CTA — Launch Form

Below the quote reel, the call-to-action section contains:

#### Project Name Input
A text input field with placeholder:
```
Project name (e.g. Portfolio Site)
```
- Max length: 80 characters
- Pressing `Enter` also triggers sandbox launch
- Disabled while loading

#### Launch Sandbox Button
A primary action button labelled **"Launch Sandbox →"** (with a right-arrow icon).

**Loading state:** When clicked, the button shows a spinner and the text changes to **"Spinning up your sandbox…"**. The button is disabled during this period.

#### Hint Text
Below the button, a small green pulsing dot with the text:
> 🟢 Free while in beta · No credit card required

---

### Feature Cards

Three horizontally arranged cards explaining the core features:

| Icon | Title | Description |
|------|-------|-------------|
| ✦ Sparkles | **Describe. Build. Done.** | Tell the AI what to build in plain English. Watch it scaffold, write, and wire up real code — live, in seconds. |
| ⬛ Terminal | **A real shell. Always on.** | A full xterm.js terminal connected over Socket.io. Run installs, scripts, and commands as if it's your own machine. |
| ⚡ Zap | **See it. Right now.** | Every keystroke reflected instantly in a hot-reloading preview pane. No builds. No waiting. Just your idea, alive. |

---

### Ticker Bar

A small footer-level strip at the very bottom of the hero content. Three phrases separated by divider dots:

> Built for builders who move fast · Backed by live Socket.io streams · No local setup ever

---

## Page 2 — Main Workspace (IDE)

> **Component:** `src/App.jsx` orchestrates all workspace sub-components.

Once the sandbox is ready, the entire screen transitions to the full IDE workspace. It is divided into **4 distinct zones**:

```
┌─────────────────────────────────────────────────────────────┐
│                     TOP HEADER BAR                          │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  LEFT        │         CODE EDITOR  |  LIVE PREVIEW        │
│  SIDEBAR     │                                              │
│  (Chat /     │                                              │
│   Explorer)  │                                              │
│              ├──────────────────────────────────────────────┤
│              │            TERMINAL DRAWER                   │
└──────────────┴──────────────────────────────────────────────┘
```

---

### Top Header Bar

> **Component:** `src/components/Header.jsx`

A slim fixed bar spanning the full width of the screen. Divided into three zones:

#### Left Zone — Brand & Status
- **Knit Dev Logo** (`KnitLogo` icon + "Knit Dev" text)
- **Sandbox Status Badge** (`.badge-glow`) — shows a green pulsing dot + the first 8 characters of the sandbox ID, followed by a **Copy** button. After clicking, the copy icon briefly turns into a **checkmark** for 2 seconds.

#### Centre Zone — Layout & Terminal Controls
Three layout mode buttons (pill-style toggle group):

| Button | Icon | Behaviour |
|--------|------|-----------|
| **Split** | Layout icon | Shows code editor AND preview side-by-side (default) |
| **Code** | Code icon | Hides the preview, shows only the editor full-width |
| **Preview** | Eye icon | Hides the editor, shows only the live preview full-width |

Next to that: a **Terminal** button that toggles the bottom terminal drawer open/closed.

#### Right Zone — Actions

| Element | Behaviour |
|---------|-----------|
| **Open Preview** link | Opens the sandbox preview URL in a new browser tab (external link icon) |
| **New** button | Prompts for confirmation, then resets the entire sandbox and returns to the Hero screen |
| **Theme Toggle** | Sun/moon icon — same behaviour as on the Hero page |

---

### Left Sidebar

> Rendered as `<aside class="left-sidebar">` in `src/App.jsx`

A fixed-width panel on the left edge of the workspace. Has two tabs at the top:

| Tab | Icon | Content |
|-----|------|---------|
| **AI Prompt** | MessageSquare icon | Opens the Chat Panel |
| **Explorer** | FolderTree icon | Opens the File Explorer |

Only one tab is active/visible at a time.

---

#### AI Prompt Tab (Chat Panel)

> **Component:** `src/components/ChatPanel.jsx`

The primary way users interact with the AI. Top portion is a scrollable **message feed**, bottom portion is the **input area**.

##### Message Feed
Messages alternate between two styles:

- **User messages** — styled with a User icon and the label "You"
- **AI messages** — styled with a Sparkles icon and the label "Assistant", rendered with a lightweight inline Markdown parser that supports:
  - `### H3` / `## H2` / `# H1` headings
  - `**bold**` text
  - `` `inline code` ``
  - Bullet lists (`-` / `*`)
  - Numbered lists (`1. 2. 3.`)
  - Blank line spacers

##### Live Stream Log Panel
While the AI is generating, a **live log panel** appears below the messages with:
- A spinning loader + **"Agent working…"** heading
- A **"Live"** glowing badge (top right of the log panel)
- A growing list of **completed log steps**, each preceded by a ✓ `CheckCircle2` icon
- The **currently running** log line highlighted in accent colour with a spinning `Loader2` icon

This is where you see messages like:
```
✓ Listing files in project directory...
✓ Reading files... src/App.jsx, src/App.css
⟳ Updating files... src/App.jsx, src/App.css, src/index.css   ← (spinning, in progress)
```

And if Mistral fails, you'll also see fallback messages like:
```
✓ ⚠️ Mistral rate-limited or timed out after 2 attempt(s).
✓ 🔄 Falling back to Puter (Gemini)...
⟳ ⚡ Puter is now generating your project — this may take a moment...
```

##### Input Area
At the very bottom of the sidebar:
- A **textarea** for typing prompts (`Shift+Enter` for newlines, `Enter` to send)
- A **Send button** (arrow icon), replaced with a spinner while generating
- Three **quick-suggestion chips** below the textarea:
  - `theme modes` → sends "Add light and dark theme mode with animations"
  - `responsive layout` → sends "Improve layout responsiveness and mobile accessibility"
  - `interactive states` → sends "Add interactive states and subtle hover animations"

---

#### Explorer Tab (File Explorer)

> **Component:** `src/components/FileExplorer.jsx`

Displays all files inside the running sandbox as a **tree view**.

| Element | Description |
|---------|-------------|
| **Header** | "Sandbox Files" title + a **Refresh** button (fetches the latest file list from the sandbox) |
| **Search/Filter box** | A text input that live-filters the file tree by filename |
| **File Tree** | Hierarchical tree built from flat file paths. Folders can be expanded/collapsed by clicking. |

##### File Icons
Each file type gets a distinct icon:

| Extension | Icon |
|-----------|------|
| `.jsx` `.js` `.tsx` `.ts` | FileCode (orange/JS coloured) |
| `.css` `.scss` | FileCode (blue/CSS coloured) |
| `.json` | FileJson |
| `.html` | FileText |
| `.png` `.svg` `.jpg` | Image icon |
| Everything else | FileText |

##### Active File Highlight
The currently open file is highlighted with an active state (`.tree-node.active`).

---

### Main Content Area

> Rendered as `<main class="content-area">` in `src/App.jsx`

The large right portion of the workspace. Split into two panels side by side (in **Split** layout mode):

---

#### Code Editor

> **Component:** `src/components/CodeEditor.jsx`

A custom-built code editor — no external editor library. Uses a plain `<textarea>` paired with a manually generated line-numbers column.

##### Tab Bar
A row of **open file tabs** across the top. Each tab shows:
- The file name (e.g. `App.jsx`)
- An **orange dot** (`.unsaved-dot`) if the file has unsaved changes
- An **✕ close button** on hover

Clicking a tab makes it the active file. Tabs persist as long as you don't close them.

##### Toolbar
Below the tab bar, a thin bar shows:
- **File path label** (e.g. `src/App.jsx`)
- **Save status indicator** — either:
  - `• Unsaved changes` (amber text)
  - `✓ Saved` (green text + checkmark icon)
- **Save button** — only enabled when there are unsaved changes. Also triggered by `Ctrl+S` / `Cmd+S` globally.

##### Editor Canvas
The main editing area:
- **Line numbers** column on the left (auto-generated, always in sync with the textarea content)
- **Textarea** on the right — full, editable content. Plain monospace text, spell-check disabled.

##### Empty State
When no file is open (no tabs), a centred placeholder shows a large faded `FileCode` icon with the message:
> *"Select a file from the explorer to open in code editor"*

---

#### Live Preview Panel

> **Component:** `src/components/PreviewPanel.jsx`

A browser-within-the-browser that renders the user's running sandbox application.

##### Address Bar (fake browser chrome)
A styled address bar at the top mimicking a real browser:
- **Reload button** (RotateCw icon) — forces an iframe reload
- **URL display** — lock icon + the sandbox preview URL + a **Copy** button
- **Viewport switcher** — three buttons to switch iframe width:

| Button | Icon | Width |
|--------|------|-------|
| **Desktop** | Monitor | Full width |
| **Tablet** | Tablet | 768px |
| **Mobile** | Smartphone | 375px |

##### Preview Iframe
The sandbox application is loaded inside an `<iframe>` with permissions for full interactivity (`allow-scripts`, `allow-forms`, `allow-popups`, etc.). Hot reloads from the Vite dev server inside the sandbox propagate automatically through the iframe.

##### Loading Placeholder
If the `previewUrl` isn't available yet, a centred spinning `RefreshCw` icon is shown with:
> *"Connecting to Sandbox Preview Stream..."*

---

### Terminal Drawer

> **Component:** `src/components/TerminalPanel.jsx`

A collapsible panel at the **bottom of the workspace**, below the editor and preview panels. Powered by `xterm.js` + `FitAddon`, connected to the sandbox backend via **Socket.io** in real time.

##### Drag-to-Resize Handle
A thin horizontal bar at the very top of the open terminal. You can:
- **Click and drag** it up or down to resize the terminal height (min: 100px, max: 80% of viewport height)
- **Double-click** to snap back to the default height (220px)

While dragging, `cursor: row-resize` is applied globally so the cursor stays correct even as the mouse moves outside the handle.

##### Terminal Header Bar

| Element | Description |
|---------|-------------|
| Terminal icon + title | "Knit Dev Terminal (xterm.js)" |
| Status dot | Small coloured circle — **green** = connected, **red/orange** = offline/standby |
| Status text | "Connected" (green) or "Offline / Standby" (red/pink) |
| **Clear** button | Trash icon — clears all terminal output |
| **Reconnect** button | RefreshCw icon — manually triggers a Socket.io reconnection attempt |
| **Collapse/Expand** button | ChevronDown (open) / ChevronUp (collapsed) — hides or reveals the terminal body |

##### Terminal Body
The `xterm.js` terminal instance rendered inside the drawer:
- Blinking cursor
- Font: JetBrains Mono → Fira Code → Consolas → monospace (13px, 1.4 line-height)
- 1000-line scrollback buffer
- All keyboard input is captured and sent to the sandbox backend via the `terminal-input` socket event
- Output from the backend arrives via `terminal-output` and is written directly to the terminal
- **Theme-aware** — the full colour palette (background, foreground, cursor, selection, ANSI colours) shifts when the user toggles light/dark mode

On first connect, the terminal greets with:
```
🚀 Knit Dev Terminal Session Connected
Socket Event Channel: terminal-input / terminal-output

✔ Connected to agent socket backend
```

##### Offline Fallback
If the socket is not yet connected or fails, the terminal still accepts input locally. Typing a command and pressing `Enter` acknowledges it with:
```
Command: <your command>
Output: [Knit Dev shell mode - command acknowledged]
```
This ensures the UI never looks broken even before the socket handshake completes.

---

## Theme System

The app supports **dark** and **light** themes throughout. The selected theme is:
- **Persisted** in `localStorage` under the key `knit-theme`
- **Auto-detected** from `prefers-color-scheme` on first visit if no preference is saved
- **Applied** as a `data-theme` attribute on the `<html>` element, so all CSS custom properties update globally

#### Transition Animation
The toggle uses the **View Transitions API** for a smooth circular reveal effect, expanding from the exact pixel where the user clicked:

| Direction | Effect |
|-----------|--------|
| Dark → Light | A bright circle expands outward from the click point |
| Light → Dark | The old (light) view collapses inward, revealing dark beneath |

Animation duration: **450ms**, easing: `cubic-bezier(0.4, 0, 0.2, 1)`.

The terminal also re-applies its full `xterm.js` colour theme object (background, foreground, cursor, ANSI colours) whenever the theme changes.

---

## Component Map

| Component File | Role | Shown on |
|----------------|------|----------|
| `src/components/Hero.jsx` | Full landing page | Hero screen only |
| `src/components/KnitLogo.jsx` | SVG logo mark (woven knot icon) | Both screens |
| `src/components/Header.jsx` | Top navigation bar with layout controls | Workspace only |
| `src/components/ChatPanel.jsx` | AI prompt textarea + message feed + live logs | Workspace → Sidebar (AI tab) |
| `src/components/FileExplorer.jsx` | Hierarchical file tree browser + search | Workspace → Sidebar (Explorer tab) |
| `src/components/CodeEditor.jsx` | Tabbed code editor with line numbers + save | Workspace → Main area (left pane) |
| `src/components/PreviewPanel.jsx` | Live iframe preview with viewport switcher | Workspace → Main area (right pane) |
| `src/components/TerminalPanel.jsx` | xterm.js terminal drawer with drag resize | Workspace → Bottom drawer |
| `src/App.jsx` | Root controller — all state, routing Hero↔Workspace | Both (orchestrator) |
