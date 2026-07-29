# Frontend Documentation

## Technology Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + HeroUI components
- **Animations**: Framer Motion
- **Routing**: React Router DOM

## Application Structure
- `src/components/`: Reusable UI components (Buttons, Cards, Inputs).
- `src/pages/`: Top-level route components (Dashboard, Authenticate, ExperimentalLab).
- `src/context/`: React Context providers for global state (Theme, Auth, Workbench).
- `src/hooks/`: Custom React hooks for API interaction and business logic.
- `src/utils/`: Formatting and helper functions.

## Key Features
1. **Dynamic Authentication UI**: Real-time updates during the multi-step QPS/1.0 authentication flow, displaying quantum state exchange without exposing secrets.
2. **Experimental Lab**: Visualizes comparisons between Classical, Aer, and IBM Quantum engines, including QBER, execution time, and noise/interception analysis.
3. **BB84 Workbench**: An interactive educational tool detailing the step-by-step BB84 protocol (Encoding, Transmission, Measurement, Sifting, Key Generation).

## State Management
State is largely managed locally within components for transient data, and elevated to React Context for application-wide data (like the active user session or theme preferences).
