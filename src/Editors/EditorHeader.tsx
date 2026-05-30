import React from "react";
import { css } from "@emotion/css";
import {  IconButton, useStyles2 } from "@grafana/ui";
import { GrafanaTheme2 } from "@grafana/data";

interface EditorHeaderProps {
  isCollapsed: boolean;
  elementname: string;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  settriggerelement?: React.Dispatch<
    React.SetStateAction<any | undefined>
  >;
  handleDragMouseDown: (e: React.MouseEvent) => void;
  isDragging: boolean;
  draggable?: boolean;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  isCollapsed,
  elementname,
  setIsCollapsed,
  settriggerelement,
  handleDragMouseDown,
  isDragging,
  draggable = true,
}) => {
  const getStyles = (theme: GrafanaTheme2) => ({
    header: css({
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      cursor: !draggable ? "default" : isDragging ? "grabbing" : "grab",
      userSelect: "none",
      padding: theme.spacing(1),
      backgroundColor: theme.colors.background.primary,
      borderBottom: `1px solid ${theme.colors.border.weak}`,
    }),
        buttonGroup: css({
      position: "sticky",
      top: theme.spacing(1),
      right: theme.spacing(1),
      display: "flex",
      justifyContent: 'flex-end',
      gap: theme.spacing(1),
      zIndex: 10,
      backgroundColor: theme.colors.background.primary,
      padding: theme.spacing(1),
      borderRadius: theme.shape.radius.default,
    }),
    button: css({
      background: "none",
      border: "none",
      color: theme.colors.text.primary,
      cursor: "pointer",
      fontSize: 18,
      padding: 0,
      lineHeight: 1,
      marginLeft: theme.spacing(1),
      "&:hover": {
        color: theme.colors.text.link,
      },
    }),
  });

  const styles = useStyles2(getStyles);

  return (
    <div
      className={styles.header}
      onMouseDown={handleDragMouseDown}
      onClick={(e) => e.stopPropagation()}
    >
      <div>{elementname}</div>
       <div className={styles.buttonGroup}>
            <IconButton
              name={isCollapsed ? "angle-double-down" : "angle-double-up"}
              onClick={() => setIsCollapsed(!isCollapsed)}
              size="md"
              aria-label={isCollapsed ? "Expand" : "Collapse"}
              tooltip={isCollapsed ? "Expand" : "Collapse"}
            />
                       {settriggerelement && <IconButton
              variant="destructive"
              name="times"
              onClick={() => settriggerelement(undefined)}
              size="md"
              aria-label="Close"
              tooltip="Close"
            />}
    </div>
    </div>
  );
};

export default EditorHeader;
