import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get, update } from 'firebase/database';
import Navbar from '../../components/Navbar';
import '../../styles/redeem.css';

const Redeem = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voucherCode, setVoucherCode] = useState('');
  const [error, setError] = useState('');
  const [redeemed, setRedeemed] = useState(false);

  const auth = getAuth();
  const db = getDatabase();
  const user = auth.currentUser;

  const fetchUserData = () => {
    if (user) {
      const userRef = ref(db, `users/${user.uid}`);
      get(userRef)
        .then(snapshot => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            console.log("Redeem page user data:", data); // Debug log

            setUserData(data);
            setRedeemed(data.voucherRedeemed || false);
          } else {
            setError('User data not found.');
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError('Failed to load user data.');
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const generateVoucherCode = () => {
    return 'WEGIG-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleRedeem = () => {
    if (!userData) return;

    const completionRaw = userData.completionPercentage ?? userData.profileCompletion ?? 0;
    const completion = Number(completionRaw);

    console.log("Completion value:", completion);
    console.log("Voucher redeemed:", redeemed);

    if (completion < 100) {
      setError('Profile completion must be 100% to redeem.');
      return;
    }

    if (redeemed) {
      setError('You have already redeemed your voucher.');
      return;
    }

    const code = generateVoucherCode();

    const userRef = ref(db, `users/${user.uid}`);
    update(userRef, {
      voucherCode: code,
      voucherRedeemed: true,
    })
      .then(() => {
        setVoucherCode(code);
        setRedeemed(true);
        setError('');
      })
      .catch(err => {
        console.error(err);
        setError('Failed to redeem voucher. Please try again.');
      });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="redeem-container">
          <p>Loading...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="redeem-container">
        <h2>Redeem Your Voucher</h2>

        {!redeemed && (
          <>
            <p>
              {userData && (Number(userData.completionPercentage ?? userData.profileCompletion ?? 0) >= 100)
                ? 'You are eligible to redeem a one-time petrol refill voucher.'
                : 'Complete your profile 100% to be eligible for redemption.'}
            </p>
            <button
              onClick={handleRedeem}
              disabled={
                !userData || Number(userData.completionPercentage ?? userData.profileCompletion ?? 0) < 100
              }
              className="redeem-btn"
            >
              Redeem Voucher
            </button>
          </>
        )}

        {redeemed && (
          <div className="voucher-section">
            <h3>Your Voucher Code:</h3>
            <p className="voucher-code">{voucherCode || userData.voucherCode}</p>
            <p>Redeem this code at selected gas stations for your petrol refill.</p>
          </div>
        )}

        {error && <p className="error-msg">{error}</p>}
      </div>
    </>
  );
};

export default Redeem;
