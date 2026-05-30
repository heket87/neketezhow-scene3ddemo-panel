import React, { useEffect, forwardRef } from "react";
import { css } from "@emotion/css";
import { ComboboxOption, useStyles2 } from "@grafana/ui";
import { PanelData, GrafanaTheme2 } from "@grafana/data";

import {
  ElementOptions,
  Options,
} from "types";

import BaseEditorFields from "./BaseEditorFields";
import { optionstypes } from "./ElementsEditor";
import { CollapsElement } from "./Collapsesible";
import SubElementFields from "./editorsubsfields";

import ResizeHandle from "./ResizeHandle";

import { useResize } from "./useResize";
import { useDrag } from "./useDrag";
import EditorHeader from "./EditorHeader";

interface InlineEditorProps {
  element: ElementOptions | undefined;
  globaloptions: Options;
  onChange: (val: ElementOptions[]) => void;
  data: PanelData;
  width: number;
  height: number;
  onResize: (width: number, height: number) => void;
  settriggerelement: React.Dispatch<React.SetStateAction<ElementOptions | undefined>>;
  position: [number, number, number];
  onPositionChange: (newPos: [number, number, number]) => void;
}

const InlineEditor = forwardRef<HTMLDivElement, InlineEditorProps>(
  (
    {
      element,
      globaloptions,
      onChange,
      data,
      width,
      height,
      onResize,
      settriggerelement,
      position,
      onPositionChange,
    },
    ref
  ) => {
    const {
      isResizing,
      size: localSize,
      handleResizeMouseDown,
      handleResizeMouseMove,
      handleResizeMouseUp,
    } = useResize(width, height, onResize);

    const {
      isDragging,
      position: currentPosition,
      handleDragMouseDown,
      handleDragMouseMove,
      handleDragMouseUp,
    } = useDrag(position, onPositionChange);

    const [isCollapsed, setIsCollapsed] = React.useState(false);

    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        if (isResizing) {
          handleResizeMouseMove(e);
        }
        if (isDragging) {
          handleDragMouseMove(e);
        }
      };

      const handleMouseUp = () => {
        if (isResizing) {
          handleResizeMouseUp();
        }
        if (isDragging) {
          handleDragMouseUp();
        }
      };

      if (isResizing || isDragging) {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
      }

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }, [
      isResizing,
      isDragging,
      handleResizeMouseMove,
      handleResizeMouseUp,
      handleDragMouseMove,
      handleDragMouseUp,
    ]);

    useEffect(() => {
      const handleWheel = (e: WheelEvent) => {
        if (
          ref &&
          (ref as React.RefObject<HTMLDivElement>).current?.contains(e.target as Node)
        ) {
          e.stopPropagation();
        }
      };

      document.addEventListener("wheel", handleWheel, {
        passive: false,
        capture: true,
      });

      return () => {
        document.removeEventListener("wheel", handleWheel, true);
      };
    }, [ref]);

    const getStyles = (theme: GrafanaTheme2) => ({
      wrapper: css({
        width: `${localSize.width}px`,
        height: isCollapsed ? "70px" : `${localSize.height}px`,
        position: "absolute",
        left: `${currentPosition[0]}px`,
        top: `${currentPosition[1]}px`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        opacity: 0.95,
        zIndex: 1000,
      }),
      container: css({
        backgroundColor: theme.colors.background.primary,
        padding: theme.spacing(2),
        border: `1px solid ${theme.colors.border.weak}`,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxSizing: "border-box",
        minHeight: "50px",
      }),
      content: css({
        visibility: isCollapsed ? "hidden" : "visible",
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: isResizing ? "hidden" : "auto",
        paddingTop: theme.spacing(2),
      }),
    });

    const styles = useStyles2(getStyles);

    const datasources: Array<ComboboxOption<string>> = [];
    if (data) {
      const seen = new Set<string>();
      for (const frame of data.series) {
        if (!frame) {
          continue;
        }
        for (const field of frame.fields) {
          if (!seen.has(field.name)) {
            seen.add(field.name);
            datasources.push({ label: field.name, value: field.name });
          }
        }
      }
    }

    if (!element) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={styles.wrapper}
        style={{
          width: `${localSize.width}px`,
          height: isCollapsed ? "70px" : `${localSize.height}px`,
        }}
      >
        <div className={styles.container}>
          <EditorHeader
            elementname={element.name || "not found"}
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
            settriggerelement={settriggerelement}
            handleDragMouseDown={handleDragMouseDown}
            isDragging={isDragging}
          />

          <div className={styles.content}>
            {globaloptions.elements && (
              <BaseEditorFields
                datasources={datasources}
                value={globaloptions.elements}
                thiselement={element}
                optionstypes={optionstypes}
                onChange={onChange}
              />
            )}

            {element.traverse && (
              <CollapsElement label="Subelements">
                {element.subelements?.map((sub, j) => (
                  <SubElementFields
                    key={j}
                    thiselement={element}
                    sub={sub}
                    subIndex={j}
                    datasources={datasources}
                    value={globaloptions.elements ?? []}
                    onChange={onChange}
                  />
                ))}
              </CollapsElement>
            )}
          </div>

          <div style={{ visibility: isCollapsed ? "hidden" : "visible" }}>
            <ResizeHandle onMouseDown={handleResizeMouseDown} />
          </div>
        </div>
      </div>
    );
  }
);

InlineEditor.displayName = "InlineEditor";

export default InlineEditor;
