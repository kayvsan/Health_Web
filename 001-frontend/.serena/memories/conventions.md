# Conventions

- **Component Structure**: Functional React components using ES6 arrow functions or default functions.
- **Styling**: Tailwind CSS classes combined with CSS variables (`var(--primary)`, `var(--hairline)`, etc.) for a clean look.
- **State Management**: Use Zustand stores for global states like system settings, monitor configurations, and authentication.
- **Charts**: Recharts charts are wrapped in a `ResponsiveContainer`. Because of Recharts v3 ResizeObserver behaviors, always specify `initialDimension={{ width: 100, height: 100 }}` to prevent console warnings on initial layout.
