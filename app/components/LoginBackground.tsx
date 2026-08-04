// The login page background is the client-supplied reference image
// (public/images/login-bg.png) rendered at its natural aspect ratio — no
// hand-drawn artwork, no animation. It sizes the section itself (full
// width, height following from the image's own 3:2 ratio). The client
// has erased both the mockup card and the mockup logo from the image
// itself, so the real login card (positioned in login/page.tsx at the
// same top-[15%] coordinate) and the real fm-lockup.png logo just sit
// directly on the artwork — no cover patches needed.
//
// Visible only from `xl` up: the card's own height is fixed in pixels,
// but its position (and the logo's) is a % of the image's height. As the
// image gets shorter, the fixed-height card eats a proportionally bigger
// slice of it and runs into the logo. Measured the actual crossover:
// card bottom reaches the logo's top edge (70% — the logo's own height
// eats into its top-[79%] center point too) right around 1090px wide.
// `xl` (1280px) clears that with real margin; `lg` (1024px) does not —
// verified both still overlapping at 1024px before landing on `xl`.
import Image from "next/image";
import loginBg from "../../public/images/login-bg.png";
import fmLockup from "../../public/images/fm-lockup.png";

export default function LoginBackground() {
  return (
    <div aria-hidden className="pointer-events-none relative hidden xl:block">
      {/* Natural aspect ratio (not `fill`/object-cover) — this is what
          lets the login card above position itself at the same percentage
          coordinates as the image's cleared card area and stay aligned at
          any viewport width. */}
      <Image src={loginBg} alt="" className="h-auto w-full" priority />

      {/* Sized as a % of the background image's own width (not a fixed
          px height) so it scales in lockstep with the image and the
          percentage-positioned card at every viewport width, instead of
          only lining up at the exact widths this was eyeballed against. */}
      <div className="absolute left-1/2 top-[79%] w-[21%] -translate-x-1/2 -translate-y-1/2">
        <Image src={fmLockup} alt="" className="h-auto w-full" />
      </div>
    </div>
  );
}
