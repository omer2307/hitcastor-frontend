"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Helper function to resolve CSS variables and convert colors to rgba format
function resolveColor(color: string): string {
  // Create a temporary element to compute the color
  const temp = document.createElement("div");
  temp.style.color = color;
  document.body.appendChild(temp);
  const computed = window.getComputedStyle(temp).color;
  document.body.removeChild(temp);
  return computed; // Returns in rgb/rgba format that Canvas understands
}

interface GradientBlurProps extends React.HTMLAttributes<HTMLDivElement> {
  radius?: number;
  opacityDecay?: number;
  backgroundColor?: string;
  color?: string;
  colorGenerator?: (x: number, y: number) => string;
}

export function GradientBlur({
  radius = 150,
  opacityDecay = 0.9,
  backgroundColor = "transparent",
  color,
  colorGenerator,
  className,
  children,
  ...props
}: GradientBlurProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    container.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create gradient centered at mouse position
      const gradient = ctx.createRadialGradient(
        mousePos.x,
        mousePos.y,
        0,
        mousePos.x,
        mousePos.y,
        radius
      );

      // Determine color based on custom generator or provided color
      let gradientColor = colorGenerator
        ? colorGenerator(mousePos.x, mousePos.y)
        : color || "hsl(340 85% 65%)"; // fallback to actual primary color value

      // Resolve CSS variables to actual colors
      const resolvedColor = resolveColor(gradientColor);
      
      // Parse the rgba/rgb value to add transparency
      const rgbaMatch = resolvedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      
      if (rgbaMatch) {
        const [, r, g, b] = rgbaMatch;
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.6)`);
        gradient.addColorStop(opacityDecay, `rgba(${r}, ${g}, ${b}, 0.1)`);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      } else {
        // Fallback
        gradient.addColorStop(0, resolvedColor);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      container.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mousePos, radius, opacityDecay, color, colorGenerator]);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      style={{ backgroundColor }}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-60 blur-3xl"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
