import { FieldConfigSource, PanelData } from "@grafana/data";
import { Html, Line } from "@react-three/drei";
import create_text from "create_text";
import React from "react";
import { ElementOptions, GlobalTextSettings, Options, SubElementOptions } from "types";
import { getColorFromData } from "../GlobalFunctions/getColorFromData";
import Visibility from "./Data_driven_visibility";

function resolveTextStyle(
  el: ElementOptions | SubElementOptions,
  gt?: GlobalTextSettings
): {
  textsize: string | undefined;
  textcolor: string | undefined;
  textmaxwidth: string | undefined;
  textstatic: boolean | undefined;
  bordersfortextwidth: string | undefined;
  bordersfortextcolor: string | undefined;
  backtextcolor: string | undefined;
  show_if_condition_match: boolean | undefined;
} {
  const useGlobal = el.textsettings?.useGlobalTextSettings !== false;

  if (!useGlobal || !gt) {
    return {
      textsize: el.textsettings?.textsize,
      textcolor: el.textsettings?.textcolor,
      textmaxwidth: el.textsettings?.textmaxwidth,
      textstatic: el.textsettings?.textstatic,
      bordersfortextwidth: el.textsettings?.bordersfortextwidth,
      bordersfortextcolor: el.textsettings?.bordersfortextcolor,
      backtextcolor: el.textsettings?.backtextcolor,
      show_if_condition_match: el.textsettings?.show_if_condition_match,
    };
  }

  return {
    textsize: gt.textsize ?? el.textsettings?.textsize,
    textcolor: gt.textcolor ?? el.textsettings?.textcolor,
    textmaxwidth: gt.textmaxwidth ?? el.textsettings?.textmaxwidth,
    textstatic: gt.textstatic ?? el.textsettings?.textstatic,
    bordersfortextwidth: gt.bordersfortextwidth ?? el.textsettings?.bordersfortextwidth,
    bordersfortextcolor: gt.bordersfortextcolor ?? el.textsettings?.bordersfortextcolor,
    backtextcolor: gt.backtextcolor ?? el.textsettings?.backtextcolor,
    show_if_condition_match: gt.show_if_condition_match ?? el.textsettings?.show_if_condition_match,
  };
}

export default function TextWindow({
  el,
  replaceVariables,
  data,
  fieldConfig,
  hovered,
  subelement,
  globaloptions,
  textPos,
  meshCenter,
}: {
  el: ElementOptions | SubElementOptions;
  replaceVariables: any;
  data: PanelData;
  fieldConfig: FieldConfigSource;
  hovered: boolean;
  globaloptions?: Options;
  subelement: boolean;
  textPos?: [number, number, number];
  meshCenter?: [number, number, number];
}) {
  const style = resolveTextStyle(el, globaloptions?.globaltext);

  const data_textvisibility = Visibility(
    true,
    data,
    "element",
    el,
    false,
    globaloptions?.globaltext
  ) as "visible" | "hidden";

  const computeBgColor = () => {
    if (el.textsettings?.backtextcolor_enablequery && el.textsettings?.backtextcolorquery) {
      return getColorFromData(
        el.textsettings?.backtextcolorquery,
        data,
        fieldConfig,
        el.textsettings?.backtextcolor || "",
        {
          usegradient: el.textsettings?.backtextcolor_usegradient,
          global_gradient: globaloptions?.gradientcolor,
        }
      );
    }

    return style.backtextcolor || "";
  };

  const [bgColor, setBgColor] = React.useState(computeBgColor());

  React.useEffect(() => {
    setBgColor(computeBgColor());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, el, fieldConfig, globaloptions]);

  const tx = Number(el.textsettings?.textpositionx) || 0;
  const ty = Number(el.textsettings?.textpositiony) || 0;
  const tz = Number(el.textsettings?.textpositionz) || 0;
  const hover_and_data_visibility =
    (((data_textvisibility === "visible" && style.textstatic) ||
      (data_textvisibility === "visible" &&
        style.show_if_condition_match &&
        el.textsettings?.visibility?.visible_query !== "static")) ||
      hovered)
      ? "visible"
      : "hidden";
  const isWindowVisible = hover_and_data_visibility === "visible";

  const useGlobalLeaderSettings = el.textsettings?.useGlobalTextSettings !== false;
  const leaderSettings = useGlobalLeaderSettings
    ? globaloptions?.globaltext
    : el.textsettings;

  const lineVisible = leaderSettings?.leader_line ?? false;
  const lineColor = leaderSettings?.leader_line_color_custom
    ? leaderSettings?.leader_line_color ?? "#ffffff"
    : bgColor || "#ffffff";

  const useRealCenterForText = leaderSettings?.use_real_center_for_text ?? false;

  const shouldRenderWindow = isWindowVisible;

  let htmlPosition: [number, number, number] = [tx, ty, tz];
  let line_points: Array<[number, number, number]> | null = null;

  if (subelement) {
    if (meshCenter && textPos) {
      htmlPosition = textPos;
      line_points = [meshCenter, textPos];
    }
  } else {
    const anchorPoint: [number, number, number] =
      useRealCenterForText && meshCenter ? meshCenter : [0, 0, 0];

    htmlPosition = textPos ?? [
      anchorPoint[0] + tx,
      anchorPoint[1] + ty,
      anchorPoint[2] + tz,
    ];

    line_points = [anchorPoint, htmlPosition];
  }

  const renderWindowContent = () => (
    <div
      style={{
        borderStyle: "solid",
        borderColor: style.bordersfortextcolor,
        borderWidth: (style.bordersfortextwidth ?? "0") + "px",
        fontSize: (style.textsize ?? "14") + "px",
        color: style.textcolor,
        backgroundColor: bgColor,
        visibility: hover_and_data_visibility,
        width: "max-content",
        maxWidth: (style.textmaxwidth ?? "200") + "px",
        whiteSpace: "pre-line",
        overflowWrap: "break-word",
        wordBreak: "normal",
        boxSizing: "border-box",
        padding: "5px",
        display: "block",
        cursor: el.textsettings?.text_make_clickable ? "pointer" : undefined,
      }}
    >
      {el.textsettings?.text_make_clickable && el.textsettings?.text_link ? (
        <a
          href={create_text(
            el.textsettings?.text_link,
            replaceVariables,
            data,
            fieldConfig
          )}
          target={el.textsettings?.text_open_in_current ? "_self" : "_blank"}
          rel="noreferrer"
          style={{ color: "inherit", textDecoration: "none", display: "block" }}
        >
          {create_text(
            String(el.textsettings?.text),
            replaceVariables,
            data,
            fieldConfig
          )}
        </a>
      ) : (
        create_text(
          String(el.textsettings?.text),
          replaceVariables,
          data,
          fieldConfig
        )
      )}
    </div>
  );

  return (
    <>
      {lineVisible && shouldRenderWindow && line_points && (
        <Line
          points={line_points}
          color={lineColor}
          lineWidth={Number(leaderSettings?.leader_line_width) || 1}
        />
      )}

      {shouldRenderWindow && (
        <Html position={htmlPosition}>{renderWindowContent()}</Html>
      )}
    </>
  );
}
