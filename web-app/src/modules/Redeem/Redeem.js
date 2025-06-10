import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get, update } from 'firebase/database';
import Navbar from '../../components/Navbar';
import '../../styles/redeem.css';

const Redeem = () => {
  const auth = getAuth();
  const db = getDatabase();
  const user = auth.currentUser;

  const [profileComplete, setProfileComplete] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [alreadyRedeemed, setAlreadyRedeemed] = useState(false);

  useEffect(() => {
    if (user) {
      const userRef = ref(db, `users/${user.uid}`);
      get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const isComplete = Object.values(data).every((v) => v !== "");
          setProfileComplete(isComplete);
          if (data.voucherCode) {
            setVoucherCode(data.voucherCode);
            setAlreadyRedeemed(true);
          }
        }
      });
    }
  }, [user, db]);

  const generateCode = () => {
    const code = 'PETRO-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const userRef = ref(db, `users/${user.uid}`);
    update(userRef, { voucherCode: code })
      .then(() => {
        setVoucherCode(code);
        setAlreadyRedeemed(true);
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      <Navbar />
      <div className="redeem-container">
        <h2>Petrol Voucher Redemption</h2>
        <p>Redeem a one-time free petrol voucher after completing your profile.</p>

        {alreadyRedeemed ? (
          <div className="voucher-box">
            <p>Your voucher code:</p>
            <span className="code">{voucherCode}</span>
          </div>
        ) : profileComplete ? (
          <button className="redeem-btn" onClick={generateCode}>Generate Voucher Code</button>
        ) : (
          <p className="warning-text">Please complete your profile to redeem the voucher.</p>
        )}
      </div>
    </>
  );
};

export default Redeem;
