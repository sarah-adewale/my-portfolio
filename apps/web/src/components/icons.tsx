// Small inline icons. They inherit colour from the text.

type IconProps = React.SVGProps<SVGSVGElement>;

const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function MoonIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function GitHubIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" {...props}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

// A gull-wing DeLorean in profile, for the trip back to the old portfolio
export function DeLoreanIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 64 28" aria-hidden {...props}>
      {/* body */}
      <path
        fill="currentColor"
        d="M2 19.5 3 15.6 24 12.4 31 7h14l13 4 4 1.6v6.9h-7a5 5 0 0 0-10 0H20a5 5 0 0 0-10 0Z"
      />
      {/* windows and rear louvres */}
      <path fill="var(--bg)" d="M26.2 12.2 32 8.4h11v3.8Z" />
      <path stroke="var(--bg)" strokeWidth="0.9" d="M46.5 8.6l1 3M49.5 9.4l.9 2.6M52.5 10.3l.7 2" />
      {/* door line and side strip */}
      <path stroke="var(--bg)" strokeWidth="0.7" d="M5 16.2l56-1.4M24 12.6v6.5M44 12.3v6.8" />
      {/* lights */}
      <path fill="#fbbf24" d="M2.6 16.2h2.6v1.4H2.4Z" />
      <path fill="#ff2d3f" d="M60.4 13.4H62v2h-1.6Z" />
      {/* wheels */}
      {[15, 50].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={20} r={4.2} fill="currentColor" stroke="var(--bg)" strokeWidth={1.2} />
          <circle cx={cx} cy={20} r={1.4} fill="var(--bg)" />
        </g>
      ))}
      {/* flux trail */}
      <path stroke="#93c5fd" strokeWidth="0.8" strokeLinecap="round" opacity="0.8" d="M10 26.2h44M18 27.4h28" />
    </svg>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h8" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
    </svg>
  );
}

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} strokeWidth={2} width={12} height={12} {...props}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export function ArrowDownIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} strokeWidth={2} width={12} height={12} {...props}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </svg>
  );
}
