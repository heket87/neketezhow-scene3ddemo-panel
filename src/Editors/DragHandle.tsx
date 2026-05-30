import React from "react";
import { css } from "@emotion/css";

interface DragHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
}

const DragHandle: React.FC<DragHandleProps> = ({ onMouseDown }) => {
  const style = css({
    width: "100%",
    height: "24px",
    backgroundColor: "rgba(0,0,0,0.1)",
    cursor: "move",
    borderBottom: "1px solid rgba(0,0,0,0.2)",
    display: "flex",
    alignItems: "center",
    padding: "0 8px",
    fontSize: "12px",
    fontWeight: 500,
    userSelect: "none",
  });

  return (
    <div className={style} onMouseDown={onMouseDown}>
      
    </div>
  );
};

export default DragHandle;
