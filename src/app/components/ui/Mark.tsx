import { BLUE } from "@/app/constants/pulsarData";

export default function Mark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M1 12h6l2-9 4 18 3-9h7" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}