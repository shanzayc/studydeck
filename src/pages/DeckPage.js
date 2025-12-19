import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase/config";
import { getDoc } from "firebase/firestore";

import {
  collection,
  addDoc,
  query,
  getDocs,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

function DeckPage() {
  const { user } = useAuth();
  const { deckId } = useParams();
  const [flashcards, setFlashcards] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [deckTitle, setDeckTitle] = useState("");

  // Quiz state
  const [quizMode, setQuizMode] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAnswerAfterIncorrect, setShowAnswerAfterIncorrect] = useState(true);

  const [isCorrect, setIsCorrect] = useState(false);

  const loadFlashcards = async () => {
    const flashcardRef = collection(db, "users", user.uid, "decks", deckId, "flashcards");
    const q = query(flashcardRef);
    const querySnapshot = await getDocs(q);

    const loaded = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setFlashcards(loaded);
  };

  const loadDeckTitle = async () => {
    const deckRef = collection(db, "users", user.uid, "decks");
    const q = query(deckRef);
    const querySnapshot = await getDocs(q);
    const matchedDeck = querySnapshot.docs.find((doc) => doc.id === deckId);
    if (matchedDeck) {
      setDeckTitle(matchedDeck.data().title);
    }
  };

  const handleAddFlashcard = async (e) => {
    e.preventDefault();
    const flashcardRef = collection(db, "users", user.uid, "decks", deckId, "flashcards");

    await addDoc(flashcardRef, {
      question,
      answer,
      createdAt: serverTimestamp(),
    });

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      totalCards: increment(1),
    });

    setQuestion("");
    setAnswer("");
    loadFlashcards();
  };

  const handleStartQuiz = () => {
    setQuizMode(true);
    setQuizIndex(0);
    setUserAnswer("");
    setCorrectCount(0);
    setQuizDone(false);
    setShowFeedback(false);
  };

  const handleSubmitAnswer = () => {
    const current = flashcards[quizIndex];
    const correct = userAnswer.trim().toLowerCase() === current.answer.trim().toLowerCase();

    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setCorrectCount((prev) => prev + 1);
    }

    // Auto-advance after showing feedback
    setTimeout(() => {
      if (quizIndex + 1 < flashcards.length) {
        setQuizIndex(quizIndex + 1);
        setUserAnswer("");
        setShowFeedback(false);
      } else {
        setQuizDone(true);
        setShowFeedback(false);
      }
    }, 1500);
  };

  const loadStudySettings = async () => {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      setShowAnswerAfterIncorrect(
        data?.studySettings?.showAnswerAfterIncorrect ?? true
      );
    }
  };


  const handleRestartQuiz = () => {
    setQuizIndex(0);
    setUserAnswer("");
    setCorrectCount(0);
    setQuizDone(false);
    setShowFeedback(false);
  };

  const handleExitQuiz = () => {
    setQuizMode(false);
    setQuizIndex(0);
    setUserAnswer("");
    setCorrectCount(0);
    setQuizDone(false);
    setShowFeedback(false);
  };

  const getScorePercentage = () => {
    return Math.round((correctCount / flashcards.length) * 100);
  };

  const getScoreEmoji = () => {
    const percentage = getScorePercentage();
    if (percentage >= 90) return "🏆";
    if (percentage >= 80) return "🎉";
    if (percentage >= 70) return "👍";
    if (percentage >= 60) return "📚";
    return "💪";
  };

  useEffect(() => {
    if (user) {
      loadFlashcards();
      loadDeckTitle();
      loadStudySettings();
    }
  }, [user, deckId]);


  // Handle Enter key press in quiz input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !showFeedback) {
      handleSubmitAnswer();
    }
  };

  return (
    <div className="deck-page-container">
      <div className="deck-page-header">
        <h1 className="deck-page-title">{deckTitle}</h1>
        {!quizMode && flashcards.length > 0 && (
          <button onClick={handleStartQuiz} className="start-quiz-btn">
            <span>🚀</span> Start Quiz
          </button>
        )}
      </div>

      {quizMode ? (
        <div className="quiz-section">
          {!quizDone && (
            <div className="quiz-progress">
              <div
                className="quiz-progress-bar"
                style={{ width: `${((quizIndex + 1) / flashcards.length) * 100}%` }}
              ></div>
            </div>
          )}

          {quizDone ? (
            <div className="quiz-results">
              <h3>{getScoreEmoji()} Quiz Complete!</h3>
              <div className="score-display">
                <p className="score-text">
                  You scored <strong>{correctCount}</strong> out of <strong>{flashcards.length}</strong>
                </p>
                <p className="percentage-text">
                  {getScorePercentage()}% Correct
                </p>
              </div>
              <div className="quiz-actions">
                <button onClick={handleRestartQuiz} className="restart-btn">
                  🔄 Try Again
                </button>
                <button onClick={handleExitQuiz} className="exit-btn">
                  📚 Back to Deck
                </button>
              </div>
            </div>
          ) : (
            <div className="quiz-card">
              <div className="quiz-header">
                <h4>Question {quizIndex + 1} of {flashcards.length}</h4>
              </div>

              <p className="quiz-question">{flashcards[quizIndex].question}</p>

              {showFeedback ? (
                <div className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="feedback-icon">
                    {isCorrect ? '✅' : '❌'}
                  </div>
                  <div className="feedback-text">
                    {isCorrect
                      ? "Correct!"
                      : showAnswerAfterIncorrect
                        ? `Incorrect. The answer is: ${flashcards[quizIndex].answer}`
                        : "Incorrect."}
                  </div>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your answer here..."
                    autoFocus
                  />
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!userAnswer.trim()}
                    className="submit-btn"
                  >
                    Submit Answer
                  </button>
                  <button onClick={handleExitQuiz} className="exit-quiz-btn-bottom">
                    Exit Quiz
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="add-flashcard-section">
            <h3 className="add-flashcard-title">Add New Flashcard</h3>
            <form className="add-flashcard-form" onSubmit={handleAddFlashcard}>
              <input
                className="flashcard-input"
                placeholder="Question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
              />
              <input
                className="flashcard-input"
                placeholder="Answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                required
              />
              <button className="add-flashcard-btn" type="submit">
                Add Flashcard
              </button>
            </form>
          </div>

          <div className="flashcards-display-section">
            {flashcards.length === 0 ? (
              <div className="empty-flashcards-state">
                <div className="empty-flashcards-icon">🃏</div>
                <div className="empty-flashcards-text">No flashcards yet</div>
                <div className="empty-flashcards-subtext">
                  Create your first flashcard to start studying!
                </div>
              </div>
            ) : (
              <div className="flashcards-container">
                {flashcards.map((card) => (
                  <div key={card.id} className="flashcard-item">
                    <p className="flashcard-question">
                      <span className="question-label">Q:</span> {card.question}
                    </p>
                    <p className="flashcard-answer">
                      <span className="answer-label">A:</span> {card.answer}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default DeckPage;