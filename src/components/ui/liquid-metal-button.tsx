"use client";

import { Icon } from "@iconify/react";
import { Sparkles } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

interface ShaderInstance {
  destroy: () => void;
  setSpeed?: (speed: number) => void;
}

type ButtonSize = "sm" | "md" | "lg";

interface ButtonDimensions {
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
  fontSize: number;
  iconSize: number;
}

interface LiquidMetalButtonProps {
  label?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  viewMode?: "text" | "icon" | "both";
  size?: ButtonSize;
  icon?: string | React.ElementType | React.ReactNode;
  iconPosition?: "left" | "right";
}

export function LiquidMetalButton({
  label = "Ejecutar",
  onClick,
  type = "button",
  disabled = false,
  viewMode,
  size = "md",
  icon: IconProp,
  iconPosition = "left",
}: LiquidMetalButtonProps) {
  const activeMode = useMemo(() => {
    if (viewMode) return viewMode;
    return IconProp ? "both" : "text";
  }, [viewMode, IconProp]);

  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const shaderRef = useRef<HTMLDivElement>(null);
  const shaderMount = useRef<ShaderInstance | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const dimensions = useMemo((): ButtonDimensions => {
    const config = {
      sm: { height: 34, minWidth: 34, fontSize: 12, iconSize: 14, px: 14 },
      md: { height: 42, minWidth: 42, fontSize: 13, iconSize: 16, px: 18 },
      lg: { height: 50, minWidth: 50, fontSize: 14, iconSize: 18, px: 24 },
    };

    const s = config[size];
    let width = s.minWidth;

    if (activeMode !== "icon") {
      const textWidth = label.length * (s.fontSize * 0.58);
      const iconSpace = activeMode === "both" || (IconProp && !viewMode) ? s.iconSize + 8 : 0;
      width = Math.max(120, Math.round(textWidth + iconSpace + s.px * 2));
    }

    return {
      width,
      height: s.height,
      innerWidth: width - 4,
      innerHeight: s.height - 4,
      fontSize: s.fontSize,
      iconSize: s.iconSize,
    };
  }, [activeMode, size, label, IconProp, viewMode]);

  useEffect(() => {
    const styleId = "shader-canvas-style-exploded";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .shader-container-exploded canvas {
          width: 100% !important; height: 100% !important;
          display: block !important; position: absolute !important;
          top: 0 !important; left: 0 !important; border-radius: 100px !important;
        }
      `;
      document.head.appendChild(style);
    }

    const loadShader = async () => {
      try {
        const shadersModule = await import("@paper-design/shaders");
        const { liquidMetalFragmentShader, ShaderMount } = shadersModule;
        if (shaderRef.current) {
          if (shaderMount.current?.destroy) shaderMount.current.destroy();
          const MountCtor = ShaderMount as unknown as new (
            el: HTMLElement,
            shader: string,
            uniforms: Record<string, number>,
            undef: undefined,
            speed: number
          ) => ShaderInstance;
          shaderMount.current = new MountCtor(
            shaderRef.current,
            liquidMetalFragmentShader,
            {
              u_repetition: 4,
              u_softness: 0.5,
              u_shiftRed: 0.25,
              u_shiftBlue: 0.4,
              u_distortion: 0,
              u_contour: 0,
              u_angle: 45,
              u_scale: 8,
              u_shape: 1,
              u_offsetX: 0.1,
              u_offsetY: -0.1,
            },
            undefined,
            0.5
          );
        }
      } catch {
        // Fallback gradient renders cleanly if WebGL is unavailable
      }
    };
    loadShader();
    return () => shaderMount.current?.destroy?.();
  }, []);

  const renderIcon = () => {
    if (!IconProp && viewMode === "text") return null;
    const iconStyle: React.CSSProperties = {
      color: "#f9f9f9",
      flexShrink: 0,
      width: dimensions.iconSize,
      height: dimensions.iconSize,
    };
    if (typeof IconProp === "string") {
      return <Icon icon={IconProp} style={iconStyle} />;
    }
    return <Sparkles size={dimensions.iconSize} style={iconStyle} />;
  };

  return (
    <div className={`relative inline-block select-none ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <div
        style={{
          position: "relative",
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            pointerEvents: "none",
            flexDirection: iconPosition === "right" ? "row-reverse" : "row",
          }}
        >
          {(activeMode === "icon" || activeMode === "both") && renderIcon()}
          {activeMode !== "icon" && (
            <span
              style={{
                fontSize: `${dimensions.fontSize}px`,
                color: "#f9f9f9",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </span>
          )}
        </div>

        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            transform: isPressed ? "scale(0.98)" : "scale(1)",
            transition: "transform 0.12s ease",
          }}
        >
          <div
            style={{
              width: `${dimensions.innerWidth}px`,
              height: `${dimensions.innerHeight}px`,
              margin: "2px",
              borderRadius: "100px",
              background: "linear-gradient(180deg, #161822 0%, #07080d 100%)",
            }}
          />
        </div>

        <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
          <div
            style={{
              height: "100%",
              width: "100%",
              borderRadius: "100px",
              background: "linear-gradient(135deg, rgba(56,189,248,0.5), rgba(255,255,255,0.25), rgba(16,185,129,0.4))",
              boxShadow: isHovered
                ? "0 8px 24px rgba(56,189,248,0.25)"
                : "0 4px 12px rgba(0,0,0,0.3)",
              transition: "box-shadow 0.25s ease",
            }}
          >
            <div
              ref={shaderRef}
              className="shader-container-exploded"
              style={{ borderRadius: "100px", overflow: "hidden", height: "100%" }}
            />
          </div>
        </div>

        <button
          ref={buttonRef}
          type={type}
          disabled={disabled}
          onClick={onClick}
          onMouseEnter={() => {
            setIsHovered(true);
            shaderMount.current?.setSpeed?.(1);
          }}
          onMouseLeave={() => {
            setIsHovered(false);
            setIsPressed(false);
            shaderMount.current?.setSpeed?.(0.5);
          }}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          className="absolute inset-0 z-40 cursor-pointer bg-transparent border-none outline-none rounded-[100px]"
          aria-label={label}
        />
      </div>
    </div>
  );
}
