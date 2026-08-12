import { ImageResponse } from "next/og";
import { OgImageElement, ogImageContentType, ogImageSize } from "@/lib/ogImage";

export const size = ogImageSize;
export const contentType = ogImageContentType;

export default function TwitterImage() {
  return new ImageResponse(<OgImageElement />, size);
}
