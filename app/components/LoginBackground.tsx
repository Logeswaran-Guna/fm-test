// The login page background is the client-supplied reference image
// (public/images/login-bg.png) rendered at its natural aspect ratio — no
// hand-drawn artwork, no animation. It sizes the section itself (full
// width, height following from the image's own 3:2 ratio), and the real
// login card is positioned on top of it in login/page.tsx at the same
// percentage coordinates as the image's own drawn mockup card, so the
// drawing underneath is simply covered by the real thing. The image's
// baked-in logo is covered by a soft patch here, with the real Future
// Minds logo file placed on top of that instead of a drawing of one.
import Image from "next/image";
import loginBg from "../../public/images/login-bg.png";
import fmLockup from "../../public/images/fm-lockup.png";

export default function LoginBackground() {
  return (
    <div aria-hidden className="pointer-events-none relative hidden md:block">
      {/* Natural aspect ratio (not `fill`/object-cover) — this is what
          lets the login card above position itself at the same percentage
          coordinates as the image's own drawn card and have them align at
          any viewport width. */}
      <Image src={loginBg} alt="" className="h-auto w-full" priority />

      {/* The real card (rendered by login/page.tsx, positioned at
          top-[15%]) is shorter than the mockup card drawn in the image, so
          on its own it wouldn't fully cover the drawing beneath it. This
          plate sits behind the real card and in front of the image,
          generously sized past the drawn card's bounds on every edge. */}
      <div className="absolute left-1/2 top-[13%] h-[62%] w-[40%] -translate-x-1/2 rounded-[2rem] bg-slate-50" />

      <div className="absolute left-1/2 top-[79%] h-[16%] w-[22%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-50 blur-2xl" />
      <div className="absolute left-1/2 top-[79%] -translate-x-1/2 -translate-y-1/2">
        <Image src={fmLockup} alt="" className="h-14 w-auto lg:h-16" />
      </div>
    </div>
  );
}
