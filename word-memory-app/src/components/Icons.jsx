// Minimal inline SVG icon set (stroke = currentColor). Keeps the app offline.

function Svg({ children, className, size = 20 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const IconHome = (p) => (
  <Svg {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
    <path d="M9.5 21v-6h5v6" />
  </Svg>
)

export const IconCards = (p) => (
  <Svg {...p}>
    <rect x="4" y="4" width="13" height="13" rx="2.5" />
    <path d="M8 20h9a3 3 0 0 0 3-3V8" />
  </Svg>
)

export const IconTarget = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="0.6" />
  </Svg>
)

export const IconBook = (p) => (
  <Svg {...p}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
    <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5A2.5 2.5 0 0 1 4 20.5z" />
  </Svg>
)

export const IconChart = (p) => (
  <Svg {...p}>
    <path d="M4 20V10" />
    <path d="M9.5 20V4" />
    <path d="M15 20v-7" />
    <path d="M20.5 20V8" />
  </Svg>
)

export const IconFlame = (p) => (
  <Svg {...p}>
    <path d="M12 3s5 4.2 5 8.6a5 5 0 0 1-10 0c0-1.6.7-2.9 1.6-3.9.4 1 1.1 1.7 2 2C10.3 8 12 5.6 12 3z" />
  </Svg>
)

export const IconSearch = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </Svg>
)

export const IconCheck = (p) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </Svg>
)

export const IconX = (p) => (
  <Svg {...p}>
    <path d="M6 6 18 18M18 6 6 18" />
  </Svg>
)

export const IconRotate = (p) => (
  <Svg {...p}>
    <path d="M20 11a8 8 0 1 0-2.3 5.7" />
    <path d="M20 4v7h-7" />
  </Svg>
)

export const IconTrophy = (p) => (
  <Svg {...p} size={p && p.size ? p.size : 28}>
    <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
    <path d="M7 5H4.5a2.5 2.5 0 0 0 2.5 5" />
    <path d="M17 5h2.5a2.5 2.5 0 0 1-2.5 5" />
    <path d="M12 14v3" />
    <path d="M8.5 21h7l-.7-4h-5.6z" />
  </Svg>
)

export const IconClock = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
)

export const IconAlert = (p) => (
  <Svg {...p}>
    <path d="M10.3 3.9 2.6 17.4A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3.1L13.7 3.9a2 2 0 0 0-3.4 0z" />
    <path d="M12 9v4" />
    <path d="M12 16.5h.01" />
  </Svg>
)

export const IconLayers = (p) => (
  <Svg {...p}>
    <path d="m12 3 9 5-9 5-9-5z" />
    <path d="m3 13 9 5 9-5" />
  </Svg>
)

export const IconArrowRight = (p) => (
  <Svg {...p}>
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </Svg>
)

export const IconPencil = (p) => (
  <Svg {...p}>
    <path d="M15.5 5.5 18.5 8.5" />
    <path d="M4 20l4-1L19.5 7.5a2 2 0 0 0-3-3L5 16z" />
  </Svg>
)

export const IconList = (p) => (
  <Svg {...p}>
    <path d="M8 6h13M8 12h13M8 18h13" />
    <path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
  </Svg>
)

export const IconText = (p) => (
  <Svg {...p}>
    <path d="M4 6h16M4 12h10M4 18h13" />
  </Svg>
)
