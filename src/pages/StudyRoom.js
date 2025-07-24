import { useState, useEffect } from "react";
import { auth, db } from "../firebase/config";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  addDoc,
  query,
  getDocs,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  increment,
} from "firebase/firestore";

function Dashboard() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [decks, setDecks] = useState([]);
  const [userName, setUserName] = useState("");

  const { user } = useAuth();

  // 🔐 Log out
  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  // 🎓 Create new deck + update user's deck count
  const handleCreateDeck = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const deckRef = collection(db, "users", user.uid, "decks");
      await addDoc(deckRef, {
        title: title,
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(db, "users", user.uid), {
        decksCreated: increment(1),
      });

      setTitle("");
      fetchDecks();
    } catch (error) {
      console.error("Error creating deck:", error);
    }
  };

  // 📚 Fetch decks
  const fetchDecks = async () => {
    try {
      const deckRef = collection(db, "users", user.uid, "decks");
      const q = query(deckRef);
      const querySnapshot = await getDocs(q);
      const userDecks = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setDecks(userDecks);
    } catch (error) {
      console.error("Error fetching decks:", error);
    }
  };

  // 👤 Fetch user info (name)
  const fetchUserName = async () => {
    try {
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        setUserName(docSnap.data().name || "User");
      }
    } catch (error) {
      console.error("Error fetching user name:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDecks();
      fetchUserName();
    }
  }, [user]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="welcome-text">Welcome {userName}</h2>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {/* Create Deck Section */}
      <div className="create-deck-section">
        <h3 className="create-deck-title">CREATE A NEW DECK</h3>
        <form className="create-deck-form" onSubmit={handleCreateDeck}>
          <input
            className="deck-title-input"
            placeholder="Enter deck title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button className="create-deck-btn" type="submit">
            Create
          </button>
        </form>
      </div>

      {/* Decks Section */}
      <div className="decks-section">
        <h3 className="decks-title">Your Decks</h3>
        {decks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <div className="empty-state-text">No decks yet</div>
            <div className="empty-state-subtext">Create your first deck to get started!</div>
          </div>
        ) : (
          <ul className="decks-grid">
            {decks.map((deck) => (
              <li key={deck.id}>
                <Link to={`/deck/${deck.id}`} className="deck-card">
                  <h4 className="deck-card-title">{deck.title}</h4>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
