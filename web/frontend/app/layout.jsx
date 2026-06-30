import "./globals.css";

export const metadata = {
  title: "TechCorp Financial Assistant",
  description: "Assistant IA financier interne — TechCorp",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="bg-ledger-paper text-ledger-ink antialiased">
        {children}
      </body>
    </html>
  );
}
