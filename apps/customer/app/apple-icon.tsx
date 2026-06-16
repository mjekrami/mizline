import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1A1210",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: "#EDE7DE",
            letterSpacing: "-0.05em",
          }}
        >
          M
        </div>
      </div>
    ),
    { ...size },
  );
}
