// src/components/resume/editor/preview/scaling-wrapper.tsx
"use client";

import { ReactNode, useMemo } from "react";

// Letter size in pixels at 96 DPI
const LETTER_WIDTH_PX = 816; // 8.5 inches * 96 DPI
const LETTER_HEIGHT_PX = 1056; // 11 inches * 96 DPI

interface ScalingWrapperProps {
  children: ReactNode;
  containerWidth: number;
  className?: string;
}

/**
 * ScalingWrapper Component
 *
 * Wraps content and scales it to fit within the given container width
 * while maintaining the aspect ratio of a Letter-sized document (8.5" x 11").
 *
 * Uses CSS transform for smooth, performant scaling without layout thrashing.
 */
export function ScalingWrapper({
  children,
  containerWidth,
  className,
}: ScalingWrapperProps) {
  // Calculate the scale factor based on container width
  const { scale, scaledHeight } = useMemo(() => {
    // Add some padding (16px on each side = 32px total)
    const availableWidth = Math.max(containerWidth - 32, 100);
    const calculatedScale = availableWidth / LETTER_WIDTH_PX;

    // Clamp scale to reasonable bounds
    const clampedScale = Math.min(Math.max(calculatedScale, 0.3), 1.5);

    return {
      scale: clampedScale,
      scaledHeight: LETTER_HEIGHT_PX * clampedScale,
    };
  }, [containerWidth]);

  return (
    <div
      className={className}
      style={{
        // Container needs explicit height to prevent layout issues
        width: "100%",
        minHeight: scaledHeight + 32, // Add padding
        display: "flex",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          // Fixed size container at original document dimensions
          width: LETTER_WIDTH_PX,
          height: LETTER_HEIGHT_PX,
          // Scale transform from top-center
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          // Prevent blurry text during scaling
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default ScalingWrapper;
