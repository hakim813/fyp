import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { useUser } from "../../utils/UserContext";
import { useNavigate } from "react-router-dom";
import "./sp.css";
import Navbar from "../../components/Navbar";

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

  useEffect(() => {
    if (!user) return;
    const db = getDatabase();
    const postsRef = ref(db, "socialplan");

    onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      let fetchedPlans = [];
      if (data) {
        fetchedPlans = Object.keys(data)
          .map((key) => ({
            id: key,
            user: data[key].user,
            email: data[key].email,
            scheme: data[key].scheme,
            chosenPlan: data[key].chosenPlan,
            totalContribution: data[key].totalContribution,
            rdate: data[key].rdate ?? null,
            rtime: data[key].rtime ?? null,
          }))
          .filter((item) => item.email === user.email);
      }
      // Add the 'Add New Plan' dummy card at the end
      fetchedPlans.push({ isAddButton: true });
      setPlans(fetchedPlans);
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
                onKeyDown={e => (e.key === "Enter" ? navigate("/social/add-plan") : null)}
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
                onKeyDown={e => (e.key === "Enter" ? setSelected(idx) : null)}
              >
                <div className="sp-scheme">{item.scheme}</div>
                <div className="sp-plan">{item.chosenPlan}</div>
                <div className="sp-total">RM {parseFloat(item.totalContribution).toFixed(2)}</div>
                {item.rdate && item.rtime && (
                  <div className="sp-reminder">
                    Reminder: {item.rdate}, {item.rtime}
                  </div>
                )}
                <div className="sp-card-actions">
                  <button
                    className="sp-btn"
                    onClick={e => {
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
                    onClick={e => {
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