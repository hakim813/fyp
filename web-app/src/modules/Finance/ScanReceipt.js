import React, { useState } from "react";
import { getDatabase, ref, push, set } from "firebase/database";
import { useUser } from "../../utils/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./finance.css";

const MONTH_MAP = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
};

function normalizeDate(inputString) {
  const currentYear = new Date().getFullYear();
  const hasYear = /\d{4}/.test(inputString);
  let day, month, year;
  if (hasYear) {
    const [dayString, monthString, yearString] = inputString.split(" ");
    day = dayString;
    month = monthString;
    year = yearString;
  } else {
    const [dayOfWeek, dayString, monthString] = inputString.split(" ");
    day = dayString;
    month = monthString;
    year = currentYear;
  }
  return `${day} ${month.slice(0, 3)} ${year}`;
}

function formatText(lines) {
  const dateRegex = /^(?:[A-Z][a-z]{2}, \d{1,2} [A-Z][a-z]+|\d{1,2} [A-Z][a-z]{3} \d{4})$/;
  const dateRegex2 = /^\d{1,2} [A-Z][a-z]{2} \d{4}$/;
  const timeRegex = /^\d{2}:\d{2}$/;
  const moneyRegex = /^([+-]?\s?)?(MYR\s?)?\d+\.\d{2}$/i;
  const positiveRegex = /^(\+?\s?)?(MYR\s?)?\d+\.\d{2}$/i;
  const negativeRegex = /^(-\s?)?(MYR\s?)?\d+\.\d{2}$/i;

  const results = [];
  let moneyIndex = 0;
  const moneyLines = lines.filter((l) => moneyRegex.test(l));

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (dateRegex.test(line) || dateRegex2.test(line)) {
      let date = normalizeDate(line);
      for (let j = i + 1; j < lines.length; j++) {
        if (dateRegex.test(lines[j]) || dateRegex2.test(lines[j])) break;
        if (lines[j] === "Total cash you have") {
          moneyIndex++;
          continue;
        }
        const potentialTime = lines[j].slice(0, 5);
        if (timeRegex.test(potentialTime)) {
          const time = potentialTime;
          const money = moneyLines[moneyIndex++];
          if (money) {
            const [day, month, year] = date.split(" ");
            const formattedDate = `${year}-${MONTH_MAP[month]}-${day}`;
            if (positiveRegex.test(money)) {
              const cleaned = money.replace(/(MYR\s*|[+-]\s*)/gi, "");
              const dateObj = Date.parse(new Date(formattedDate));
              results.push({ dateObj, time, cleaned, status: "Gained" });
            } else {
              const cleaned = money.replace(/(MYR\s*|[+-]\s*)/gi, "");
              const dateObj = Date.parse(new Date(formattedDate));
              results.push({ dateObj, time, cleaned, status: "Spent" });
            }
          }
        }
      }
    }
  }
  return results;
}

export default function ScanReceipt() {
  const { user } = useUser();
  const [ocrLines, setOcrLines] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
      sendToOCRSpace(reader.result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  // Send to OCR.space
  const sendToOCRSpace = async (base64Image) => {
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("apikey", "K86870090988957");
      formData.append("language", "eng");
      formData.append("isOverlayRequired", "true");
      formData.append("base64Image", `data:image/jpeg;base64,${base64Image}`);

      const response = await axios.post(
        "https://api.ocr.space/parse/image",
        formData.toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      const parsedText = response.data?.ParsedResults?.[0]?.ParsedText;
      if (parsedText) {
        const rawLines = parsedText
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line !== "");
        const formatted = formatText(rawLines);
        setOcrLines(formatted);
      } else {
        setOcrLines([]);
        alert("No text found in the image.");
      }
    } catch (error) {
      alert("Failed to process the image.");
    } finally {
      setLoading(false);
    }
  };

  // Delete a transaction from local state
  const handleDelete = (index) => {
    setOcrLines((prev) => prev.filter((_, i) => i !== index));
  };

  // Save to Firebase
  const writeData = async () => {
    if (!ocrLines.length) {
      alert("No financial data fetched.");
      return;
    }
    const db = getDatabase();
    for (let i = 0; i < ocrLines.length; i++) {
      const rec = ocrLines[i];
      const newRef = push(ref(db, "financeRecords"));
      await set(newRef, {
        email: user.email,
        type: rec.status === "Gained" ? "Income" : "Expense",
        value: parseFloat(parseFloat(rec.cleaned).toFixed(2)),
        notes: "",
        date: rec.dateObj,
      });
    }
    alert("Transactions recorded!");
    navigate("/finance/records");
  };

  return (
    <div className="finance-scan-receipt">
      <h2>Scan Receipt</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {loading && <p>Scanning receipt...</p>}
      {image && (
        <img src={image} alt="Receipt" style={{ maxWidth: 320, margin: "16px 0" }} />
      )}
      <div>
        {ocrLines.length > 0 ? (
          <div>
            {ocrLines.map((line, idx) => {
              const date = new Date(line.dateObj);
              const formattedDate = `${date.getDate()} ${date.toLocaleString(
                "default",
                { month: "short" }
              )} ${date.getFullYear()}`;
              return (
                <div
                  key={idx}
                  style={{
                    marginBottom: 18,
                    padding: 12,
                    background: "#e6f9f1",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,177,106,0.04)",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 17 }}>
                    Date: {formattedDate}
                  </div>
                  <div>Time: {line.time}</div>
                  <div>
                    Amount: <span style={{ color: line.status === "Gained" ? "#28C76F" : "#EA5455" }}>
                      RM {line.cleaned}
                    </span>
                  </div>
                  <div>Status: {line.status}</div>
                  <button
                    className="finance-btn"
                    style={{ background: "#EA5455", marginTop: 8 }}
                    onClick={() => handleDelete(idx)}
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ margin: "24px 0", color: "#888" }}>
            No financial data found.
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 18 }}>
        <button
          className="finance-btn"
          onClick={() => document.querySelector('input[type="file"]').click()}
        >
          {image ? "Choose Other Receipt" : "Pick Receipt"}
        </button>
        <button
          className="finance-btn"
          onClick={writeData}
          disabled={!image || ocrLines.length < 1}
        >
          {image && ocrLines.length > 0 ? "Record Expense" : "Upload Receipt First"}
        </button>
      </div>
    </div>
  );
}