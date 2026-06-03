<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:session-summary -->
# Session Summary (2026-06-03)

## Goal
Implement full bilingual support (Arabic/English) for the entire PMS application, fix DPR display, login blocking, and user management issues.

## Completed
### i18n Infrastructure
- Created `lib/i18n/context.tsx` with `LanguageProvider` + `useLanguage()` hook
- Created `lib/i18n/translations/ar.json` (~1000 lines) and `en.json` (~1000 lines) covering all modules
- Created `app/Providers.tsx` wrapping root layout with LanguageProvider
- Created `app/components/LanguageSwitcher.tsx` toggle button
- Locale persisted in `localStorage` under `pms_locale` key

### Pages Translated
All pages in `frontend/src/app/dashboard/` and `page.tsx` (login):
- Login page
- Sidebar navigation (nav labels, logout, LanguageSwitcher)
- Dashboard
- Projects (list, create, edit, detail with tabs, budget)
- Invoices (list, create, edit, detail/view with print template)
- Contracts (list, create, edit, change-orders)
- Purchases (list, create, edit, detail/view with print template)
- Expenses
- DPR (create, edit)
- Users management (with assign project modal)
- Reports Center
- Analytics (P&L)
- Inventory (warehouse management, GRN, MIS)
- BOQ (items, import, print)
- Quotations (list, create, detail with templates)
- Contacts (suppliers & clients)
- Settings (main, company, Daftra integration, templates, mappings, roles)

### Bug Fixes
- Invoice PDF capture: `box-sizing: border-box` + white overlay on letterhead
- Reduced font sizes for A4 fit
- DPR PATCH endpoint + edit page with pre-filled form
- Changed "عرض" button from dead `<button>` to `<Link>`
- Removed device authorization gate from login
- Quick-toggle `isActive` on users table + check in auth service

## Key Decisions
- Custom React context i18n (not next-intl) to avoid breaking routes
- `labelKey` approach in sidebar - store key, resolve with `t()` at render
- `"use client"` directive on all pages using `useLanguage()`
- No `[lang]` URL prefix - locale is localStorage-only

## Relevant Files
- `frontend/src/lib/i18n/context.tsx` — core i18n provider
- `frontend/src/lib/i18n/translations/ar.json` — Arabic translations
- `frontend/src/lib/i18n/translations/en.json` — English translations
- `frontend/src/app/Providers.tsx` — client provider wrapper
- `frontend/src/app/components/LanguageSwitcher.tsx` — toggle button
- `frontend/src/app/page.tsx` — login page (translated)
- `frontend/src/app/dashboard/layout.tsx` — sidebar nav (translated)
- `frontend/src/app/globals.css` — `.print-on-letterhead` fix
- `backend/src/auth/auth.service.ts` — isActive check
- `backend/src/daily-reports/` — PATCH endpoint added
<!-- END:session-summary -->
