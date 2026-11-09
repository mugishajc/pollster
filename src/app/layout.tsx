import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Realtime Polls",
  description: "Create polls and see results update in real time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, padding: "2rem", maxWidth: 720 }}>
        <header style={{ marginBottom: "2rem" }}>
          <h1 style={{ margin: 0 }}>
            <a href="/" style={{ color: "inherit", textDecoration: "none" }}>Realtime Polls</a>
          </h1>
        </header>
        {children}
      </body>
    </html>
  );
}
