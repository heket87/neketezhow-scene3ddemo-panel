import React from "react";
import { css } from "@emotion/css";

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ onMouseDown }) => {
  const style = css({
    width: "16px",
    height: "16px",
    backgroundColor: "rgba(0,0,0,0.3)",
    position: "absolute",
    right: 0,
    bottom: 0,
    cursor: "nwse-resize",
    zIndex: 10,
    borderTopLeftRadius: "4px",
  });

  return <div className={style} onMouseDown={onMouseDown} />;
};

export default ResizeHandle;
