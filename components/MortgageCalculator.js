"use client";

import { useState, useMemo } from "react";
import { T } from "../lib/constants";

export default function MortgageCalculator({ price }) {
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(24); // typical Ghana mortgage rate range
  const [years, setYears] = useState(15);

  const { monthlyPayment, loanAmount, downPaymentAmount } = useMemo(() => {
    const dp = (price * downPaymentPct) / 100;
    const principal = price - dp;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = years * 12;

    let payment = 0;
    if (monthlyRate > 0) {
      payment =
        (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);
    } else {
      payment = principal / numPayments;
    }

    return {
      monthlyPayment: payment,
      loanAmount: principal,
      downPaymentAmount: dp,
    };
  }, [price, downPaymentPct, interestRate, years]);

  const fmtGHS = (n) =>
    "GH₵ " + Math.round(n).toLocaleString();

  const sliderRow = { marginBottom: 18 };
  const labelRow = { display: "flex", justifyContent: "space-between", fontSize: 13, color: T.gray1, marginBottom: 6 };
  const sliderStyle = { width: "100%", accentColor: T.navy };

  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: 24, marginBottom: 16, border: `1px solid ${T.border}` }}>
      <h3 style={{ margin: "0 0 4px", color: T.navy, fontSize: 16 }}>Mortgage Calculator</h3>
      <p style={{ margin: "0 0 20px", fontSize: 12.5, color: T.gray3 }}>
        Estimate only — actual rates and terms vary by bank.
      </p>

      <div style={sliderRow}>
        <div style={labelRow}>
          <span>Down Payment</span>
          <span style={{ fontWeight: 700, color: T.navy }}>{downPaymentPct}% ({fmtGHS(downPaymentAmount)})</span>
        </div>
        <input
          type="range"
          min="5"
          max="50"
          step="5"
          value={downPaymentPct}
          onChange={(e) => setDownPaymentPct(Number(e.target.value))}
          style={sliderStyle}
        />
      </div>

      <div style={sliderRow}>
        <div style={labelRow}>
          <span>Interest Rate</span>
          <span style={{ fontWeight: 700, color: T.navy }}>{interestRate}%</span>
        </div>
        <input
          type="range"
          min="10"
          max="35"
          step="0.5"
          value={interestRate}
          onChange={(e) => setInterestRate(Number(e.target.value))}
          style={sliderStyle}
        />
      </div>

      <div style={sliderRow}>
        <div style={labelRow}>
          <span>Loan Term</span>
          <span style={{ fontWeight: 700, color: T.navy }}>{years} years</span>
        </div>
        <input
          type="range"
          min="5"
          max="25"
          step="1"
          value={years}
          onChange={(e) => setYears(Number(e.target.value))}
          style={sliderStyle}
        />
      </div>

      <div
        style={{
          background: T.bg,
          borderRadius: 8,
          padding: "16px 18px",
          marginTop: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <p style={{ margin: 0, fontSize: 12, color: T.gray2, fontWeight: 600 }}>Estimated Monthly Payment</p>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: T.navy }}>{fmtGHS(monthlyPayment)}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: 12, color: T.gray2 }}>Loan Amount</p>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.gray1 }}>{fmtGHS(loanAmount)}</p>
        </div>
      </div>
    </div>
  );
}