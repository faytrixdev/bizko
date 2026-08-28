# Phase 3: Premium Card Styling - Design

## Goal
Update all 5 dashboard tab components to have more premium-looking cards with better shadows, rounded corners, and hover states.

## Scope
- 5 tab components: TabOverview, TabServices, TabPortfolio, TabSocials, TabSettings
- Main container cards AND inner elements (URL box, analytics cards, service items, portfolio items, social items, input fields)

## Design Changes

### Global Card Treatment
- Border: `border border-gray-100` (subtle)
- Shadow: `shadow-sm` default
- Hover: `hover:shadow-md transition-shadow duration-300`
- Border radius: `rounded-2xl` (softer)
- Padding: `p-6` (more spacious)
- Section titles: `text-xs font-semibold text-gray-900 uppercase tracking-wider`

### Per-File Specifics

#### TabOverview.tsx
- Share card: Main container gets global treatment
- URL box: Keep existing styling (already has bg-gray-50)
- Analytics card: Main container gets global treatment
- Analytics inner cards: Keep existing (already have bg-gray-50 and bg-gray-900)

#### TabServices.tsx
- Main card: Global treatment
- Service items: `border border-gray-100 bg-gray-50/50 rounded-xl`
- Button: Add `transition-all duration-200 hover:shadow-sm`

#### TabPortfolio.tsx
- Main card: Global treatment
- Portfolio images: `rounded-xl` instead of `rounded-lg`
- Add `hover:ring-2 hover:ring-gray-200 transition-all duration-300`

#### TabSocials.tsx
- Main card: Global treatment
- Social items: `border border-gray-100 bg-gray-50/50 rounded-xl`

#### TabSettings.tsx
- Main card: Global treatment
- Inputs: Add `focus:ring-2 focus:ring-gray-900/10 transition-all duration-200`
- Save button: Add `transition-all duration-200 hover:shadow-sm active:scale-[0.98]`

## Implementation Order
1. TabOverview.tsx
2. TabServices.tsx
3. TabPortfolio.tsx
4. TabSocials.tsx
5. TabSettings.tsx

## Verification
- Run `npm run lint` after changes
- Visual inspection of card depth and hover states