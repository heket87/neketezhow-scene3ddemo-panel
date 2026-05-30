// hooks/useDrag.ts
import { useCallback, useRef, useState } from "react";

export const useDrag = (
  initialPosition: [number, number, number],
  onPositionChange: (pos: [number, number, number]) => void
) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<[number, number, number]>(initialPosition);

  const dragStartRef = useRef({
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0,
  });

  const handleDragMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      dragStartRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startPosX: position[0],
        startPosY: position[1],
      };
    },
    [position]
  );

  const handleDragMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) {return;}

      const deltaX = e.clientX - dragStartRef.current.startX;
      const deltaY = e.clientY - dragStartRef.current.startY;

      const newX = dragStartRef.current.startPosX + deltaX;
      const newY = dragStartRef.current.startPosY + deltaY;

      const newPos: [number, number, number] = [newX, newY, position[2]];
      setPosition(newPos);
      onPositionChange(newPos);
    },
    [isDragging, position, onPositionChange]
  );

  const handleDragMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    isDragging,
    position,
    setPosition,
    handleDragMouseDown,
    handleDragMouseMove,
    handleDragMouseUp,
  };
};
