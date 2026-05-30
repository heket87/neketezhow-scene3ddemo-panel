import React, { useMemo, useState } from "react";
import { PanelData, FieldConfigSource } from "@grafana/data";
import { LinksOptions } from "types";
import getDatalatest from "./GlobalFunctions/getDatalatest";
import create_text from "create_text";

type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export default function ListLinksRender({
  links,
  position,
  links_size,
  data,
  replaceVariables,
  fieldConfig,
  links_color,
  links_bgcolor,
  links_bordercolor,
  links_borderwidth,
  inline = false,
}: {
  links: LinksOptions[];
  position: Position;
  links_size: "small" | "medium" | "large";
  data: PanelData;
  replaceVariables: any;
  fieldConfig: FieldConfigSource;
  links_color: string;
  links_bgcolor: string;
  links_bordercolor: string;
  links_borderwidth: string;
  inline?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const linksFontSize =
    links_size === "small"
      ? "100%"
      : links_size === "large"
      ? "250%"
      : "175%";

  const buttonSize = "1.9em";
  const buttonInset = "0.55em";

  const cornerStyle = useMemo<React.CSSProperties>(() => {
    return {
      top: position === "top-left" || position === "top-right" ? 12 : undefined,
      bottom:
        position === "bottom-left" || position === "bottom-right"
          ? 12
          : undefined,
      left:
        position === "top-left" || position === "bottom-left" ? 12 : undefined,
      right:
        position === "top-right" || position === "bottom-right"
          ? 12
          : undefined,
    };
  }, [position]);

  const transformOrigin = useMemo(() => {
    switch (position) {
      case "top-left":
        return "top left";
      case "top-right":
        return "top right";
      case "bottom-left":
        return "bottom left";
      case "bottom-right":
      default:
        return "bottom right";
    }
  }, [position]);

  const collapsedTransform = useMemo(() => {
    switch (position) {
      case "top-left":
        return "translate(-12px, -12px) scale(0.15)";
      case "top-right":
        return "translate(12px, -12px) scale(0.15)";
      case "bottom-left":
        return "translate(-12px, 12px) scale(0.15)";
      case "bottom-right":
      default:
        return "translate(12px, 12px) scale(0.15)";
    }
  }, [position]);

  const buttonPosition = useMemo<React.CSSProperties>(() => {
    if (collapsed) {
      return {
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    switch (position) {
      case "top-left":
        return {
          left: "calc(100% + 6px)",
          top: buttonInset,
          transform: "translate(0, 0)",
        };

      case "top-right":
        return {
          left: `calc(-${buttonSize} - 6px)`,
          top: buttonInset,
          transform: "translate(0, 0)",
        };

      case "bottom-left":
        return {
          left: "calc(100% + 6px)",
          top: `calc(100% - ${buttonSize} - ${buttonInset})`,
          transform: "translate(0, 0)",
        };

      case "bottom-right":
      default:
        return {
          left: `calc(-${buttonSize} - 6px)`,
          top: `calc(100% - ${buttonSize} - ${buttonInset})`,
          transform: "translate(0, 0)",
        };
    }
  }, [collapsed, position]);

  const arrowSymbol = useMemo(() => {
    const buttonIsOnLeft =
      position === "top-right" || position === "bottom-right";

    return buttonIsOnLeft
      ? collapsed
        ? "►"
        : "◄"
      : collapsed
      ? "◄"
      : "►";
  }, [collapsed, position]);

  return (
    <div
      style={{
        position: inline ? "relative" : "absolute",
        zIndex: 1000,
        pointerEvents: "none",
        overflow: "visible",
        ...(inline ? {} : cornerStyle),
      }}
    >
      <div
        style={{
          position: "relative",
          display: "inline-block",
          overflow: "visible",
        }}
      >
        <button
          type="button"
          aria-label={collapsed ? "Развернуть ссылки" : "Свернуть ссылки"}
          title={collapsed ? "Развернуть" : "Свернуть"}
          onClick={(e) => {
            e.stopPropagation();
            setCollapsed((v) => !v);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            zIndex: 3,
            width: buttonSize,
            height: buttonSize,
            padding: 0,
            border: "none",
            background: "transparent",
            color: links_color,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
            pointerEvents: "auto",
            transition:
              "left 260ms ease, top 260ms ease, transform 260ms ease, opacity 220ms ease",
            ...buttonPosition,
          }}
        >
          <span
            style={{
              display: "inline-block",
              fontSize: "1em",
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            {arrowSymbol}
          </span>
        </button>

                <div
          style={{
            pointerEvents: collapsed ? "none" : "auto",
            transformOrigin,
            transform: collapsed
              ? collapsedTransform
              : "translate(0, 0) scale(1)",
            opacity: collapsed ? 0 : 1,
            transition: "transform 260ms ease, opacity 220ms ease",
            borderRadius: 6,
            background: links_bgcolor,
            borderWidth: Number(links_borderwidth) || 0,
            borderStyle: "solid",
            borderColor: links_bordercolor,
            color: links_color,
            fontSize: linksFontSize,
            lineHeight: "1",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "0.5rem",
            padding: "0.8em 1em",
            willChange: "transform, opacity",
            boxSizing: "border-box",
          }}
        >
          {links.map((link, index) => (
            <div key={`${link.name}-${index}`} style={{ pointerEvents: "auto" }}>
              <a
                href={create_text(
                  link.link || "",
                  replaceVariables,
                  data,
                  fieldConfig
                )}
                target={link.open_in_current ? "_self" : "_blank"}
                rel={link.open_in_current ? undefined : "noreferrer"}
                style={{
                  pointerEvents: "auto",
                  cursor: "pointer",
                  color: links_color,
                  backgroundColor: "transparent",
                  textDecoration: "none",
                }}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                {getDatalatest(link.name || "", data)}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
