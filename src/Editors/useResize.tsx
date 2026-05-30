// hooks/useResize.ts
import { useCallback, useRef, useState } from "react";

export const useResize = (
  initialWidth: number,
  initialHeight: number,
  onResize: (w: number, h: number) => void
) => {
  const [isResizing, setIsResizing] = useState(false);
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const throttledResize = useRef(false);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    };
  }, [size]);

  const handleResizeMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || throttledResize.current) {return;}

    throttledResize.current = true;
    setTimeout(() => {
      throttledResize.current = false;
    }, 16);

    const deltaX = e.clientX - resizeStartRef.current.x;
    const deltaY = e.clientY - resizeStartRef.current.y;

    const newWidth = Math.max(200, resizeStartRef.current.width + deltaX);
    const newHeight = Math.max(150, resizeStartRef.current.height + deltaY);

    setSize({ width: newWidth, height: newHeight });
  }, [isResizing]);

  const handleResizeMouseUp = useCallback(() => {
    setIsResizing(false);
    onResize(size.width, size.height);
  }, [size, onResize]);

  return {
    isResizing,
    size,
    setSize,
    handleResizeMouseDown,
    handleResizeMouseMove,
    handleResizeMouseUp,
  };
};
