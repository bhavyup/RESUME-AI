import { useState, useEffect, useCallback } from "react";
import { Font } from "@react-pdf/renderer";

const GOOGLE_FONTS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY;

// 1. BLOCKLIST: Fonts known to be Variable-Only or Broken in React-PDF
// We filter these out of the list entirely.
const BROKEN_FONTS = new Set([
  "JetBrains Mono",
  "Geist",
  "Geist Mono",
  "Raleway",
  "Playfair Display", // Often variable
  "Merriweather Sans", // Often variable
]);

export interface FontCapabilities {
  hasRegular: boolean;
  hasBold: boolean;
  hasItalic: boolean;
  hasBoldItalic: boolean;
}

export interface GoogleFont {
  family: string;
  variants: string[];
  files: { [variant: string]: string };
  category: string;
}

interface FontSrc {
  src: string;
  fontStyle?: "normal" | "italic";
  fontWeight?: "normal" | "bold" | number;
}

export function useGoogleFonts() {
  const [fontList, setFontList] = useState<GoogleFont[]>([]);
  const [loadedFonts, setLoadedFonts] = useState<Map<string, FontCapabilities>>(
    new Map()
  );

  // 1. Fetch and Filter Font List
  useEffect(() => {
    const fetchFonts = async () => {
      if (!GOOGLE_FONTS_API_KEY) return;

      try {
        const res = await fetch(
          `https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONTS_API_KEY}&sort=popularity`
        );
        const data = await res.json();

        // FILTER: Remove broken fonts immediately
        const safeFonts = (data.items || [])
          .filter((f: GoogleFont) => !BROKEN_FONTS.has(f.family))
          .slice(0, 200); // Top 200 safe fonts

        setFontList(safeFonts);
      } catch (error) {
        console.error("Failed to fetch Google Fonts list", error);
      }
    };

    fetchFonts();
  }, []);

  // 2. Load and Analyze Font
  const loadFontForPDF = useCallback(
    async (fontFamily: string): Promise<FontCapabilities | null> => {
      // Check Cache
      if (loadedFonts.has(fontFamily)) {
        return loadedFonts.get(fontFamily)!;
      }

      // Standard fonts are always fully capable
      if (["Helvetica", "Times-Roman", "Courier"].includes(fontFamily)) {
        return {
          hasRegular: true,
          hasBold: true,
          hasItalic: true,
          hasBoldItalic: true,
        };
      }

      const fontData = fontList.find((f) => f.family === fontFamily);
      if (!fontData) return null;

      const files = fontData.files;
      const sources: FontSrc[] = [];

      // 3. CALCULATE CAPABILITIES
      // We only say "true" if the file actually exists in the API response
      const caps: FontCapabilities = {
        hasRegular: false,
        hasBold: false,
        hasItalic: false,
        hasBoldItalic: false,
      };

      const toHttps = (url: string) => url.replace("http:", "https:");

      // A. Regular
      if (files["regular"]) {
        sources.push({ src: toHttps(files["regular"]), fontWeight: "normal" });
        caps.hasRegular = true;
      }

      // B. Bold (Try 700, fallback to 600 or 800)
      const boldKey = ["700", "600", "800"].find((k) => files[k]);
      if (boldKey) {
        sources.push({ src: toHttps(files[boldKey]), fontWeight: "bold" });
        caps.hasBold = true;
      }

      // C. Italic
      if (files["italic"]) {
        sources.push({ src: toHttps(files["italic"]), fontStyle: "italic" });
        caps.hasItalic = true;
      }

      // D. Bold Italic
      const biKey = ["700italic", "600italic", "800italic"].find(
        (k) => files[k]
      );
      if (biKey) {
        sources.push({
          src: toHttps(files[biKey]),
          fontWeight: "bold",
          fontStyle: "italic",
        });
        caps.hasBoldItalic = true;
      }

      // 4. Register only if we have at least Regular
      if (sources.length > 0) {
        try {
          Font.register({
            family: fontData.family,
            fonts: sources,
          });

          setLoadedFonts((prev) => new Map(prev).set(fontFamily, caps));
          return caps;
        } catch (e) {
          console.warn(`Error registering font ${fontFamily}`, e);
        }
      }
      return null;
    },
    [fontList, loadedFonts]
  );

  return { fontList, loadFontForPDF };
}
