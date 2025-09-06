import dynamic from "next/dynamic";
const FurnaceAsk = dynamic(() => import("../components/FurnaceAsk"), { ssr: false });

export default function Home() {
  return (
    <main style={{ padding: 20, fontFamily: "-apple-system, Segoe UI, Roboto, sans-serif" }}>
      <h1 style={{ marginBottom: 16 }}>🔥 Furnace Dashboard</h1>
      <p style={{ marginTop: -6, marginBottom: 16 }}>
        See your balance, set a budget, and tally burn after each result.
      </p>
      <FurnaceAsk />
    </main>
  );
}