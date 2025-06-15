import React, { useEffect, useState, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get, push, update, onValue } from "firebase/database";
import { Link } from "react-router-dom";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import "./redeem.css";

const sections = [
  { name: "Personal", fields: ["fullName", "dob", "gender", "email", "phone", "address"] },
  { name: "Identification", fields: ["nricId", "icPhotos", "taxId", "workPermit"] },
  { name: "Professional", fields: ["workStatus", "workCategory", "experience", "languages", "platforms"] },
  { name: "Finance", fields: ["bank", "bankAccountNumber"] },
  { name: "Compliance", fields: ["insuranceCoverage", "socialSecurity", "licenses", "gdl"] }
];

const RANGES = [
  { label: "2 km", value: 2000 },
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
  { label: "20 km", value: 20000 }
];
const VOUCHER_AMOUNTS = [50];
const mapContainerStyle = { width: "100%", height: "340px" };

function getDistance(loc1, loc2) {
  const R = 6371000, toRad = deg => deg * Math.PI / 180;
  const dLat = toRad(loc2.lat - loc1.lat);
  const dLng = toRad(loc2.lng - loc1.lng);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(loc1.lat)) * Math.cos(toRad(loc2.lat)) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDate(ts) {
  if (!ts) return "-";
  const d = new Date(ts);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getExpiryCountdown(expiresAt) {
  if (!expiresAt) return "";
  const ms = expiresAt - Date.now();
  if (ms <= 0) return "Expired";
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const seconds = Math.floor((ms / 1000) % 60);
  if (days > 0) return `Expires in ${days} day${days > 1 ? "s" : ""} ${hours}h`;
  if (hours > 0) return `Expires in ${hours} hour${hours > 1 ? "s" : ""} ${minutes}m`;
  if (minutes > 0) return `Expires in ${minutes} minute${minutes !== 1 ? "s" : ""} ${seconds}s`;
  return `Expires in ${seconds} second${seconds !== 1 ? "s" : ""}`;
}

function useCountdown(expiresAt, status) {
  const [countdown, setCountdown] = useState(getExpiryCountdown(expiresAt));
  useEffect(() => {
    if (status !== "Unused") return;
    setCountdown(getExpiryCountdown(expiresAt));
    const interval = setInterval(() => {
      setCountdown(getExpiryCountdown(expiresAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, status]);
  return countdown;
}

function VoucherCard({ voucher, getStatusBadge, handleCopy, copyMsg, showConfirm, setShowConfirm, handleMarkUsed }) {
  const countdown = useCountdown(voucher.expiresAt, voucher.status);

  return (
    <div className="voucher-history-card">
      <div className="voucher-header-row">
        <span className="voucher-amount-value">RM{voucher.amount} Voucher</span>
        {getStatusBadge(voucher.status)}
      </div>
      <div className="voucher-code-row">
        <span className="voucher-code">{voucher.code}</span>
        <button className="copy-btn" onClick={() => handleCopy(voucher.code)}>Copy</button>
        {copyMsg && <span className="copy-msg">{copyMsg}</span>}
      </div>
      <div className="voucher-date-row">
        <span>Generated: {formatDate(voucher.created)}</span>
        <span>Expires: {formatDate(voucher.expiresAt)}</span>
      </div>
      {voucher.status === "Unused" && (
        <div className="voucher-expiry-countdown">
          {countdown}
        </div>
      )}
      {voucher.incentive && (
        <div className="voucher-incentive">
          <strong>Incentive:</strong> {voucher.incentive}
        </div>
      )}
      {voucher.description && (
        <div className="voucher-description">
          {voucher.description}
        </div>
      )}
      <div className="voucher-instructions">
        Show this code at the petrol station counter to redeem your voucher.
      </div>
      {voucher.status === "Unused" && (
        <button className="redeem-glass-btn" onClick={() => setShowConfirm(voucher.id)}>Mark as Used</button>
      )}
      {showConfirm === voucher.id && (
        <div className="modal-overlay" onClick={() => setShowConfirm(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h4>Confirm Redemption</h4>
            <p>Are you sure you want to mark this voucher as used? This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 16, marginTop: 18 }}>
              <button className="redeem-glass-btn" onClick={() => handleMarkUsed(voucher.id)}>Yes</button>
              <button className="redeem-glass-btn secondary" onClick={() => setShowConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Redeem() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({});
  const [profilePercent, setProfilePercent] = useState(0);
  const [vouchers, setVouchers] = useState([]);
  const [hasGeneratedVoucher, setHasGeneratedVoucher] = useState(false);
  const [tab, setTab] = useState("voucher");
  const [range, setRange] = useState(RANGES[2].value);
  const [location, setLocation] = useState(null);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [copyMsg, setCopyMsg] = useState("");
  const [showConfirm, setShowConfirm] = useState(null);
  const [tabAnim, setTabAnim] = useState("fade-in");
  const [searchQuery, setSearchQuery] = useState("");
  const mapRef = useRef(null);
  const [showUnusedMsg, setShowUnusedMsg] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyC_DEkV1SbS4oOawjSgzPfgdoattVhEaM8",
    libraries: ["places"]
  });

  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    const db = getDatabase();
    get(ref(db, `users/${user.uid}`)).then(snap => {
      if (snap.exists()) {
        const data = snap.val();
        setUserData(data);
        setProfilePercent(getProfileCompletion(data));
      }
    });
    // Listen for all vouchers
    const voucherRef = ref(db, `vouchers/${user.uid}`);
    return onValue(voucherRef, (snap) => {
      const data = snap.val();
      let arr = [];
      if (data) {
        arr = Object.entries(data).map(([id, v]) => ({
          id,
          ...v,
        }));
        // Sort: Unused first, then Used, then Expired, then by date
        arr.sort((a, b) => {
          const order = { Unused: 0, Used: 1, Expired: 2 };
          return order[a.status] - order[b.status] || (b.created - a.created);
        });
        setHasGeneratedVoucher(arr.length > 0);
      } else {
        setHasGeneratedVoucher(false);
      }
      setVouchers(arr);
    });
  }, [user]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocation({ lat: 3.139, lng: 101.6869 })
    );
  }, []);

  useEffect(() => {
    if (!isLoaded || !location) return;
    const service = new window.google.maps.places.PlacesService(document.createElement("div"));
    service.nearbySearch({
      location,
      radius: range,
      type: "gas_station"
    }, (results, status) => {
      if (status === "OK") {
        const enriched = results.map(st => ({
          ...st,
          distance: getDistance(location, {
            lat: st.geometry.location.lat(),
            lng: st.geometry.location.lng()
          })
        }));
        setStations(enriched.sort((a, b) => a.distance - b.distance));
      } else setStations([]);
    });
  }, [isLoaded, location, range]);

  useEffect(() => {
    if (!mapRef.current || !searchQuery || stations.length === 0) return;
    const match = stations.find(st =>
      (st.name && st.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (st.vicinity && st.vicinity.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (st.types && st.types.join(" ").toLowerCase().includes(searchQuery.toLowerCase()))
    );
    if (match) {
      mapRef.current.panTo({
        lat: match.geometry.location.lat(),
        lng: match.geometry.location.lng()
      });
    }
  }, [searchQuery, stations]);

  useEffect(() => {
    if (!user || !vouchers.length) return;
    const now = Date.now();
    vouchers.forEach((v) => {
      if (v.status === "Unused" && v.expiresAt && now > v.expiresAt) {
        update(ref(getDatabase(), `vouchers/${user.uid}/${v.id}`), { status: "Expired" });
      }
    });
    // eslint-disable-next-line
  }, [vouchers]);

  const getProfileCompletion = (data) => {
    const allFields = sections.flatMap(s => s.fields);
    if (data.gdl === "Yes") {
      allFields.push("gdlDocument");
    }
    const filledCount = allFields.filter(f => {
      const v = data[f];
      if (f === "platforms") return Array.isArray(v) && v.length > 0 && v.every(p => p.name && p.id);
      if (["languages", "insuranceCoverage", "licenses", "icPhotos"].includes(f)) return Array.isArray(v) && v.length > 0;
      if (f === "gdl") return v === "Yes" || v === "No";
      if (f === "gdlDocument") return !!v;
      return v !== undefined && v !== null && v !== "";
    }).length;
    return Math.round((filledCount / allFields.length) * 100);
  };

  const getStatusBadge = status => (
    status === "Unused"
      ? <span className="badge badge-green">Unused</span>
      : status === "Used"
      ? <span className="badge badge-red">Used</span>
      : status === "Expired"
      ? <span className="badge badge-grey">Expired</span>
      : null
  );

  const handleGenerateVoucher = async () => {
    // Only allow if user has never generated any voucher
    if (hasGeneratedVoucher) {
      setShowUnusedMsg(true);
      setTimeout(() => setShowUnusedMsg(false), 3000); // Show for 3 seconds
      return;
    }
    setShowUnusedMsg(false);
    const code = "PETRO-" + Math.random().toString(36).substr(2, 8).toUpperCase();
    const now = Date.now();
    const expiresAt = now + 1000 * 60 * 60 * 24 * 7; // 7 days expiry
    const randomAmount = VOUCHER_AMOUNTS[Math.floor(Math.random() * VOUCHER_AMOUNTS.length)];
    const newVoucher = {
      code,
      created: now,
      expiresAt,
      status: "Unused",
      amount: randomAmount,
      incentive: "Gig Worker Data Completion",
      description: "Reward for completing your government-requested profile information."
    };
    await push(ref(getDatabase(), `vouchers/${user.uid}`), newVoucher);
    setToastMsg("Voucher generated successfully!");
    setTimeout(() => setToastMsg(""), 2000);
  };

  const handleMarkUsed = async (id) => {
    await update(ref(getDatabase(), `vouchers/${user.uid}/${id}`), { status: "Used" });
    setShowConfirm(null);
    setToastMsg("Voucher marked as used!");
    setTimeout(() => setToastMsg(""), 2000);
  };

  const handleCopy = code => {
    navigator.clipboard.writeText(code);
    setCopyMsg("Copied!");
    setTimeout(() => setCopyMsg(""), 1200);
  };

  const handleTabChange = tab => {
    setTabAnim("fade-out");
    setTimeout(() => {
      setTab(tab);
      setTabAnim("fade-in");
    }, 180);
  };

  const filteredStations = stations.filter(st =>
    (st.name && st.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (st.vicinity && st.vicinity.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (st.types && st.types.join(" ").toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="redeem-container">
      {toastMsg && (
        <div className="toast-success">{toastMsg}</div>
      )}
      <div className="redeem-glass-wrapper">
        <div className="redeem-glass-header">
          <h2>Redeem Petrol Voucher</h2>
          <div className="redeem-glass-progress">
            <div className="redeem-glass-progress-bar">
              <div className="redeem-glass-progress-fill" style={{ width: `${profilePercent}%` }} />
            </div>
            <span className="redeem-glass-progress-label">{profilePercent}% Profile Completed</span>
          </div>
          {profilePercent < 100 && (
            <div className="redeem-glass-blocked">
              <p>Complete your profile to access voucher redemption.</p>
              <Link to="/edit-profile"><button className="redeem-glass-btn">Complete Profile</button></Link>
            </div>
          )}
        </div>

        {profilePercent === 100 && (
          <>
            <div className="redeem-glass-tabs">
              <button className={tab === "voucher" ? "tab active" : "tab"} onClick={() => handleTabChange("voucher")}>My Voucher</button>
              <button className={tab === "station" ? "tab active" : "tab"} onClick={() => handleTabChange("station")}>Find Station</button>
              <button className={tab === "guide" ? "tab active" : "tab"} onClick={() => handleTabChange("guide")}>Guide</button>
            </div>

            <div className={`redeem-glass-tab-content ${tabAnim}`}>
              {tab === "voucher" && (
                <div className="redeem-glass-card voucher-card-glass">
                  <h3>Voucher History</h3>
                  <div>
                    <div className="voucher-amount-row">
                      <button
                        className="redeem-glass-btn"
                        onClick={handleGenerateVoucher}
                        // Do NOT disable the button, so user can always click to see the message
                      >
                        Generate Voucher
                      </button>
                      {showUnusedMsg && (
                        <div className="voucher-info-msg">
                          You have already generated your voucher. Only one voucher is allowed per user.
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="voucher-history-list">
                    {vouchers.length === 0 ? (
                      <div style={{ color: "#888", marginTop: 24 }}>No vouchers yet.</div>
                    ) : (
                      vouchers.map((voucher) => (
                        <VoucherCard
                          key={voucher.id}
                          voucher={voucher}
                          getStatusBadge={getStatusBadge}
                          handleCopy={handleCopy}
                          copyMsg={copyMsg}
                          showConfirm={showConfirm}
                          setShowConfirm={setShowConfirm}
                          handleMarkUsed={handleMarkUsed}
                        />
                      ))
                    )}
                  </div>
                </div>
              )}

              {tab === "station" && (
                <div className="redeem-glass-card">
                  <h3>Find Petrol Stations</h3>
                  <div className="station-search">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search by name, brand, or location"
                      style={{ padding: "8px 12px", flex: 1 }}
                    />
                  </div>
                  <div className="station-filters">
                    <label>
                      Range:
                      <select value={range || 10000} onChange={e => setRange(Number(e.target.value))}>
                        {RANGES.map(r => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  {location && (
                    <div className="location-info">
                      Your location: <span>{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</span>
                    </div>
                  )}
                  {isLoaded && location && (
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={location}
                      zoom={13}
                      onLoad={map => mapRef.current = map}
                      options={{
                        mapTypeControl: false,
                        streetViewControl: false,
                        fullscreenControl: false
                      }}
                    >
                      <Marker
                        position={location}
                        title="Your Location"
                        icon={{
                          url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                          scaledSize: new window.google.maps.Size(40, 40)
                        }}
                      />
                      {filteredStations.map((station, idx) => (
                        <Marker
                          key={idx}
                          position={{
                            lat: station.geometry.location.lat(),
                            lng: station.geometry.location.lng()
                          }}
                          onClick={() => setSelectedStation(station)}
                          title={station.name}
                        />
                      ))}
                      {selectedStation && (
                        <InfoWindow
                          position={{
                            lat: selectedStation.geometry.location.lat(),
                            lng: selectedStation.geometry.location.lng()
                          }}
                          onCloseClick={() => setSelectedStation(null)}
                        >
                          <div className="station-info-window">
                            <b>{selectedStation.name}</b>
                            <div>{selectedStation.vicinity}</div>
                            <div>Distance: {(selectedStation.distance / 1000).toFixed(2)} km</div>
                            <button
                              className="open-maps-btn"
                              onClick={() => {
                                const lat = selectedStation.geometry.location.lat();
                                const lng = selectedStation.geometry.location.lng();
                                window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, "_blank");
                              }}
                            >
                              Open in Google Maps
                            </button>
                          </div>
                        </InfoWindow>
                      )}
                    </GoogleMap>
                  )}
                  <div style={{ marginTop: 24 }}>
                    {filteredStations.length === 0 ? (
                      <div style={{ color: "#888" }}>No stations found for "{searchQuery}"</div>
                    ) : (
                      filteredStations.slice(0, 10).map((station, idx) => (
                        <div
                          key={idx}
                          className="station-card"
                          style={{
                            border: "1px solid #e0e0e0",
                            borderRadius: 10,
                            padding: 14,
                            marginBottom: 12,
                            background: "#fff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                          }}
                          onClick={() => {
                            setSelectedStation(station);
                            if (mapRef.current) {
                              mapRef.current.panTo({
                                lat: station.geometry.location.lat(),
                                lng: station.geometry.location.lng()
                              });
                            }
                          }}
                        >
                          <div style={{ fontWeight: "bold", fontSize: "1.08em" }}>{station.name}</div>
                          <div style={{ color: "#1976d2", fontSize: "0.98em" }}>{station.vicinity}</div>
                          <div style={{ color: "#888", fontSize: "0.95em" }}>
                            Distance: {(station.distance / 1000).toFixed(2)} km
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {tab === "guide" && (
                <div className="redeem-glass-card">
                  <h3>How to Use the Petrol Voucher Feature</h3>
                  <ol>
                    <li>
                      <b>Complete Your Profile:</b> Fill in all required information in your profile to reach 100% completion.
                    </li>
                    <li>
                      <b>Generate a Voucher:</b> Once your profile is complete, click <b>Generate Voucher</b>. A petrol voucher will be given to you as an incentive.
                    </li>
                    <li>
                      <b>View and Use Your Voucher:</b> Your voucher code, amount, and expiry will appear in your voucher history. Show this code at a participating petrol station to redeem.
                    </li>
                    <li>
                      <b>Find Petrol Stations:</b> Use the <b>Find Station</b> tab to locate nearby petrol stations. You can open the location in Google Maps for navigation.
                    </li>
                    <li>
                      <b>Mark as Used:</b> After redeeming your voucher, click <b>Mark as Used</b> to update your voucher status.
                    </li>
                    <li>
                      <b>Voucher Expiry:</b> Each voucher has a validity period. Use it before it expires! Expired vouchers cannot be redeemed.
                    </li>
                  </ol>
                  <p style={{marginTop: 18, color: "#1976d2"}}>
                    <b>Tip:</b> Keep your profile updated to receive more incentives in the future!
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}