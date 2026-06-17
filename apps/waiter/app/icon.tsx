import { ImageResponse } from "next/og";

export const contentType = "image/png";

export function generateImageMetadata() {
  return [
    {
      id: "192",
      size: { width: 192, height: 192 },
      contentType: "image/png",
      alt: "Mizline Waiter",
    },
    {
      id: "512",
      size: { width: 512, height: 512 },
      contentType: "image/png",
      alt: "Mizline Waiter",
    },
  ];
}

type IconProps = {
  id: string;
};

export default function Icon({ id }: IconProps) {
  const size = id === "512" ? 512 : 192;
  const fontSize = id === "512" ? 220 : 96;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050403",
          borderRadius: size * 0.22,
        }}
      >
        <div
          style={{
            fontSize,
            fontWeight: 700,
            color: "#c4956a",
            letterSpacing: "-0.05em",
          }}
        >
          W
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
