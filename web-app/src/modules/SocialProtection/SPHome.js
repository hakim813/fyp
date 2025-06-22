import React, { useState, useEffect, useRef } from "react";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { useUser } from "../../utils/UserContext";
import { useNavigate } from "react-router-dom";
import "./sp.css";
import Navbar from "../../components/Navbar";
import ReactModal from "react-modal";

const benefitKWSP = [
  "Receive a special incentive of 20% (up to a maximum of RM500) of the total voluntary contribution in the current year",
  "Enjoy annual dividends on retirement savings",
  "Subject to EPF terms and conditions",
  "Subject to LHDN terms and conditions",
];

const benefitSocso = {
  "Plan 1": [
    "RM 30 per day",
    "Lump Sum Payment : RM 32243.40",
    "Lump Sum Payment : RM32243.40\nPeriodical Pension : RM 756.00 per month",
    "RM 945 per month",
    "RM 3000",
    "RM 500 per month",
  ],
  "Plan 2": [
    "RM 41.33 per day",
    "Lump Sum Payment : RM 47957.40",
    "Lump Sum Payment : RM 47957.40 & Periodical Pension : RM 1116.00 per month",
    "RM 1395 per month",
    "RM 3000",
    "RM 500 per month",
  ],
  "Plan 3": [
    "RM 78.67 per day",
    "Lump Sum Payment : RM 90588.60",
    "Lump Sum Payment : RM 90588.60 & Periodical Pension : RM 2124.00 per month",
    "RM 2655 per month",
    "RM 3000",
    "RM 500 per month",
  ],
  "Plan 4": [
    "RM 105.33 per day",
    "Lump Sum Payment : RM 121296.60",
    "Lump Sum Payment : RM 121296.60\nPeriodical Pension : RM 2844.00 per month",
    "RM 3555 per month",
    "RM3000",
    "RM 500 per month",
  ],
};

export default function SPHome() {
  const [plans, setPlans] = useState([]);
  const [selected, setSelected] = useState(0);
  const { user } = useUser();
  const navigate = useNavigate();
  const hasReset = useRef({});

  const [modalOpen, setModalOpen] = useState(false);
  const [planToChange, setPlanToChange] = useState(null);
  const [newPlan, setNewPlan] = useState("");

  // Helper to get latest contribution for a plan
  function getLatestContribution(contributions, plan) {
    return contributions
      .filter(
        (c) =>
          c.email === plan.email &&
          c.scheme === plan.scheme &&
          c.chosenPlan === plan.chosenPlan
      )
      .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))[0];
  }

  useEffect(() => {
    if (!user) return;
    const db = getDatabase();
    const plansRef = ref(db, "socialplan");
    const contribRef = ref(db, "SPcontribution");

    // Fetch both plans and contributions
    onValue(plansRef, (plansSnap) => {
      const plansData = plansSnap.val();
      let fetchedPlans = [];
      if (plansData) {
        fetchedPlans = Object.keys(plansData)
          .map((key) => ({
            id: key,
            user: plansData[key].user,
            email: plansData[key].email,
            scheme: plansData[key].scheme,
            chosenPlan: plansData[key].chosenPlan,
            totalContribution: plansData[key].totalContribution,
            rdate: plansData[key].rdate ?? null,
            rtime: plansData[key].rtime ?? null,
          }))
          .filter((item) => item.email === user.email);
      }

      // Now fetch contributions and merge
      onValue(contribRef, (contribSnap) => {
        const contribData = contribSnap.val();
        const contributions = contribData
          ? Object.keys(contribData).map((key) => ({
              ...contribData[key],
              key,
            }))
          : [];

        // For each plan, find the latest contribution for the same email, scheme, chosenPlan
        const mergedPlans = fetchedPlans.map((plan) => {
          if (plan.scheme === "i-Saraan KWSP")
            return { ...plan, isLocked: false, unlockDate: null };
          const latest = getLatestContribution(contributions, plan);
          if (latest && latest.createdAt && latest.monthsCovered) {
            const created = new Date(Number(latest.createdAt));
            const months = Number(latest.monthsCovered) || 0;
            const unlockDate = new Date(created);
            unlockDate.setMonth(created.getMonth() + months);
            const now = new Date();
            const isLocked = now < unlockDate;
            return {
              ...plan,
              isLocked,
              unlockDate,
              latestContribution: latest,
            };
          }
          return {
            ...plan,
            isLocked: false,
            unlockDate: null,
            latestContribution: null,
          };
        });

        // Reset totalContribution if unlocked and not already reset
        mergedPlans.forEach((plan) => {
          if (
            plan.scheme !== "i-Saraan KWSP" &&
            !plan.isLocked &&
            plan.totalContribution > 0 &&
            plan.latestContribution &&
            !hasReset.current[plan.id]
          ) {
            update(ref(db, `socialplan/${plan.id}`), { totalContribution: 0 });

            hasReset.current[plan.id] = true;
          }
          // Reset the flag if locked again
          if (plan.isLocked) {
            hasReset.current[plan.id] = false;
          }
        });

        mergedPlans.push({ isAddButton: true });
        setPlans(mergedPlans);
      });
    });
  }, [user]);

  const current = plans[selected] || {};

  return (
    <>
      <Navbar />
      <div className="sp-container">
        <h2>Social Protection</h2>
        <div className="sp-history-row">
          <button
            className="sp-history-btn"
            onClick={() => navigate("/social/contributions")}
          >
            Contribution History &gt;
          </button>
        </div>
        <div className="sp-cards-row">
          {plans.map((item, idx) =>
            item.isAddButton ? (
              <div
                className="sp-card sp-add-card"
                key={idx}
                onClick={() => navigate("/social/add-plan")}
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" ? navigate("/social/add-plan") : null
                }
              >
                <div className="sp-add-icon">+</div>
                <div className="sp-add-label">Add New Plan</div>
              </div>
            ) : (
              <div
                className={`sp-card${selected === idx ? " selected" : ""}`}

                key={item.id}
                onClick={() => setSelected(idx)}
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" ? setSelected(idx) : null)}
              >
                <div className="sp-scheme">{item.scheme}</div>
                <div className="sp-plan">{item.chosenPlan}</div>
                <div className="sp-total">
                  RM {parseFloat(item.totalContribution).toFixed(2)}
                </div>
                {item.rdate && item.rtime && (
                  <div className="sp-reminder">
                    Reminder: {item.rdate}, {item.rtime}
                  </div>
                )}
                {/* SOCSO lock/unlock logic */}
                {item.scheme !== "i-Saraan KWSP" &&
                  (item.isLocked && item.unlockDate ? (
                    <div style={{ color: "grey", marginTop: 8 }}>
                      Plan is locked until{" "}
                      {item.unlockDate.toLocaleDateString("en-GB")}
                    </div>
                  ) : (
                    <div
                      style={{
                        color: "green",
                        marginTop: 8,
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                      onClick={() => {
                        setPlanToChange(item);
                        setNewPlan(item.chosenPlan);
                        setModalOpen(true);
                      }}
                    >
                      Change plan?
                    </div>
                  ))}
                <div className="sp-card-actions">
                  <button
                    className="sp-btn"
                    disabled={item.scheme !== "i-Saraan KWSP" && item.isLocked}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/social/record-contribution", {
                        state: {
                          scheme: item.scheme,
                          chosenPlan: item.chosenPlan,
                          id: item.id,
                        },
                      });
                    }}
                  >
                    Record Contribution
                  </button>
                  <button
                    className="sp-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/social/reminder", {
                        state: {
                          scheme: item.scheme,
                          chosenPlan: item.chosenPlan,
                          id: item.id,
                        },
                      });
                    }}
                  >
                    Set Reminder
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        {/* Modal for changing plan */}
        <ReactModal
          isOpen={modalOpen}
          onRequestClose={() => setModalOpen(false)}
          ariaHideApp={false}
          style={{
            overlay: {
              backgroundColor: "rgba(0,0,0,0.4)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
            content: {
              position: "static", // Remove absolute positioning
              inset: "unset", // Remove default inset
              maxWidth: 380,
              width: "100%",
              borderRadius: 16,
              padding: "32px 28px 24px 28px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              border: "none",
              margin: "auto",
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            },
          }}
        >
          <h2
            style={{
              margin: 0,
              marginBottom: 18,
              fontWeight: 700,
              color: "#20734f",
              textAlign: "center",
            }}
          >
            Change SOCSO Plan
          </h2>
          <div
            style={{
              marginBottom: 18,
              color: "#444",
              fontSize: 15,
              textAlign: "center",
            }}
          >
            Select a new plan for <b>{planToChange?.scheme}</b>
          </div>
          <select
            value={newPlan}
            onChange={(e) => setNewPlan(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #b6b6b6",
              fontSize: 16,
              marginBottom: 24,
              background: "#f8f8f8",
              color: "#222",
              outline: "none",
              fontFamily: "inherit",
            }}
          >
            <option value="Plan 1">Plan 1</option>
            <option value="Plan 2">Plan 2</option>
            <option value="Plan 3">Plan 3</option>
            <option value="Plan 4">Plan 4</option>
          </select>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button
              onClick={() => setModalOpen(false)}
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                border: "none",
                background: "#e0e0e0",
                color: "#333",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 15,
              }}
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (planToChange) {
                  const db = getDatabase();
                  await update(ref(db, `socialplan/${planToChange.id}`), {
                    chosenPlan: newPlan,
                  });

                }
                setModalOpen(false);
              }}
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                border: "none",
                background: "#20734f",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 15,
                boxShadow: "0 2px 8px rgba(32,115,79,0.08)",
              }}
            >
              Save
            </button>
          </div>
        </ReactModal>

        <div className="sp-benefits-section">
          {current && !current.isAddButton && (
            <>
              <div className="sp-benefits-title">Benefits</div>
              {current.scheme === "i-Saraan KWSP" ? (
                <ul className="sp-benefits-list">
                  {benefitKWSP.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              ) : (
                <ul className="sp-benefits-list">
                  {benefitSocso[current.chosenPlan]?.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}