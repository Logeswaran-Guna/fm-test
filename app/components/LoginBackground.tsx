// The login page background is the client-supplied reference image
// (public/images/login-bg.png) rendered at its natural aspect ratio — no
// hand-drawn artwork, no animation. It sizes the section itself (full
// width, height following from the image's own 3:2 ratio). The client
// has erased both the mockup card and the mockup logo from the image
// itself, so the real login card (positioned in login/page.tsx at the
// same top-[15%] coordinate) and the real fm-lockup.png logo just sit
// directly on the artwork — no cover patches needed.
import Image from "next/image";
import loginBg from "../../public/images/login-bg.png";
import fmLockup from "../../public/images/fm-lockup.png";

export default function LoginBackground() {
  return (
    <div aria-hidden className="pointer-events-none relative hidden md:block">
      {/* Natural aspect ratio (not `fill`/object-cover) — this is what
          lets the login card above position itself at the same percentage
          coordinates as the image's cleared card area and stay aligned at
          any viewport width. */}
      <Image src={loginBg} alt="" className="h-auto w-full" priority />

      <div className="absolute left-1/2 top-[79%] -translate-x-1/2 -translate-y-1/2">
        <Image src={fmLockup} alt="" className="h-24 w-auto sm:h-28 lg:h-32" />
      </div>
    </div>
  );
}
