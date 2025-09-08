import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

import { useNavigate } from "react-router-dom";


function Account() {
    const [user] = useAuthState(auth);
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
                setNotifications(data.notifications || {});
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
                notifications: notifications,
            });
            alert("Settings saved!");
        } catch (err) {
            console.error("Save failed", err);
            alert("Failed to save");
        }
    };


const navigate = useNavigate();

const handleLogout = async () => {
  if (window.confirm("Log out?")) {
    await auth.signOut();
    navigate("/login"); // send them to login page
  }
};

    if (loading) return <p>Loading your account...</p>;
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
                            <span>🔥 {userInfo.studyStreak} day streak</span>
                            <span>📚 {userInfo.totalCards} cards</span>
                            <span>🗂️ {userInfo.decksCreated} decks</span>
                        </div>
                    </div>
                </div>

                <div className="tabs">
                    {["profile", "notifications", "settings"].map((tab) => (
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
                                    onChange={(e) =>
                                        setUserInfo({ ...userInfo, name: e.target.value })
                                    }
                                />
                            </label>

                            <label>
                                Last Name:
                                <input
                                    type="text"
                                    value={userInfo.lastName}
                                    onChange={(e) =>
                                        setUserInfo({ ...userInfo, lastName: e.target.value })
                                    }
                                />
                            </label>

                            <label>
                                Email:
                                <input
                                    type="email"
                                    value={userInfo.email}
                                    onChange={(e) =>
                                        setUserInfo({ ...userInfo, email: e.target.value })
                                    }
                                />
                            </label>
                            <h4>Change Password</h4>
                            <input type="password" placeholder="Current Password" />
                            <input type="password" placeholder="New Password" />
                            <input type="password" placeholder="Confirm New Password" />
                            <button onClick={handleSave}>Save Changes</button>
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


                    {activeTab === 'settings' && (
                        <div>
                            <h3>Study Settings</h3>

                            <div className="checkbox-row">
                                <label>Show answer after incorrect</label>
                                <input type="checkbox" defaultChecked />
                            </div>

                            <button onClick={handleSave}>Save Study Settings</button>
                        </div>
                    )}

                </div>

                <div className="danger-zone">
                    <h3>Danger Zone</h3>
                    <button onClick={handleLogout} className="logout-btn">
                        Log Out
                    </button>
                    <button className="delete-btn">Delete Account</button>
                </div>
            </div>
        </div>
    );
}

export default Account;
