import React, { useEffect, useState, useRef } from "react";
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
const RANGES = [
  { label: "2 km", value: 2000 },
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
  { label: "20 km", value: 20000 }
];
const mapContainerStyle = { width: "100%", height: "340px" };

export default function Redeem() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({});
  const [profilePercent, setProfilePercent] = useState(0);
  const [voucher, setVoucher] = useState(null);
  const [tab, setTab] = useState("voucher");
  const [range, setRange] = useState(RANGES[2].value);
  const [location, setLocation] = useState(null);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [copyMsg, setCopyMsg] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [tabAnim, setTabAnim] = useState("fade-in");
  const [searchQuery, setSearchQuery] = useState("");
  const mapRef = useRef(null);

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
    get(ref(db, `voucher/${user.uid}`)).then(snap => {
      if (snap.exists()) setVoucher(snap.val());
    });
  }, [user]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocation({ lat: 3.139, lng: 101.6869 })
    );
  }, []);

  // Fetch nearby petrol stations using Google Places API
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

  // Pan to searched station on the map
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

  const getDistance = (loc1, loc2) => {
    const R = 6371000, toRad = deg => deg * Math.PI / 180;
    const dLat = toRad(loc2.lat - loc1.lat);
    const dLng = toRad(loc2.lng - loc1.lng);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(loc1.lat)) * Math.cos(toRad(loc2.lat)) *
      Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const getProfileCompletion = (data) => {
    const filled = requiredFields.filter(f => {
      const v = data[f];
      return Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null && v !== "";
    }).length;
    return Math.round((filled / requiredFields.length) * 100);
  };

  const getStatusBadge = status => (
    status === "Unused"
      ? <span className="badge badge-green">Unused</span>
      : status === "Used"
      ? <span className="badge badge-red">Used</span>
      : null
  );

  const handleGenerateVoucher = async () => {
    if (voucher) return;
    const code = "PETRO-" + Math.random().toString(36).substr(2, 8).toUpperCase();
    const newVoucher = { code, created: Date.now(), status: "Unused" };
    await set(ref(getDatabase(), `voucher/${user.uid}`), newVoucher);
    setVoucher(newVoucher);
  };

  const handleMarkUsed = async () => {
    if (!voucher) return;
    await set(ref(getDatabase(), `voucher/${user.uid}/status`), "Used");
    setVoucher({ ...voucher, status: "Used" });
    setShowConfirm(false);
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

  // Filter stations by search query (name, brand, or location)
  const filteredStations = stations.filter(st =>
    (st.name && st.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (st.vicinity && st.vicinity.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (st.types && st.types.join(" ").toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
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
            <button className={tab === "help" ? "tab active" : "tab"} onClick={() => handleTabChange("help")}>Help</button>
          </div>

          <div className={`redeem-glass-tab-content ${tabAnim}`}>
            {tab === "voucher" && (
              <div className="redeem-glass-card voucher-card-glass">
                <h3>Voucher Details</h3>
                {voucher ? (
                  <>
                    <div className="voucher-code-row">
                      <span className="voucher-code">{voucher.code}</span>
                      <button className="copy-btn" onClick={() => handleCopy(voucher.code)}>Copy</button>
                      {copyMsg && <span className="copy-msg">{copyMsg}</span>}
                    </div>
                    <div className="voucher-status-row">{getStatusBadge(voucher.status)}</div>
                    {voucher.status === "Unused" && (
                      <button className="redeem-glass-btn" onClick={() => setShowConfirm(true)}>Mark as Used</button>
                    )}
                  </>
                ) : (
                  <button className="redeem-glass-btn" onClick={handleGenerateVoucher}>Generate Voucher</button>
                )}
                {showConfirm && (
                  <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                      <h4>Confirm Redemption</h4>
                      <p>Are you sure you want to mark this voucher as used? This action cannot be undone.</p>
                      <div style={{ display: "flex", gap: 16, marginTop: 18 }}>
                        <button className="redeem-glass-btn" onClick={handleMarkUsed}>Yes</button>
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
                    Range:
                    <select value={range || 10000} onChange={e => setRange(Number(e.target.value))}>
                      {RANGES.map(r => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by name, brand, or location"
                    style={{ padding: "8px 12px", flex: 1 }}
                  />
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
                    <Marker position={location} title="Your Location" />
                    {filteredStations.length === 0 && (
                      <></>
                    )}
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

            {tab === "help" && (
              <div className="redeem-glass-card">
                <h3>How to Redeem</h3>
                <ol>
                  <li>Complete your profile 100%.</li>
                  <li>Generate a voucher and show the code at the petrol station counter.</li>
                  <li>Use the map to find the nearest station and navigate there.</li>
                  <li>Mark your voucher as used after redemption.</li>
                </ol>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}