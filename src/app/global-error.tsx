"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: "#1c1917", color: "#f5f0e8", fontFamily: "Georgia, serif", padding: 48 }}>
        <p style={{ letterSpacing: "0.28em", fontSize: 12, color: "#c4a574" }}>GRAPHION</p>
        <h1 style={{ fontSize: 42, marginTop: 16 }}>The studio is temporarily unavailable.</h1>
        <button onClick={reset} style={{ marginTop: 24, background: "#c4a574", border: 0, padding: "12px 18px" }}>
          Try again
        </button>
      </body>
    </html>
  );
}
