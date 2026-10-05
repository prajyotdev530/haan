const inr = new Intl.NumberFormat("en-IN");

export const money = (n) => `₹${inr.format(n)}`;

export const date = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const dateTime = (iso) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export const titleCase = (s) => s.charAt(0) + s.slice(1).toLowerCase();

// Engine text uses ASCII "<=" / ">="; show proper symbols.
export const pretty = (s) => (s ? s.replaceAll("<=", "≤").replaceAll(">=", "≥") : s);
