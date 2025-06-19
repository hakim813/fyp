import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { getDatabase, ref, onValue } from "firebase/database";
import { useUser } from "../../utils/UserContext";
import { useNavigate } from "react-router-dom";
import "./contributionRecord.css";

export default function ContributionRecord() {
  const [socsoRecords, setSocsoRecords] = useState([]);
  const [kwspRecords, setKwspRecords] = useState([]);
  const [isSocso, setIsSocso] = useState(true);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const db = getDatabase();
    const SPRecordref = ref(db, "SPcontribution");

    onValue(SPRecordref, (snapshot) => {
      const data = snapshot.val();
      let fetchedSOCSO = [];
      let fetchedKWSP = [];

      if (data) {
        fetchedKWSP = Object.keys(data)
          .map((key) => ({
            id: key,
            chosenPlan: data[key].chosenPlan,
            scheme: data[key].scheme,
            createdAt: data[key].createdAt,
            email: data[key].email,
            value: data[key].value,
          }))
          .filter(
            (item) =>
              item.email === user.email && item.scheme === "i-Saraan KWSP"
          );

        fetchedSOCSO = Object.keys(data)
          .map((key) => ({
            id: key,
            chosenPlan: data[key].chosenPlan,
            scheme: data[key].scheme,
            createdAt: data[key].createdAt,
            email: data[key].email,
            value: data[key].value,
            monthsCovered: data[key].monthsCovered,
          }))
          .filter(
            (item) =>
              item.email === user.email && item.scheme !== "i-Saraan KWSP"
          );
      }
      setSocsoRecords(fetchedSOCSO);
      setKwspRecords(fetchedKWSP);
    });
  }, [user]);

  return (
    <>
      <Navbar />
      <div className="contribution-container">
        <h2>Contribution History</h2>
        <div className="contribution-toggle">
          <button
            className={isSocso ? "toggle-btn active" : "toggle-btn"}
            onClick={() => setIsSocso(true)}
          >
            SOCSO (PERKESO)
          </button>
          <button
            className={!isSocso ? "toggle-btn active" : "toggle-btn"}
            onClick={() => setIsSocso(false)}
          >
            KWSP i-Saraan
          </button>
        </div>
        <div className="contribution-list">
          {isSocso
            ? socsoRecords.length === 0
              ? <div className="contribution-empty">No SOCSO records found.</div>
              : socsoRecords.map((item) => (
                  <div className="contribution-card" key={item.id}>
                    <div className="contribution-header">
                      <span className="contribution-scheme">SOCSO (PERKESO)</span>
                      <span className="contribution-plan">{item.chosenPlan}</span>
                    </div>
                    <div className="contribution-date">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <div className="contribution-label">Months Covered</div>
                    <div className="contribution-value">{item.monthsCovered}</div>
                    <div className="contribution-label">Total Contributed</div>
                    <div className="contribution-value">RM {parseFloat(item.value).toFixed(2)}</div>
                  </div>
                ))
            : kwspRecords.length === 0
              ? <div className="contribution-empty">No KWSP records found.</div>
              : kwspRecords.map((item) => (
                  <div className="contribution-card" key={item.id}>
                    <div className="contribution-header">
                      <span className="contribution-scheme">{item.scheme}</span>
                      <span className="contribution-plan">{item.chosenPlan}</span>
                    </div>
                    <div className="contribution-date">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <div className="contribution-label">Months Covered</div>
                    <div className="contribution-value">None</div>
                    <div className="contribution-label">Total Contributed</div>
                    <div className="contribution-value">RM {parseFloat(item.value).toFixed(2)}</div>
                  </div>
                ))
          }
        </div>
        <div className="form-actions" style={{ marginTop: 24 }}>
          <button
            className="btn btn-back"
            type="button"
            onClick={() => navigate("/social")}
          >
            Back
          </button>
        </div>
      </div>
    </>
  );
}