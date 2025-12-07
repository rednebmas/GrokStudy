/**
 * DebugConsole component - Display WebSocket messages (excluding audio)
 */

import React, { useEffect, useRef, useState } from "react";
import type { DebugLogEntry } from "../types/messages";

interface DebugConsoleProps {
  logs: DebugLogEntry[];
  onCollapsedChange?: (collapsed: boolean) => void;
}

export const DebugConsole: React.FC<DebugConsoleProps> = ({ logs, onCollapsedChange }) => {
  const consoleRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggle = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapsedChange?.(newCollapsed);
  };

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
  };

  return (
    <div
      style={{
        backgroundColor: "#141414ff",
        border: "2px solid #4f4f4fff",
        borderRadius: "8px",
        color: "#fff",
        padding: "1rem",
        display: "flex",
        flexDirection: isCollapsed ? "row" : "column",
        alignItems: isCollapsed ? "center" : "stretch",
        height: "100%",
        width: isCollapsed ? "auto" : "100%",
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: "1.2rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          cursor: "pointer",
          whiteSpace: "nowrap",
          writingMode: isCollapsed ? "vertical-rl" : "horizontal-tb",
        }}
        onClick={handleToggle}
      >
        <span style={{ fontSize: "0.8rem" }}>{isCollapsed ? "◀" : "▶"}</span>
        Debug Console
      </h2>

      {!isCollapsed && (
        <div
          ref={consoleRef}
          style={{
            flex: 1,
            overflow: "auto",
            fontFamily: "monospace",
            fontSize: "0.85rem",
            lineHeight: "1.4",
            backgroundColor: "#000",
            border: "1px solid #525252ff",
            borderRadius: "8px",
            padding: "0.5rem",
            marginTop: "1rem",
          }}
        >
          {logs.length === 0 ? (
            <div style={{ color: "#666" }}>No messages yet...</div>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "0.5rem",
                  paddingBottom: "0.5rem",
                  borderBottom: "1px solid #333",
                }}
              >
                <div style={{ color: log.direction === "SEND" ? "#ffff00" : "#00ffff" }}>
                  [{formatTime(log.timestamp)}] {log.direction} → {log.type}
                </div>
                <div
                  style={{
                    marginLeft: "1rem",
                    marginTop: "0.25rem",
                    color: "#aaa",
                    fontSize: "0.8rem",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                  }}
                >
                  {JSON.stringify(log.message, null, 2)}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
