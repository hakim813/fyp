import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get, set } from "firebase/database";
import { Link } from "react-router-dom";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import "../../styles/redeem.css";

const requiredFields = [
  "fullName", "dob", "email", "phone", "address", "profilePhoto",
  "nricId", "icPhotos", "taxId", "workPermit",
  "workStatus", "workCategory", "experience", "languages",
  "bank", "bankAccountNumber", "insuranceCoverage", "socialSecurity", "licenses"
];

const BRANDS = [
  { label: "All", keyword: "", icon: "https://cdn-icons-png.flaticon.com/512/854/854878.png" },
  { label: "Petronas", keyword: "Petronas", icon: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Petronas_logo.svg" },
  { label: "Shell", keyword: "Shell", icon: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Shell_logo.svg" },
  { label: "Petron", keyword: "Petron", icon: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Petron_Corporation_logo.svg" }
];

const RANGES = [
  { label: "2 km", value: 2000 },
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
  { label: "20 km", value: 20000 }
];

function getProfileCompletion(userData) {
  const filled = requiredFields.filter(f => {
    const v = userData[f];
    if (Array.isArray(v)) return v.length > 0;
    return v !== undefined && v !== null && v !== "";
  }).length;
  return Math.round((filled / requiredFields.length) * 100);
}

function getStatusBadge(status) {
  if (status === "Unused") return <span className="badge badge-green">Unused</span>;
  if (status === "Used") return <span className="badge badge-red">Used</span>;
  return null;
}

const mapContainerStyle = {
  width: "100%",
  height: "340px"
};

export default function Redeem() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({});
  const [profilePercent, setProfilePercent] = useState(0);
  const [voucher, setVoucher] = useState(null);
  const [tab, setTab] = useState("voucher");
  const [brand, setBrand] = useState(BRANDS[0].label);
  const [range, setRange] = useState(RANGES[2].value);
  const [location, setLocation] = useState(null);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [copyMsg, setCopyMsg] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [tabAnim, setTabAnim] = useState("fade-in");

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY",
    libraries: ["places"]
  });

  // Listen for Firebase Auth user
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch user data and voucher when user is available
  useEffect(() => {
    if (!user) return;
    const db = getDatabase();
    const userRef = ref(db, `users/${user.uid}`);
    get(userRef).then(snap => {
      if (snap.exists()) {
        const data = snap.val();
        setUserData(data);
        setProfilePercent(getProfileCompletion(data));
      }
    });
    get(ref(db, `voucher/${user.uid}`)).then(snap => {
      if (snap.exists()) {
        setVoucher(snap.val());
      }
    });
  }, [user]);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }),
        () => setLocation({ lat: 3.139, lng: 101.6869 }) // fallback: KL
      );
    } else {
      setLocation({ lat: 3.139, lng: 101.6869 });
    }
  }, []);

  // Fetch stations when map is loaded, location, brand, or range changes
  useEffect(() => {
    if (!isLoaded || !location) return;
    const service = new window.google.maps.places.PlacesService(document.createElement("div"));
    service.nearbySearch(
      {
        location,
        radius: range,
        keyword: brand === "All" ? "" : brand,
        type: "gas_station"
      },
      (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          const withDist = results.map(st => ({
            ...st,
            distance: getDistance(location, {
              lat: st.geometry.location.lat(),
              lng: st.geometry.location.lng()
            })
          }));
          setStations(withDist.sort((a, b) => a.distance - b.distance));
        } else {
          setStations([]);
        }
      }
    );
  }, [isLoaded, location, brand, range]);

  // Generate a one-time voucher (if not exists)
  const handleGenerateVoucher = async () => {
    if (voucher) return;
    const code = "PETRO-" + Math.random().toString(36).substr(2, 8).toUpperCase();
    const newVoucher = {
      code,
      created: Date.now(),
      status: "Unused",
    };
    await set(ref(getDatabase(), `voucher/${user.uid}`), newVoucher);
    setVoucher(newVoucher);
  };

  // Mark voucher as used
  const handleMarkUsed = async () => {
    if (!voucher) return;
    await set(ref(getDatabase(), `voucher/${user.uid}/status`), "Used");
    setVoucher({ ...voucher, status: "Used" });
    setShowConfirm(false);
  };

  // Copy voucher code to clipboard
  const handleCopy = code => {
    navigator.clipboard.writeText(code);
    setCopyMsg("Copied!");
    setTimeout(() => setCopyMsg(""), 1200);
  };

  function getDistance(loc1, loc2) {
    const toRad = deg => deg * Math.PI / 180;
    const R = 6371000;
    const dLat = toRad(loc2.lat - loc1.lat);
    const dLng = toRad(loc2.lng - loc1.lng);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(loc1.lat)) * Math.cos(toRad(loc2.lat)) *
      Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  const handleTabChange = (newTab) => {
    setTabAnim("fade-out");
    setTimeout(() => {
      setTab(newTab);
      setTabAnim("fade-in");
    }, 180);
  };

  return (
    <div className="redeem-glass-wrapper">
      <div className="redeem-glass-header">
        <h2>Redeem Petrol Voucher</h2>
        <div className="redeem-glass-progress" title="Profile completion required for voucher access">
          <div className="redeem-glass-progress-bar">
            <div className="redeem-glass-progress-fill" style={{ width: `${profilePercent}%` }} />
          </div>
          <span className="redeem-glass-progress-label">{profilePercent}% Profile Completed</span>
        </div>
        {profilePercent < 100 && (
          <div className="redeem-glass-blocked">
            <p>
              Complete your profile to access voucher redemption.
            </p>
            <Link to="/edit-profile">
              <button className="redeem-glass-btn">Complete Profile</button>
            </Link>
          </div>
        )}
      </div>

      {profilePercent === 100 && (
        <>
          <div className="redeem-glass-tabs">
            <button className={tab === "voucher" ? "tab active" : "tab"} onClick={() => handleTabChange("voucher")}>My Voucher</button>
            <button className={tab === "station" ? "tab active" : "tab"} onClick={() => handleTabChange("station")}>Find Station</button>
            <button className={tab === "help" ? "tab active" : "tab"} onClick={() => handleTabChange("help")}>Help</button>
          </div>

          <div className={`redeem-glass-tab-content ${tabAnim}`}>
            {tab === "voucher" && (
              <div className="redeem-glass-card voucher-card-glass">
                <h3>Voucher Details</h3>
                {voucher ? (
                  <div>
                    <div className="voucher-code-row">
                      <span className="voucher-code">{voucher.code}</span>
                      <button className="copy-btn" onClick={() => handleCopy(voucher.code)} title="Copy code">
                        <svg width="18" height="18" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="12" height="12" rx="2"/><path d="M9 9h6v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6z"/></svg>
                      </button>
                      {copyMsg && <span className="copy-msg">{copyMsg}</span>}
                    </div>
                    <div className="voucher-status-row">{getStatusBadge(voucher.status)}</div>
                    {voucher.status === "Unused" && (
                      <button className="redeem-glass-btn" onClick={() => setShowConfirm(true)}>Mark as Used</button>
                    )}
                  </div>
                ) : (
                  <button className="redeem-glass-btn" onClick={handleGenerateVoucher}>
                    Generate Voucher
                  </button>
                )}
                {showConfirm && (
                  <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                      <h4>Confirm Redemption</h4>
                      <p>Are you sure you want to mark this voucher as used? This action cannot be undone.</p>
                      <div style={{display: "flex", gap: 16, marginTop: 18}}>
                        <button className="redeem-glass-btn" onClick={handleMarkUsed}>Yes, Mark as Used</button>
                        <button className="redeem-glass-btn secondary" onClick={() => setShowConfirm(false)}>Cancel</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "station" && (
              <div className="redeem-glass-card">
                <h3>Find Petrol Stations</h3>
                <div className="station-filters">
                  <label>
                    Brand:
                    <select value={brand} onChange={e => setBrand(e.target.value)}>
                      {BRANDS.map(b => (
                        <option key={b.label} value={b.label}>{b.label}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Range:
                    <select value={range} onChange={e => setRange(Number(e.target.value))}>
                      {RANGES.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
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
                    options={{
                      styles: [
                        { featureType: "poi.business", stylers: [{ visibility: "off" }] },
                        { featureType: "transit", stylers: [{ visibility: "off" }] }
                      ],
                      mapTypeControl: false,
                      streetViewControl: false,
                      fullscreenControl: false
                    }}
                  >
                    <Marker
                      position={location}
                      icon={{
                        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                        scaledSize: { width: 40, height: 40 }
                      }}
                      title="Your Location"
                      animation={window.google && window.google.maps.Animation.BOUNCE}
                    />
                    {stations.map((station, idx) => {
                      let iconUrl = BRANDS.find(b => station.name && station.name.toLowerCase().includes(b.label.toLowerCase()))?.icon;
                      if (!iconUrl || brand === "All") iconUrl = BRANDS[0].icon;
                      return (
                        <Marker
                          key={idx}
                          position={{
                            lat: station.geometry.location.lat(),
                            lng: station.geometry.location.lng()
                          }}
                          onClick={() => setSelectedStation(station)}
                          title={station.name}
                          icon={{
                            url: iconUrl,
                            scaledSize: { width: 36, height: 36 }
                          }}
                          animation={window.google && window.google.maps.Animation.DROP}
                        />
                      );
                    })}
                    {selectedStation && (
                      <InfoWindow
                        position={{
                          lat: selectedStation.geometry.location.lat(),
                          lng: selectedStation.geometry.location.lng()
                        }}
                        onCloseClick={() => setSelectedStation(null)}
                      >
                        <div className="station-info-window">
                          <div className="station-info-header">
                            <img
                              src={
                                BRANDS.find(b => selectedStation.name && selectedStation.name.toLowerCase().includes(b.label.toLowerCase()))?.icon ||
                                BRANDS[0].icon
                              }
                              alt="brand"
                              className="station-brand-logo"
                            />
                            <b>{selectedStation.name}</b>
                          </div>
                          <div className="station-address">{selectedStation.vicinity}</div>
                          <div className="station-distance">Distance: {(selectedStation.distance / 1000).toFixed(2)} km</div>
                          <a
                            className="navigate-btn"
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedStation.name + " " + selectedStation.vicinity)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >Navigate</a>
                        </div>
                      </InfoWindow>
                    )}
                  </GoogleMap>
                )}
              </div>
            )}

            {tab === "help" && (
              <div className="redeem-glass-card">
                <h3>How to Redeem</h3>
                <ol>
                  <li>Complete your profile 100%.</li>
                  <li>Generate a voucher and show the code at the petrol station counter.</li>
                  <li>Use the map to find the nearest station and navigate there.</li>
                  <li>Mark your voucher as used after redemption.</li>
                </ol>
                <h4>FAQ</h4>
                <ul>
                  <li><b>Can I generate more than one voucher?</b> No, only one voucher per account.</li>
                  <li><b>Can I use the voucher at any petrol station?</b> Yes, as long as the station accepts it.</li>
                  <li><b>How do I find the nearest station?</b> Use the "Find Station" tab and filters.</li>
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}