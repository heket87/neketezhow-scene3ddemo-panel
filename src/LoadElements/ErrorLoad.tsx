import { Html } from "@react-three/drei";
import React from "react";

function parseLoadError(raw: string): string {
  if (!raw || raw === '[object Event]' || raw === '[object ProgressEvent]') {return 'Unknown error';}
  const msg = raw.replace(/^Error:\s*/i, '');
  const statusMatch = msg.match(/\b([45]\d{2})\b/);
  if (statusMatch) {
    const code = statusMatch[1];
    const names: Record<string, string> = {
      '403': 'Forbidden', '404': 'Not Found', '408': 'Request Timeout',
      '500': 'Server Error', '502': 'Bad Gateway',
      '503': 'Service Unavailable', '504': 'Gateway Timeout',
    };
    return `HTTP ${code}${names[code] ? ' – ' + names[code] : ''}`;
  }
  if (/Failed to fetch/i.test(msg)) {return 'Network error – wrong URL or server unreachable';}
  if (/timeout/i.test(msg))        {return 'Request timeout';}
  if (/CORS/i.test(msg))           {return 'CORS error';}
  return msg.replace(/Could not load .+?:\s*/i, '').slice(0, 120);
}

export default function Errorload({ error }: { error: string }) {
  return (
    <Html>
      <div style={{
        color: '#ff6666', background: 'rgba(0,0,0,0.85)', padding: '8px 12px',
        borderRadius: '4px', border: '1px solid #ff4444',
        fontFamily: 'monospace', fontSize: '12px', maxWidth: '320px',
        whiteSpace: 'pre-wrap', lineHeight: '1.4',
      }}>
        ⚠ Model load error<br />
        {parseLoadError(error)}
      </div>
    </Html>
  );
}
