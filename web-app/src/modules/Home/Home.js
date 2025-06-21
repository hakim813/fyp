import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get, onValue } from "firebase/database";
import { Link } from "react-router-dom";
import { FaUserEdit, FaGasPump, FaMapMarkedAlt, FaComments, FaHandsHelping, FaMoneyBillWave } from "react-icons/fa";
import "./home.css";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getRandomTip() {
  const tips = [
    "Keep your profile updated to unlock more incentives.",
    "You can find the nearest petrol station from your dashboard.",
    "Mark your voucher as used after redemption.",
    "Check the Helpdesk if you need assistance.",
    "Stay tuned for new government incentives."
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

function Home() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({ fullName: "", profilePercent: 0, photoURL: "" });
  const [recentVouchers, setRecentVouchers] = useState([]);
  const [finance, setFinance] = useState({ income: 0, expense: 0 });
  const [activityFeed, setActivityFeed] = useState([]);
  const [tip, setTip] = useState(getRandomTip());
  const [loading, setLoading] = useState(true);

  // Profile completion logic
  const sections = [
    { fields: ["fullName", "dob", "gender", "email", "phone", "address"] },
    { fields: ["nricId", "icPhotos", "taxId", "workPermit"] },
    { fields: ["workStatus", "workCategory", "experience", "languages", "platforms"] },
    { fields: ["bank", "bankAccountNumber"] },
    { fields: ["insuranceCoverage", "socialSecurity", "licenses", "gdl"] }
  ];
  function getProfileCompletion(data) {
    const allFields = sections.flatMap(s => s.fields);
    if (data.gdl === "Yes") allFields.push("gdlDocument");
    const filledCount = allFields.filter(f => {
      const v = data[f];
      if (f === "platforms") return Array.isArray(v) && v.length > 0 && v.every(p => p.name && p.id);
      if (["languages", "insuranceCoverage", "licenses", "icPhotos"].includes(f)) return Array.isArray(v) && v.length > 0;
      if (f === "gdl") return v === "Yes" || v === "No";
      if (f === "gdlDocument") return !!v;
      return v !== undefined && v !== null && v !== "";
    }).length;
    return Math.round((filledCount / allFields.length) * 100);
  }

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const db = getDatabase();
        // Fetch user profile
        get(ref(db, `users/${firebaseUser.uid}`)).then(snap => {
          if (snap.exists()) {
            const data = snap.val();
            setUserData({
              ...data,
              profilePercent: getProfileCompletion(data),
              photoURL: data.profilePhoto || data.photoURL || ""
            });
          }
        });
        // Fetch recent vouchers (limit to 3, most recent)
        const voucherRef = ref(db, `vouchers/${firebaseUser.uid}`);
        onValue(voucherRef, (snap) => {
          const data = snap.val();
          let arr = [];
          if (data) {
            arr = Object.entries(data).map(([id, v]) => ({
              id,
              ...v,
            }));
            arr.sort((a, b) => b.created - a.created);
            arr = arr.slice(0, 3);
          }
          setRecentVouchers(arr);
          setLoading(false);
        });
        // Fetch today's finance summary
        const financeRef = ref(db, "financeRecords");
        onValue(financeRef, (snap) => {
          const data = snap.val();
          if (data) {
            const today = new Date();
            const todayStr = today.toDateString();
            let income = 0;
            let expense = 0;
            Object.values(data).forEach((rec) => {
              if (rec.email === firebaseUser.email) {
                const recordDate = new Date(rec.date).toDateString();
                if (recordDate === todayStr) {
                  if (rec.type === "Income") {
                    income += parseFloat(rec.value);
                  } else if (rec.type === "Expense") {
                    expense += parseFloat(rec.value);
                  }
                }
              }
            });
            setFinance({ income, expense });
          }
        });

        // Fetch recent activity feed (dummy, replace with real logic if available)
        get(ref(db, `activity/${firebaseUser.uid}`)).then(snap => {
          if (snap.exists()) {
            const arr = Object.values(snap.val()).sort((a, b) => b.time - a.time).slice(0, 5);
            setActivityFeed(arr);
          } else {
            setActivityFeed([
              { type: "voucher", message: "You redeemed a RM20 petrol voucher.", time: Date.now() - 3600000 },
              { type: "profile", message: "Profile updated.", time: Date.now() - 7200000 }
            ]);
          }
        });
      }
    });
    // Rotate tip every 15 seconds
    const tipInterval = setInterval(() => setTip(getRandomTip()), 15000);
    return () => {
      unsub();
      clearInterval(tipInterval);
    };
    // eslint-disable-next-line
  }, []);

  // Animated progress bar
  const [animatedPercent, setAnimatedPercent] = useState(0);
  useEffect(() => {
    let raf;
    if (userData.profilePercent > 0) {
      let start = 0;
      const animate = () => {
        if (start < userData.profilePercent) {
          start += 2;
          setAnimatedPercent(Math.min(start, userData.profilePercent));
          raf = requestAnimationFrame(animate);
        } else {
          setAnimatedPercent(userData.profilePercent);
        }
      };
      animate();
    }
    return () => raf && cancelAnimationFrame(raf);
  }, [userData.profilePercent]);

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="greeting-row">
          <div>
            <h1>
              {getGreeting()}, <span className="user-name">{userData.fullName || "User"}</span>
            </h1>
            <div className="profile-progress">
              <span>Profile Completion</span>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${animatedPercent}%` }}
                />
              </div>
              <span>{animatedPercent}%</span>
              {userData.profilePercent < 100 && (
                <Link to="/edit-profile">
                  <button className="complete-profile-btn">
                    <FaUserEdit style={{ marginRight: 6 }} />
                    Complete Profile
                  </button>
                </Link>
              )}
            </div>
          </div>
          <div>
            {userData.photoURL ? (
              <img className="profile-photo" src={userData.photoURL} alt="Profile" />
            ) : (
              <div className="profile-photo placeholder">
                <span>{userData.fullName ? userData.fullName[0].toUpperCase() : "U"}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="main-content-grid">
        {/* Left Column */}
        <div className="main-col main-col-left">
          <section className="finance-summary minimalist-card">
            <h2>
              Today's Financial Summary
            </h2>
            <div className="finance-cards">
              <div className="finance-card income">
                <span className="label">Income</span>
                <span className="value">RM{finance.income || 0}</span>
              </div>
              <div className="finance-card expense">
                <span className="label">Expense</span>
                <span className="value">RM{finance.expense || 0}</span>
              </div>
            </div>
            <Link to="/finance" className="view-finance-link">View full finance manager</Link>
          </section>

          <section className="recent-vouchers minimalist-card">
            <h2>
              Recent Vouchers
            </h2>
            {loading ? (
              <div className="empty-state">Loading...</div>
            ) : recentVouchers.length === 0 ? (
              <div className="empty-state">No vouchers yet. <Link to="/redeem">Generate your first voucher!</Link></div>
            ) : (
              <div className="voucher-list">
                {recentVouchers.map((v, idx) => (
                  <div className={`voucher-card ${v.status === "Unused" ? "highlight" : ""}`} key={idx}>
                    <div>
                      <span className="voucher-amount">RM{v.amount}</span>
                      <span className={`voucher-status ${v.status ? v.status.toLowerCase() : ""}`}>{v.status}</span>
                    </div>
                    <div className="voucher-code">{v.code}</div>
                    <div className="voucher-expiry">
                      {v.status === "Unused" && v.expiresAt
                        ? <VoucherCountdown expiresAt={v.expiresAt} />
                        : v.status === "Used"
                        ? "Used"
                        : "Expired"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column */}
        <div className="main-col main-col-right">
          <section className="quick-actions minimalist-card">
            <h2>
              Quick Actions
            </h2>
            <div className="actions-list">
              <Link to="/redeem">
                <button className="action-btn"> Redeem Voucher</button>
              </Link>
              <Link to="/edit-profile">
                <button className="action-btn"> Edit Profile</button>
              </Link>
              <Link to="/forum">
                <button className="action-btn"> Forum</button>
              </Link>
              <Link to="/helpdesk">
                <button className="action-btn"> Helpdesk</button>
              </Link>
            </div>
          </section>

          <section className="info-shortcuts minimalist-card">
            <h2>Information & Benefits</h2>
            <div className="info-cards">
              <a
                className="info-card"
                href="https://www.perkeso.gov.my/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="https://images.seeklogo.com/logo-png/28/1/perkeso-socso-logo-png_seeklogo-284443.png" alt="SOCSO" />
                <div className="info-title">SOCSO Protection</div>
              </a>
              <a
                className="info-card"
                href="https://www.kwsp.gov.my/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src="https://images.seeklogo.com/logo-png/29/1/kwsp-logo-png_seeklogo-298804.png" alt="KWSP" />
                <div className="info-title">KWSP (EPF)</div>
              </a>
            </div>
          </section>

          <section className="activity-feed minimalist-card">
            <h2>
              Recent Activity
            </h2>
            {activityFeed.length === 0 ? (
              <div className="empty-state">No recent activity.</div>
            ) : (
              <ul className="activity-list">
                {activityFeed.map((a, idx) => (
                  <li key={idx} className="activity-item">
                    <span className="activity-dot" />
                    <span className="activity-msg">{a.message}</span>
                    <span className="activity-time">{timeAgo(a.time)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="tip-section minimalist-card">
            <div className="tip-content">
              <span>{tip}</span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// Voucher countdown as a live component
function VoucherCountdown({ expiresAt }) {
  const [countdown, setCountdown] = useState(getCountdown(expiresAt));
  useEffect(() => {
    const interval = setInterval(() => setCountdown(getCountdown(expiresAt)), 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);
  return <span>{countdown}</span>;
}
function getCountdown(expiresAt) {
  if (!expiresAt) return "";
  const ms = expiresAt - Date.now();
  if (ms <= 0) return "Expired";
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const seconds = Math.floor((ms / 1000) % 60);

  return `Expires in ${days} day${days !== 1 ? "s" : ""} ${hours}h ${minutes}m ${seconds}s`;
}

// Human-readable time ago
function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hr ago`;
  return `${Math.floor(diff / 86400000)} day(s) ago`;
}

export default Home;