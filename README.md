# Drive & Discover Dev

# Build an Interactive 3D Portfolio Website

You are an expert frontend/creative developer specializing in React, TypeScript, Three.js, React Three Fiber, WebGL, physics, animation, and highly interactive portfolio websites.

I want you to build a complete interactive 3D portfolio website inspired by the *concept* of Bruno Simon's portfolio: the visitor controls a small vehicle and drives around a 3D world to discover the owner's portfolio.

**Important:** Do NOT copy Bruno Simon's website, source code, assets, branding, layout, or visual identity. Use the concept of a drivable 3D portfolio as inspiration and create an original design.

The final result should be a professional portfolio that can actually be deployed and used as my personal developer/CV website.

---

# 1. SOURCE OF TRUTH

There is a file named:

`CV.pdf`

in the project root.

Read and analyze this CV before implementing the portfolio content.

Extract relevant information such as:

* Name
* Professional title
* Education
* University
* CGPA
* Work experience
* Internships
* Research experience
* Projects
* Final Year Project
* Technical skills
* Programming languages
* Frameworks
* Databases
* Cloud/DevOps technologies
* Achievements
* Certifications
* Awards
* GitHub
* LinkedIn
* Email
* Other relevant links

The CV is the **source of truth** for portfolio content.

Do not invent employment, education, projects, technologies, awards, links, or achievements.

If something is unclear in the CV, use a reasonable placeholder or leave it out rather than inventing information.

The portfolio should not simply dump the entire CV onto the screen. Convert the information into an interactive experience.

---

# 2. PRIMARY GOAL

Build a 3D interactive portfolio where the visitor:

1. Loads into a 3D environment.
2. Sees a vehicle.
3. Can drive the vehicle around the world.
4. Explores different areas of the map.
5. Encounters portfolio sections represented by buildings, signs, objects, or landmarks.
6. Interacts with those objects.
7. Opens attractive HTML/UI panels containing portfolio information.
8. Can access GitHub, LinkedIn, email, and other relevant links.
9. Can download the CV.
10. Can navigate the entire portfolio without needing to understand 3D graphics beforehand.

The experience should feel like an interactive game combined with a professional developer portfolio.

---

# 3. TECHNOLOGY STACK

Use:

* React
* TypeScript
* Vite
* Three.js
* React Three Fiber
* @react-three/drei
* Rapier physics for React Three Fiber
* React Router where appropriate
* CSS or a lightweight styling solution
* GSAP only where it meaningfully improves animations

Prefer stable, well-supported packages.

Before installing dependencies, inspect the existing project and reuse existing dependencies where appropriate.

Do not unnecessarily introduce large libraries.

---

# 4. PROJECT ARCHITECTURE

Create a clean and maintainable architecture.

Use a structure similar to:

src/
├── components/
│   ├── ui/
│   ├── portfolio/
│   ├── vehicle/
│   ├── world/
│   └── common/
│
├── scenes/
│   ├── MainScene.tsx
│   └── World.tsx
│
├── components/vehicle/
│   ├── Vehicle.tsx
│   ├── VehicleController.tsx
│   └── VehicleCamera.tsx
│
├── components/world/
│   ├── Road.tsx
│   ├── Building.tsx
│   ├── PortfolioZone.tsx
│   ├── Sign.tsx
│   └── Environment.tsx
│
├── components/portfolio/
│   ├── PortfolioPanel.tsx
│   ├── Education.tsx
│   ├── Experience.tsx
│   ├── Projects.tsx
│   ├── Research.tsx
│   ├── Skills.tsx
│   ├── Achievements.tsx
│   └── Contact.tsx
│
├── data/
│   └── portfolio.ts
│
├── hooks/
│   ├── useKeyboardControls.ts
│   ├── usePortfolioInteraction.ts
│   └── ...
│
├── store/
│   └── ...
│
├── assets/
│   ├── models/
│   ├── textures/
│   ├── audio/
│   └── ...
│
├── styles/
│   └── ...
│
├── App.tsx
└── main.tsx

Adjust this structure if there is a better architecture, but keep responsibilities separated.

---

# 5. DATA-DRIVEN PORTFOLIO

Do NOT hard-code portfolio information throughout components.

Create a central data structure such as:

`src/data/portfolio.ts`

Example concept:

```ts
export const portfolio = {
  personal: {
    name: "...",
    title: "...",
    location: "...",
    email: "...",
    github: "...",
    linkedin: "..."
  },

  education: [],

  experience: [],

  projects: [],

  research: [],

  skills: {
    languages: [],
    frameworks: [],
    tools: [],
    databases: [],
    cloud: []
  },

  achievements: []
}
```

Populate this from the CV.

Components should consume this data rather than containing duplicated text.

This will make the portfolio easy to update later.

---

# 6. WORLD DESIGN

Create an original 3D environment.

The world should contain several distinct areas.

Suggested structure:

## Spawn Area

The visitor starts here.

Include:

* Player vehicle
* Welcome sign
* Name
* Short professional introduction
* Instructions

Example:

"Welcome to my interactive portfolio."

Then:

"Drive around to explore."

---

## Education Zone

Create an area representing education.

Possible visual concept:

A modern university-style building.

Sign:

`EDUCATION`

When the player approaches it, show an interaction prompt.

Interaction:

`Press E to explore`

Opening it displays:

* University
* Degree
* Dates
* CGPA
* Relevant information from CV

---

## Experience Zone

Create several buildings/locations representing professional experience.

Each experience can have:

* Company
* Position
* Dates
* Description
* Technologies
* Responsibilities

Make each experience visually distinct.

---

## Projects Zone

This should be one of the main attractions.

Create multiple project locations.

Each project should be represented by something appropriate to the project.

For example:

* AI project → futuristic laboratory
* Web project → office/computer building
* Music project → music-themed building
* Cloud project → server/data-center building

When the visitor enters the interaction radius, show:

`Press E to view project`

Opening the project panel should show:

* Project name
* Description
* Technologies
* Key features
* Relevant links

If GitHub/demo links exist in the CV, display buttons for them.

---

# 7. FINAL YEAR PROJECT

If the CV contains a Final Year Project, give it a prominent location in the world.

It should feel more important than an ordinary project.

Create a landmark such as:

`PROJECT LAB`

or another original concept.

Inside the UI panel display:

* Project title
* Problem
* Solution
* Technologies
* Important technical concepts
* Results, if documented in the CV
* GitHub/demo/research links if available

Do not fabricate technical results.

---

# 8. RESEARCH ZONE

If research experience exists in the CV, create a dedicated research area.

Use a visual concept such as:

* Research laboratory
* Quantum/computing lab
* Data visualization area
* Observatory

depending on the actual CV content.

Display:

* Research title
* Institution/lab
* Supervisor, if explicitly listed
* Dates
* Research description
* Technologies/methodologies

Keep the information faithful to the CV.

---

# 9. SKILLS AREA

Create an interactive skills area.

Possible concept:

A futuristic technology hub.

Organize skills into categories such as:

* Languages
* Frontend
* Backend
* Databases
* Cloud
* DevOps
* AI/ML
* Tools

Do not create skill levels such as "Expert", "Advanced", etc. unless the CV explicitly provides them.

Instead, visually display technologies as cards, terminals, floating objects, or panels.

---

# 10. ACHIEVEMENTS

Create an achievements section if the CV contains meaningful achievements.

Examples could include:

* Awards
* Dean's List
* Academic achievements
* Scholarships
* Certifications

Represent these using trophies, medals, certificates, or another appropriate original visual theme.

---

# 11. CONTACT AREA

Create a final area for contacting the developer.

Display:

* Name
* Email
* LinkedIn
* GitHub
* Other links from CV

Buttons should open links appropriately.

Include:

`Download CV`

which downloads the actual CV PDF.

Do not create a fake CV.

Use the supplied `CV.pdf`.

---

# 12. VEHICLE

Implement a controllable vehicle.

Controls:

* W / Arrow Up → accelerate
* S / Arrow Down → reverse/brake
* A / Arrow Left → steer left
* D / Arrow Right → steer right
* Space → brake
* E → interact

Also support:

* WASD
* Arrow keys

The vehicle should have actual physics.

Use React Three Fiber + Rapier.

Do not simply translate the car's position manually unless necessary for fallback behavior.

The vehicle should:

* Accelerate smoothly
* Decelerate naturally
* Turn
* Have reasonable friction
* Collide with buildings/objects
* Stay on the world
* Feel responsive

Do not make the physics unnecessarily complicated.

Prioritize good user experience.

---

# 13. CAMERA

Use a third-person follow camera.

The camera should:

* Follow the vehicle smoothly
* Maintain a reasonable distance
* Look toward the vehicle
* Avoid extreme clipping
* Smoothly interpolate movement

Use damping/smoothing.

Allow a small amount of camera customization if useful.

---

# 14. INTERACTION SYSTEM

Create a reusable interaction system.

Objects should define:

* Interaction radius
* Interaction title
* Interaction action
* Optional icon

When the player enters the radius:

Display:

`Press E to interact`

Example:

```text
┌──────────────────────┐
│      PROJECTS        │
│                      │
│     Press E          │
│     to explore       │
└──────────────────────┘
```

The UI should disappear when the player leaves.

Do not require the player to click tiny 3D objects.

Keyboard interaction should be the primary interaction method.

---

# 15. PORTFOLIO UI

The 3D world should be visually immersive, but the actual text content should be presented using normal HTML/CSS UI rather than attempting to render long text inside Three.js.

When an interaction occurs:

* Dim the background slightly
* Open a polished portfolio panel
* Keep the 3D world visible behind it
* Allow the player to close it

Possible controls:

`ESC` → close panel

The UI should be:

* Modern
* Minimal
* Professional
* Responsive
* Easy to read
* Consistent

Avoid excessive glassmorphism.

Avoid making the UI look like a generic template.

---

# 16. INTRO / LOADING SCREEN

Create an initial loading screen.

It should display:

* Developer name
* "Interactive Portfolio"
* Loading progress
* Short instruction

Example:

```text
[NAME]

INTERACTIVE PORTFOLIO

Loading world... 72%
```

After loading:

```text
WASD / ARROWS
Drive

E
Interact

ESC
Close
```

Allow the user to enter the world.

---

# 17. PERFORMANCE

This is extremely important.

The portfolio must remain usable on normal laptops.

Implement:

* Efficient geometry
* Instancing where appropriate
* Reasonable texture sizes
* Lazy loading where useful
* Avoid unnecessary React re-renders
* Avoid excessive lights
* Avoid unnecessarily complex 3D models
* Dispose resources when appropriate
* Keep physics objects reasonable

Do not create hundreds of expensive dynamic objects unnecessarily.

The world should look good without destroying performance.

---

# 18. RESPONSIVE / MOBILE SUPPORT

The primary experience is desktop.

However, detect mobile devices.

On mobile, provide a simplified control interface.

For example:

```text
       ↑
   ←   ↓   →
```

and:

`INTERACT`

Do not allow mobile controls to interfere with the desktop keyboard system.

If full 3D mobile performance is problematic, gracefully reduce graphical complexity.

---

# 19. ACCESSIBILITY

Even though this is a 3D experience, important portfolio information must remain accessible.

Ensure:

* Text has sufficient contrast
* Buttons have clear labels
* Keyboard users can interact with UI panels
* ESC closes dialogs
* External links have meaningful labels
* Download CV button is accessible

Do not hide all information exclusively inside inaccessible 3D interactions.

Consider providing a small `View Portfolio` or `Menu` option that lets users access sections directly.

---

# 20. FALLBACK NAVIGATION

Create a small menu button in the UI.

The menu should provide direct access to:

* Home
* Education
* Experience
* Projects
* Research
* Skills
* Achievements
* Contact

This is important because not every visitor will want to drive around for 10 minutes.

The 3D world should be the primary experience, but the normal navigation should remain available.

---

# 21. VISUAL STYLE

Create an original visual identity.

Preferred direction:

* Modern
* Clean
* Slightly futuristic
* Developer/technology aesthetic
* Professional enough for recruiters
* Playful enough to encourage exploration

Use:

* Strong typography
* Controlled colors
* Good lighting
* Subtle environmental animation
* Clear signs
* Distinct zones

Do not blindly reproduce Bruno Simon's colors, terrain, buildings, vehicle, UI, or layout.

Create your own world.

---

# 22. AUDIO

If practical, add subtle audio:

* Engine sound
* UI interaction sound
* Environment ambience
* Optional background music

However:

* Audio must not autoplay aggressively.
* Respect browser autoplay restrictions.
* Provide a mute button.
* Keep audio optional.

If audio assets are unavailable, create the system so they can be added later.

---

# 23. 3D ASSETS

Initially prioritize functionality over asset quality.

If external assets are required:

* Prefer free/open-source assets with appropriate licenses.
* Keep assets lightweight.
* Store them locally in the project.
* Do not hotlink random assets from unreliable websites.

If suitable assets are unavailable, create simple procedural geometry.

For example:

* Boxes for buildings
* Cylinders for trees
* Simple road geometry
* Low-poly vehicle

The project must remain runnable without depending on external asset URLs.

---

# 24. WORLD MAP

Create a coherent map rather than scattering objects randomly.

Example:

```text
                    ┌───────────────┐
                    │   RESEARCH    │
                    │      LAB      │
                    └───────┬───────┘
                            │
                ┌───────────┴───────────┐
                │                       │
          ┌─────▼─────┐           ┌─────▼─────┐
          │  PROJECTS │           │  SKILLS   │
          └─────┬─────┘           └─────┬─────┘
                │                       │
                └──────────┬────────────┘
                           │
                     ┌─────▼─────┐
                     │   SPAWN   │
                     │   / HOME  │
                     └─────┬─────┘
                           │
                    ┌──────▼──────┐
                    │  EDUCATION  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ EXPERIENCE  │
                    └─────────────┘
```

This is only an example.

Design the actual map based on the information extracted from the CV.

---

# 25. OPENING EXPERIENCE

The first 10–20 seconds are important.

After loading:

1. Camera shows the world.
2. Vehicle is visible.
3. Name appears.
4. A short instruction appears.
5. Player starts driving.

Do not immediately overwhelm the visitor with menus.

---

# 26. EASTER EGGS

If appropriate, add a few subtle Easter eggs.

Examples:

* Hidden area
* Secret road
* Developer-themed object
* Small collectible
* Hidden message

Do not let Easter eggs interfere with the professional portfolio.

---

# 27. ERROR HANDLING

The application should fail gracefully.

Handle:

* WebGL unsupported
* Asset loading failure
* Audio loading failure
* Missing optional links
* Mobile limitations

If WebGL is unavailable, display a normal HTML portfolio fallback rather than a blank page.

---

# 28. SEO

Even though the site is primarily 3D, include normal SEO metadata:

* Page title
* Description
* Open Graph metadata
* Favicon
* Appropriate semantic HTML

Example concept:

`[Name] — Software Engineer | Interactive Portfolio`

Use the actual name and professional title from the CV.

---

# 29. SECURITY

Do not expose secrets.

Do not create API keys.

Do not place private credentials in frontend code.

All external links should be validated.

---

# 30. DEVELOPMENT PROCESS

Do not attempt to generate the entire project blindly in one enormous implementation.

Work incrementally.

Follow these phases:

## Phase 1 — Analyze

Read `CV.pdf`.

Summarize the extracted portfolio information internally.

Determine:

* Sections
* Projects
* Experiences
* Skills
* Research
* Links
* Appropriate world zones

Then create the portfolio data model.

---

## Phase 2 — Foundation

Set up:

* React
* TypeScript
* Vite
* React Three Fiber
* Drei
* Rapier

Ensure the application starts successfully.

---

## Phase 3 — 3D World

Create:

* Ground
* Roads
* Lighting
* Environment
* Buildings
* Spawn point

Make sure the world renders correctly.

---

## Phase 4 — Vehicle

Implement:

* Vehicle
* Physics
* Keyboard controls
* Camera
* Collision

Test driving thoroughly.

---

## Phase 5 — Interaction

Implement:

* Interaction detection
* Interaction prompt
* E key
* ESC
* Portfolio panels

---

## Phase 6 — Portfolio

Populate:

* Education
* Experience
* Projects
* Research
* Skills
* Achievements
* Contact

using the CV.

---

## Phase 7 — Polish

Add:

* Better models
* Lighting
* Animations
* Audio
* Particles
* Loading screen
* Transitions
* Responsive design

---

## Phase 8 — Performance

Profile the application.

Remove unnecessary:

* renders
* objects
* physics bodies
* textures
* effects

Optimize until the experience is smooth on a normal laptop.

---

## Phase 9 — Testing

Test:

* Chrome
* Edge
* Firefox if practical
* Desktop
* Mobile
* Keyboard controls
* Mouse
* Touch controls
* External links
* CV download
* Refreshing
* Direct navigation
* WebGL failure

Fix all obvious errors.

---

# 31. CODE QUALITY

Write production-quality code.

Requirements:

* TypeScript types
* Reusable components
* Clear naming
* Small components
* Avoid giant components
* Avoid duplicated logic
* Avoid unnecessary global state
* Comments only where they provide value
* No dead code
* No console errors
* No TypeScript errors

Do not use `any` unless absolutely unavoidable.

---

# 32. IMPORTANT RESTRICTIONS

Do NOT:

* Copy Bruno Simon's source code.
* Copy his assets.
* Copy his exact map.
* Copy his exact vehicle.
* Copy his branding.
* Claim this is Bruno Simon's design.
* Invent information that isn't in my CV.
* Put the entire CV into one boring page.
* Make the site dependent on external assets that can disappear.
* Overcomplicate the physics.
* Sacrifice usability purely for visual effects.

The goal is:

**An original, professional, interactive 3D developer portfolio inspired by the idea of driving through your portfolio.**

---

# 33. DEFINITION OF DONE

The project is complete when:

* `npm install` works.
* `npm run dev` works.
* The website loads without errors.
* The 3D world renders.
* The vehicle can be driven.
* The camera follows the vehicle.
* The vehicle collides with the environment.
* Portfolio locations are discoverable.
* E opens portfolio sections.
* ESC closes them.
* Portfolio content comes from the CV.
* Projects are represented individually.
* Experience is represented.
* Education is represented.
* Research is represented if present.
* Skills are represented.
* Contact links work.
* CV download works.
* The UI is responsive.
* There is a loading screen.
* There is a fallback/menu navigation.
* There are no obvious console errors.
* There are no TypeScript errors.
* Performance is reasonable.
* The design is original.

---

# 34. IMPORTANT EXECUTION INSTRUCTION

Before writing significant amounts of code:

1. Inspect the existing repository.
2. Inspect `CV.pdf`.
3. Determine the existing framework and dependencies.
4. Do not destroy useful existing code.
5. Create a short implementation plan.
6. Then implement the project incrementally.

After each major phase:

* Run the application.
* Check for build errors.
* Fix errors before continuing.

At the end:

Run the appropriate checks, such as:

```bash
npm run build
```

and any available lint/type-check commands.

Fix all errors you introduce.

Do not stop at a mockup.

I want a **working, polished, deployable application**, not merely a visual prototype.

About the CV im attaching it , and complete with everything do all the phases

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/cfcdc536-26e0-4e42-8821-98a961cf4db1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
