import React from 'react';
import { registerHelpWindow } from '../GlobalFunctions/helpWindowState';

type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

function getStyle(position: Corner, width: string): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'absolute',
    zIndex: 10,
    backgroundColor: 'rgba(20,20,20,0.88)',
    color: '#ffffff',
    fontSize: '13px',
    fontFamily: 'monospace',
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.18)',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
    wordBreak: 'normal',
    pointerEvents: 'none',
    width: 'max-content',
    maxWidth: width,
    boxSizing: 'border-box',
    display: 'block',
  };

  if (position === 'top-left') {return { ...base, top: 10, left: 10 };}
  if (position === 'top-right') {return { ...base, top: 10, right: 10 };}
  if (position === 'bottom-left') {return { ...base, bottom: 10, left: 10 };}
  return { ...base, bottom: 10, right: 10 };
}

export default function HelpInfoOverlay({
  position = 'top-right',
  width = '200px',
}: {
  position?: Corner;
  width?: string;
}) {
  const [text, setText] = React.useState<string | null>(null);

  React.useEffect(() => {
    return registerHelpWindow((t) => setText(t));
  }, []);

  if (!text) {return null;}

  return <div style={getStyle(position, width)}>{text}</div>;
}
