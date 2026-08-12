export const ogImageSize = { width: 1200, height: 630 };
export const ogImageContentType = "image/png";

export function OgImageElement() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "80px",
        backgroundColor: "#0a192f",
        backgroundImage:
          "radial-gradient(circle at 85% 20%, rgba(245,158,11,0.35), transparent 55%)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 84,
          height: 84,
          borderRadius: 20,
          backgroundColor: "#f59e0b",
          color: "#0a192f",
          fontSize: 42,
          fontWeight: 700,
        }}
      >
        FM
      </div>
      <div
        style={{
          marginTop: 40,
          fontSize: 64,
          fontWeight: 700,
          color: "#ffffff",
          lineHeight: 1.1,
        }}
      >
        Future Minds
      </div>
      <div
        style={{
          marginTop: 20,
          fontSize: 30,
          color: "#f59e0b",
          fontWeight: 600,
        }}
      >
        Managed Tutor Marketplace
      </div>
      <div
        style={{
          marginTop: 14,
          fontSize: 24,
          color: "rgba(255,255,255,0.65)",
          maxWidth: 820,
        }}
      >
        We hand-pick the right educator, coordinate the demo, and only release payment once the class is confirmed.
      </div>
    </div>
  );
}
