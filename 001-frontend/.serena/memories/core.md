# Core Information

## Source Map
- `src/main.jsx` - App entry point.
- `src/App.jsx` - Main App layout and Router definition.
- `src/pages/` - Application pages:
  - `Dashboard.jsx` - Overview of system metrics & recent incidents.
  - `Monitors.jsx` - List of endpoints with monitoring.
  - `MonitorDetail.jsx` - Detailed uptime, performance, and content history charts.
  - `ContentChanges.jsx` - Tracks changes in page content.
  - `Settings.jsx` - App settings configuration.
- `src/components/` - Shared layouts & components:
  - `layout/` - Header, Sidebar, and general Layout wrappers.
  - `common/` - Reusable UI widgets: StatusBadge, StatCard, LoadingSpinner, EmptyState, Modal.
- `src/data/mockData.js` - Sample statistics and history data.

## Project Invariants
- Frontend is running on port 5173 (standard Vite React app dev server).
- Clean code architecture: Page container views are inside `src/pages/`, and pure presenter components are in `src/components/`.
