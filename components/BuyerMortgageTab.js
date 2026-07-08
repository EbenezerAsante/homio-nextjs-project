"use client";

import { useState } from "react";
import MortgageCalculator from "./MortgageCalculator";
import { T } from "../lib/constants";

export default function BuyerMortgageTab() {
  const [price, setPrice] = useState(500000);

  return (
    <div style={{ maxWidth: 480 }}>
      <div style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 10, padding: 24, marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: T.gray2, display: "block", marginBottom: 6 }}>
          Property Price (GH₵)
        </label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value) || 0)}
          style={{
            width: "100%",
            border: `1.5px solid ${T.border}`,
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 16,
            fontWeight: 700,
            color: T.navy,
            boxSizing: "border-box",
          }}
        />
      </div>

      <MortgageCalculator price={price} />
    </div>
  );
}