import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";

import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";



function Account() {
    const [user] = useAuthState(auth);
    const [studySettings, setStudySettings] = useState({
        showAnswerAfterIncorrect: true,
    });
    const [userInfo, setUserInfo] = useState(null);
    const [notifications, setNotifications] = useState({
        studyReminders: true,
        weeklyReports: false,
        newFeatures: true,
    });
    const [activeTab, setActiveTab] = useState("profile");
    const [loading, setLoading] = useState(true);

    // ✅ Fetch user info from Firestore on mount
    useEffect(() => {
        if (!user) return;

        const fetchUserInfo = async () => {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setUserInfo(data);
                setStudySettings(data.studySettings || { showAnswerAfterIncorrect: true });

            }
            setLoading(false);
        };

        fetchUserInfo();
    }, [user]);

    const handleSave = async () => {
        if (!user || !userInfo) return;
        try {
            await updateDoc(doc(db, "users", user.uid), {
                ...userInfo,
                studySettings,

            });
            alert("Settings saved!");
        } catch (err) {
            console.error("Save failed", err);
            alert("Failed to save");
        }
    };

    const handlePasswordReset = async () => {
        if (!user || !user.email) {
            alert("No email found for this account.");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, user.email);
            alert("Password reset email sent! Check your inbox.");
        } catch (error) {
            console.error("Password reset error:", error);
            alert("Failed to send password reset email.");
        }
    };


    const navigate = useNavigate();

    const handleLogout = async () => {
        if (window.confirm("Log out?")) {
            await auth.signOut();
            navigate("/login"); // send them to login page
        }
    };

    if (!user) {
        return (
            <div className="not-logged-in">
                <div className="login-card">
                    <h2>🔒 Please log in</h2>
                    <p>Sign in to view your profile, track decks, and keep your streak alive!</p>
                    <Link to="/login" className="login-btn">Go to Login</Link>
                    <p className="signup-hint">
                        Don’t have an account? <Link to="/signup">Create one</Link>
                    </p>
                </div>
            </div>
        );
    }

    if (!userInfo) return <p>No user data found.</p>;

    return (
        <div className="account-container">
            <div className="account-card">
                <div className="account-header">
                    <div className="user-avatar">👤</div>
                    <div>
                        <h1>{userInfo.name}</h1>
                        <p>{userInfo.email}</p>
                        <div className="user-stats">
                            <span>🔥 Streak: Coming soon</span>
                            <span>📚 {userInfo.totalCards} cards</span>
                            <span>🗂️ {userInfo.decksCreated} decks</span>
                        </div>
                    </div>
                </div>

                <div className="tabs">
                    {["profile", "settings"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={activeTab === tab ? "active" : ""}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="tab-content">
                    {activeTab === "profile" && (
                        <div>
                            <h3>Profile Info</h3>

                            <label>
                                First Name:
                                <input
                                    type="text"
                                    value={userInfo.name}
                                    onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                                />
                            </label>

                            <label>
                                Last Name:
                                <input
                                    type="text"
                                    value={userInfo.lastName}
                                    onChange={(e) => setUserInfo({ ...userInfo, lastName: e.target.value })}
                                />
                            </label>

                            <label>
                                Email:
                                <input
                                    type="email"
                                    value={userInfo.email}
                                    disabled
                                />
                            </label>

                            <button onClick={handleSave} className="save-btn">
                                Save Changes
                            </button>

                            <hr className="section-divider" />

                            <h4>Change Password</h4>
                            <p className="password-note">
                                For security reasons, password changes are handled via email.
                            </p>
                            <button onClick={handlePasswordReset} className="reset-btn">
                                Send Password Reset Email
                            </button>
                        </div>
                    )}


                    {activeTab === 'notifications' && (
                        <div>
                            <h3>Email Notifications</h3>

                            <div className="checkbox-row">
                                <label>Study Reminders</label>
                                <input
                                    type="checkbox"
                                    checked={notifications.studyReminders}
                                    onChange={(e) =>
                                        setNotifications({ ...notifications, studyReminders: e.target.checked })
                                    }
                                />
                            </div>

                            {notifications.studyReminders && (
                                <div className="dropdown-row">
                                    <label>Reminder Frequency:</label>
                                    <select
                                        value={notifications.frequency || "daily"}
                                        onChange={(e) =>
                                            setNotifications({ ...notifications, frequency: e.target.value })
                                        }
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </div>
                            )}

                            <button onClick={handleSave}>Save Preferences</button>
                        </div>
                    )}


                    {activeTab === "settings" && (
                        <div>
                            <h3>Study Settings</h3>

                            <div className="checkbox-row">
                                <label>Show answer after incorrect</label>
                                <input
                                    type="checkbox"
                                    checked={studySettings.showAnswerAfterIncorrect}
                                    onChange={(e) =>
                                        setStudySettings({
                                            ...studySettings,
                                            showAnswerAfterIncorrect: e.target.checked,
                                        })
                                    }
                                />
                            </div>

                            <button onClick={handleSave} className="save-btn">
                                Save Study Settings
                            </button>
                        </div>
                    )}


                </div>

                <div className="danger-zone">
                    <h3>Danger Zone</h3>
                    <button onClick={handleLogout} className="logout-btn">
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Account;
