import { useState, useEffect } from "react"

function App() {
  const [page, setPage] = useState("home")

  // ---------------- AUTH STATES ----------------
const [registerName, setRegisterName] = useState("")
const [registerEmail, setRegisterEmail] = useState("")
const [registerPassword, setRegisterPassword] = useState("")
const [confirmPassword, setConfirmPassword] = useState("")
const [authError, setAuthError] = useState("")

const validateRegistration = () => {

  setAuthError("")

  if (!registerName.trim()) {
    setAuthError("Please enter your name.")
    return false
  }

  if (!registerEmail.trim()) {
    setAuthError("Please enter your email.")
    return false
  }

  if (!registerPassword) {
    setAuthError("Please enter a password.")
    return false
  }

  if (registerPassword.length < 6) {
    setAuthError("Password must be at least 6 characters.")
    return false
  }

  if (registerPassword !== confirmPassword) {
    setAuthError("Passwords do not match.")
    return false
  }

  return true
}

  const [topic, setTopic] = useState("")
  const [answer, setAnswer] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadedFileName, setUploadedFileName] = useState("")
  const [uploadMessage, setUploadMessage] = useState("")
  const [summary, setSummary] = useState("")

  // ---------------- QUIZ STATES ----------------
  const [quiz, setQuiz] = useState("")
  const [quizMode, setQuizMode] = useState(null)
  const [quizLoading, setQuizLoading] = useState(false)
  const [quizError, setQuizError] = useState("")

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [userAnswers, setUserAnswers] = useState([])
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  // ---------------- STUDY PROGRESS ----------------
const [quizzesCompleted, setQuizzesCompleted] = useState(0)
const [questionsAnswered, setQuestionsAnswered] = useState(0)
const [totalScorePercentage, setTotalScorePercentage] = useState(0)

  // ---------------- FLASHCARD STATES ----------------
const [flashcards, setFlashcards] = useState([])
const [flashcardLoading, setFlashcardLoading] = useState(false)
const [flashcardError, setFlashcardError] = useState("")
const [currentFlashcard, setCurrentFlashcard] = useState(0)
const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false)

useEffect(() => {
  if (page !== "flashcards") return

  const handleKeyDown = (event) => {

    if (event.key === "ArrowRight") {
      if (currentFlashcard < flashcards.length - 1) {
        setCurrentFlashcard(currentFlashcard + 1)
        setShowFlashcardAnswer(false)
      }
    }

    if (event.key === "ArrowLeft") {
      if (currentFlashcard > 0) {
        setCurrentFlashcard(currentFlashcard - 1)
        setShowFlashcardAnswer(false)
      }
    }

    if (event.key === " " || event.key === "Enter") {
      setShowFlashcardAnswer((previous) => !previous)
    }
  }

  window.addEventListener("keydown", handleKeyDown)

  return () => {
    window.removeEventListener("keydown", handleKeyDown)
  }
}, [page, currentFlashcard, flashcards.length])

  // ---------------- BACKEND (STUDY) ----------------
  const callBackend = async () => {
    if (!topic.trim()) {
      alert("Please enter a question first.")
      return
    }

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/study?topic=${encodeURIComponent(topic)}`
      )

      if (!res.ok) {
        throw new Error("Backend request failed")
      }

      const data = await res.json()

      setAnswer(`${data.topic}: ${data.advice}`)
    } catch (error) {
      alert("Backend not connected 😢")
      console.log(error)
    }
  }

  // ---------------- SUMMARY ----------------
  const generateSummary = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/summary")

      if (!res.ok) {
        throw new Error("Summary request failed")
      }

      const data = await res.json()

      setSummary(data.summary)
    } catch (error) {
      console.log(error)
      alert("Could not generate summary 😢")
    }
  }

  // ---------------- QUIZ ----------------

  const generateQuiz = () => {
    setQuizError("")
    setPage("quizSetup")
  }

  const generateFlashcards = async () => {
  setFlashcardLoading(true)
  setFlashcardError("")

  try {
    const res = await fetch(
      "http://127.0.0.1:8000/flashcards?count=10"
    )

    if (!res.ok) {
      throw new Error("Flashcard generation failed")
    }

    const data = await res.json()

    setFlashcards(data.flashcards)
    setCurrentFlashcard(0)
    setShowFlashcardAnswer(false)

    setPage("flashcards")
  } catch (error) {
    console.log(error)

    setFlashcardError(
      "Something went wrong while creating flashcards. Please try again."
    )
  } finally {
    setFlashcardLoading(false)
  }
}

  const startQuiz = async () => {
    if (!quizMode) {
      return
    }

    setQuizLoading(true)
    setQuizError("")

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/quiz?count=${quizMode}`
      )

      if (!res.ok) {
        throw new Error("Quiz generation failed")
      }

      const data = await res.json()

      setQuiz(JSON.stringify(data.quiz))

      // Reset quiz state
      setCurrentQuestion(0)
      setSelectedAnswer("")
      setUserAnswers([])
      setQuizSubmitted(false)

      // Open quiz page
      setPage("quiz")
    } catch (error) {
      console.log(error)
      setQuizError(
        "Something went wrong while creating the quiz. Please try again."
      )
    } finally {
      setQuizLoading(false)
    }
  }

  // ---------------- TRY QUIZ AGAIN ----------------

  const tryAgain = () => {
    setCurrentQuestion(0)
    setSelectedAnswer("")
    setUserAnswers([])
    setQuizSubmitted(false)

    setPage("quiz")
  }

  // ---------------- UPLOAD PDF ----------------

  const uploadFile = async () => {
    if (!selectedFile) {
      alert("Please select a PDF first 📄")
      return
    }

    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        throw new Error("Upload failed")
      }

      const data = await res.json()

      setUploadMessage(data.message)
      setAnswer(data.text)

      if (selectedFile) {
          setUploadedFileName(selectedFile.name)
}

      // Clear old AI results
      setSummary("")
      setQuiz("")
      setQuizMode(null)
      setQuizError("")
      setFlashcards([])
      setFlashcardError("")
      setCurrentFlashcard(0)
      setShowFlashcardAnswer(false)
    } catch (error) {
      console.log(error)
      setUploadMessage("Upload failed 😢")
    }
  }

  // ---------------- QUIZ SETUP PAGE ----------------

  if (page === "quizSetup") {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">

        <div className="w-full max-w-4xl">

          <button
            onClick={() => setPage("home")}
            className="text-gray-400 hover:text-white mb-8 transition"
          >
            ← Back to Home
          </button>

          <div className="text-center">

            <div className="text-6xl mb-5">
              🧠
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-purple-400">
              Choose Your Challenge
            </h1>

            <p className="mt-4 text-gray-400 text-lg">
              How much do you want to practice today?
            </p>

          </div>

          {/* QUIZ MODES */}

          <div className="grid md:grid-cols-3 gap-6 mt-12">

            {/* 5 QUESTIONS */}

            <button
              onClick={() => setQuizMode(5)}
              className={`p-7 rounded-2xl border-2 transition-all duration-200 cursor-pointer active:scale-95 ${
                quizMode === 5
                  ? "border-purple-400 bg-purple-600/30 shadow-lg shadow-purple-500/20"
                  : "border-slate-700 bg-slate-800 hover:bg-slate-700 hover:-translate-y-1"
              }`}
            >

              <div className="text-5xl">
                ⚡
              </div>

              <h2 className="text-xl font-bold mt-5">
                Quick Quiz
              </h2>

              <p className="text-gray-400 mt-2">
                5 Questions
              </p>

              <p className="text-sm text-gray-500 mt-3">
                Perfect for a quick revision
              </p>

            </button>

            {/* 10 QUESTIONS */}

            <button
              onClick={() => setQuizMode(10)}
              className={`p-7 rounded-2xl border-2 transition-all duration-200 cursor-pointer active:scale-95 ${
                quizMode === 10
                  ? "border-blue-400 bg-blue-600/30 shadow-lg shadow-blue-500/20"
                  : "border-slate-700 bg-slate-800 hover:bg-slate-700 hover:-translate-y-1"
              }`}
            >

              <div className="text-5xl">
                🎯
              </div>

              <h2 className="text-xl font-bold mt-5">
                Standard Quiz
              </h2>

              <p className="text-gray-400 mt-2">
                10 Questions
              </p>

              <p className="text-sm text-gray-500 mt-3">
                A balanced study session
              </p>

            </button>

            {/* 20 QUESTIONS */}

            <button
              onClick={() => setQuizMode(20)}
              className={`p-7 rounded-2xl border-2 transition-all duration-200 cursor-pointer active:scale-95 ${
                quizMode === 20
                  ? "border-pink-400 bg-pink-600/30 shadow-lg shadow-pink-500/20"
                  : "border-slate-700 bg-slate-800 hover:bg-slate-700 hover:-translate-y-1"
              }`}
            >

              <div className="text-5xl">
                🔥
              </div>

              <h2 className="text-xl font-bold mt-5">
                Deep Practice
              </h2>

              <p className="text-gray-400 mt-2">
                20 Questions
              </p>

              <p className="text-sm text-gray-500 mt-3">
                Test your knowledge deeply
              </p>

            </button>

          </div>

          {/* ERROR */}

          {quizError && (
            <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-center">
              {quizError}
            </div>
          )}

          {flashcardError && (
            <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-center">
              {flashcardError}
            </div>
          )}

          {/* START BUTTON */}

          <div className="text-center mt-12">

            <button
              onClick={startQuiz}
              disabled={!quizMode || quizLoading}
              className={`px-10 py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                quizMode && !quizLoading
                  ? "bg-purple-500 hover:bg-purple-700 cursor-pointer active:scale-95"
                  : "bg-slate-700 text-gray-500 cursor-not-allowed"
              }`}
            >
              {quizLoading
                ? "✨ Creating Your Quiz..."
                : "Start Quiz →"}
            </button>

            {quizMode && !quizLoading && (
              <p className="mt-4 text-gray-500">
                {quizMode} questions selected
              </p>
            )}

          </div>

        </div>

      </div>
    )
  }

  // ---------------- FLASHCARDS PAGE ----------------

if (page === "flashcards") {

  if (flashcardLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">

        <div className="text-center">

          <div className="text-6xl animate-pulse">
            🧠
          </div>

          <h1 className="text-2xl font-bold mt-5">
            Creating your flashcards...
          </h1>

          <p className="text-gray-400 mt-2">
            AI is preparing your study cards ✨
          </p>

        </div>

      </div>
    )
  }

  if (flashcardError) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">

        <div className="text-center">

          <div className="text-5xl">
            😢
          </div>

          <h1 className="text-2xl font-bold text-red-400 mt-5">
            Something went wrong
          </h1>

          <p className="text-gray-400 mt-3">
            {flashcardError}
          </p>

          <button
            onClick={() => setPage("home")}
            className="mt-6 bg-purple-500 hover:bg-purple-700 px-6 py-3 rounded-xl font-bold"
          >
            ← Back Home
          </button>

        </div>

      </div>
    )
  }

  const card = flashcards[currentFlashcard]

  if (!card) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">

        <p className="text-gray-400">
          No flashcards available.
        </p>

      </div>
    )
  }

  const nextFlashcard = () => {

    if (currentFlashcard < flashcards.length - 1) {
      setCurrentFlashcard(currentFlashcard + 1)
      setShowFlashcardAnswer(false)
    }

  }

  const previousFlashcard = () => {

    if (currentFlashcard > 0) {
      setCurrentFlashcard(currentFlashcard - 1)
      setShowFlashcardAnswer(false)
    }

  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 sm:p-8">

      <div className="max-w-3xl mx-auto">

        {/* BACK BUTTON */}

        <button
          onClick={() => setPage("home")}
          className="text-gray-400 hover:text-white mb-8 transition"
        >
          ← Back to Home
        </button>

        {/* HEADER */}

        <div className="text-center">

          <div className="text-5xl">
            🧠
          </div>

          <h1 className="text-4xl font-bold text-purple-400 mt-4">
            AI Flashcards
          </h1>

          <p className="text-gray-400 mt-2">
            Test yourself and strengthen your memory
          </p>

        </div>

        {/* PROGRESS */}

        <div className="mt-8">

          <div className="flex justify-between text-sm text-gray-400 mb-2">

            <span>
              Flashcard {currentFlashcard + 1} of {flashcards.length}
            </span>

            <span>
              {Math.round(
                ((currentFlashcard + 1) /
                  flashcards.length) *
                  100
              )}%
            </span>

          </div>

          <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">

            <div
              className="h-full bg-purple-500 transition-all duration-500"
              style={{
                width: `${
                  ((currentFlashcard + 1) /
                    flashcards.length) *
                  100
                }%`,
              }}
            />

          </div>

        </div>

        {/* FLASHCARD */}

        <div
          onClick={() =>
            setShowFlashcardAnswer(!showFlashcardAnswer)
          }
          className="mt-10 min-h-[320px] bg-slate-800 border-2 border-slate-700 hover:border-purple-400 rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-xl"
        >

          {!showFlashcardAnswer ? (

            <>
              <span className="text-sm uppercase tracking-widest text-purple-400 font-semibold">
                Question
              </span>

              <h2 className="text-2xl sm:text-3xl font-bold mt-6 leading-relaxed">
                {card.question}
              </h2>

              <p className="mt-10 text-gray-500">
                👆 Click the card to reveal the answer
              </p>
            </>

          ) : (

            <>
              <span className="text-sm uppercase tracking-widest text-green-400 font-semibold">
                Answer
              </span>

              <p className="text-xl sm:text-2xl font-semibold mt-6 leading-relaxed text-gray-200">
                {card.answer}
              </p>

              <p className="mt-10 text-gray-500">
                👆 Click the card to see the question
              </p>
            </>

          )}

        </div>

        {/* NAVIGATION */}

        <div className="mt-8 flex justify-between gap-4">

          <button
            onClick={previousFlashcard}
            disabled={currentFlashcard === 0}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              currentFlashcard === 0
                ? "bg-slate-800 text-gray-600 cursor-not-allowed"
                : "bg-slate-700 hover:bg-slate-600 cursor-pointer active:scale-95"
            }`}
          >
            ← Previous
          </button>

          <button
            onClick={nextFlashcard}
            disabled={currentFlashcard === flashcards.length - 1}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              currentFlashcard === flashcards.length - 1
                ? "bg-slate-800 text-gray-600 cursor-not-allowed"
                : "bg-purple-500 hover:bg-purple-700 cursor-pointer active:scale-95"
            }`}
          >
            Next →
          </button>

        </div>

        <div className="mt-6 flex justify-center gap-4">

  <button
    onClick={generateFlashcards}
    disabled={flashcardLoading}
    className="px-5 py-3 rounded-xl font-bold bg-purple-500 hover:bg-purple-700 transition-all active:scale-95"
  >
    🔄 Generate New Cards
  </button>

  <button
    onClick={() => setPage("home")}
    className="px-5 py-3 rounded-xl font-bold bg-slate-700 hover:bg-slate-600 transition-all active:scale-95"
  >
    🏠 Home
  </button>

</div>

      </div>

    </div>
  )
}

  // ---------------- QUIZ PAGE ----------------

  if (page === "quiz") {

    if (!quiz) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
          <p className="text-gray-400">
            Loading quiz...
          </p>
        </div>
      )
    }

    let questions = []

    try {
      questions = JSON.parse(quiz)
    } catch (error) {
      console.log("Quiz parsing error:", error)

      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">

          <div className="text-center">

            <h1 className="text-2xl font-bold text-red-400">
              Something went wrong 😢
            </h1>

            <button
              onClick={() => setPage("quizSetup")}
              className="mt-6 bg-purple-500 px-6 py-3 rounded-xl"
            >
              Try Again
            </button>

          </div>

        </div>
      )
    }

    const question = questions[currentQuestion]

    // ---------------- NEXT QUESTION ----------------

    const handleNext = () => {
  if (!selectedAnswer) {
    alert("Please select an answer first.")
    return
  }

  const updatedAnswers = [...userAnswers, selectedAnswer]

  setUserAnswers(updatedAnswers)
  setSelectedAnswer("")

  if (currentQuestion < questions.length - 1) {

    setCurrentQuestion(currentQuestion + 1)

  } else {

    // Calculate final score
    const finalScore = questions.reduce((total, q, index) => {
      return total + (
        updatedAnswers[index] === q.answer ? 1 : 0
      )
    }, 0)

    const percentage = Math.round(
      (finalScore / questions.length) * 100
    )

    // Update study progress
    setQuizzesCompleted((previous) => previous + 1)

    setQuestionsAnswered(
      (previous) => previous + questions.length
    )

    setTotalScorePercentage(
      (previous) => previous + percentage
    )

    setQuizSubmitted(true)
  }
}
    // ---------------- QUIZ RESULTS ----------------

    if (quizSubmitted) {

      const finalAnswers = [...userAnswers]

      const score = questions.reduce(
        (total, q, index) => {
          return total + (
            finalAnswers[index] === q.answer
              ? 1
              : 0
          )
        },
        0
      )

      const percentage = Math.round(
      (score / questions.length) * 100
      )
      return (
        <div className="min-h-screen bg-slate-950 text-white p-6 sm:p-8">

          <div className="max-w-4xl mx-auto">

            {/* TOP NAVIGATION */}

            <button
              onClick={() => setPage("home")}
              className="text-gray-400 hover:text-white mb-8 transition"
            >
              ← Back to Home
            </button>

            {/* RESULT HEADER */}

            <div className="text-center">

              <div className="text-5xl">
                🎉
              </div>

              <h1 className="text-4xl font-bold text-blue-400 mt-4">
                Quiz Completed!
              </h1>

              <p className="text-gray-400 mt-2">
                Here's how you performed
              </p>

            </div>

            {/* SCORE CARDS */}

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* SCORE */}

              <div className="bg-purple-600/20 border border-purple-500/30 p-6 rounded-2xl text-center">

                <p className="text-gray-400">
                  Your Score
                </p>

                <p className="text-4xl font-bold mt-2 text-purple-400">
                  {percentage}%
                </p>

                <p className="mt-2 text-gray-300">
                  {score} / {questions.length} correct
                </p>

              </div>

              {/* CORRECT */}

              <div className="bg-green-600/20 border border-green-500/30 p-6 rounded-2xl text-center">

                <p className="text-gray-400">
                  Correct
                </p>

                <p className="text-4xl font-bold mt-2 text-green-400">
                  {score}
                </p>

              </div>

              {/* WRONG */}

              <div className="bg-red-600/20 border border-red-500/30 p-6 rounded-2xl text-center">

                <p className="text-gray-400">
                  Wrong
                </p>

                <p className="text-4xl font-bold mt-2 text-red-400">
                  {questions.length - score}
                </p>

              </div>

            </div>

            {/* REVIEW ANSWERS */}

            <div className="mt-10">

              <h2 className="text-2xl font-bold mb-6">
                📋 Review Answers
              </h2>

              <div className="space-y-6">

                {questions.map((q, index) => {

                  const isCorrect =
                    finalAnswers[index] === q.answer

                  return (
                    <div
                      key={index}
                      className={`p-6 rounded-2xl border-2 ${
                        isCorrect
                          ? "bg-green-500/10 border-green-500/30"
                          : "bg-red-500/10 border-red-500/30"
                      }`}
                    >

                      {/* QUESTION HEADER */}

                      <div className="flex items-center justify-between gap-4">

                        <h2 className="text-lg font-bold">
                          Question {index + 1}
                        </h2>

                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
                            isCorrect
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {isCorrect
                            ? "✓ Correct"
                            : "✕ Wrong"}
                        </span>

                      </div>

                      {/* QUESTION */}

                      <p className="mt-4 text-lg">
                        {q.question}
                      </p>

                      {/* YOUR ANSWER */}

                      <div className="mt-5 bg-slate-900/60 p-4 rounded-xl">

                        <p className="text-sm text-gray-400">
                          Your Answer
                        </p>

                        <p
                          className={`mt-1 font-semibold ${
                            isCorrect
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {finalAnswers[index]}
                        </p>

                      </div>

                      {/* CORRECT ANSWER */}

                      {!isCorrect && (
                        <div className="mt-3 bg-green-500/10 p-4 rounded-xl">

                          <p className="text-sm text-gray-400">
                            Correct Answer
                          </p>

                          <p className="mt-1 font-semibold text-green-400">
                            {q.answer}
                          </p>

                        </div>
                      )}

                    </div>
                  )
                })}

              </div>

            </div>

            {/* RESULT BUTTONS */}

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">

              <button
                onClick={tryAgain}
                className="bg-purple-500 hover:bg-purple-700 px-6 py-3 rounded-xl font-bold transition-all cursor-pointer active:scale-95"
              >
                🔄 Try Again
              </button>

              <button
                onClick={() => setPage("dashboard")}
                className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-xl font-bold transition-all cursor-pointer active:scale-95"
              >
                📚 Dashboard
              </button>

              <button
                onClick={() => setPage("home")}
                className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-xl font-bold transition-all cursor-pointer active:scale-95"
              >
                🏠 Home
              </button>

            </div>

          </div>

        </div>
      )
    }

    // ---------------- ACTIVE QUIZ ----------------

    return (
      <div className="min-h-screen bg-slate-950 text-white p-6 sm:p-8">

        <div className="max-w-3xl mx-auto">

          {/* BACK BUTTON */}

          <button
            onClick={() => setPage("quizSetup")}
            className="text-gray-400 hover:text-white mb-8 transition"
          >
            ← Change Quiz Mode
          </button>

          {/* QUIZ HEADER */}

          <div className="text-center">

            <div className="text-5xl">
              🧠
            </div>

            <h1 className="text-4xl font-bold text-blue-400 mt-4">
              AI Quiz
            </h1>

            <p className="mt-3 text-gray-400">
              Question {currentQuestion + 1} of {questions.length}
            </p>

            {/* PROGRESS */}

            <div className="mt-6 w-full max-w-xl mx-auto">

              <div className="flex justify-between text-sm text-gray-400 mb-2">

                <span>
                  Progress
                </span>

                <span>
                  {Math.round(
                    ((currentQuestion + 1) /
                      questions.length) *
                      100
                  )}%
                </span>

              </div>

              <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">

                <div
                  className="h-full bg-purple-500 transition-all duration-500"
                  style={{
                    width: `${
                      ((currentQuestion + 1) /
                        questions.length) *
                      100
                    }%`,
                  }}
                />

              </div>

            </div>

          </div>

          {/* QUESTION */}

          {question && (

            <div className="mt-10 bg-slate-800 p-6 sm:p-8 rounded-2xl">

              <h2 className="text-xl sm:text-2xl font-bold leading-relaxed">
                {question.question}
              </h2>

              {/* OPTIONS */}

              <div className="mt-6 space-y-4">

                {question.options.map((option, index) => (

                  <button
                    key={index}
                    onClick={() => setSelectedAnswer(option)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer flex items-center justify-between ${
                      selectedAnswer === option
                        ? "bg-purple-600 border-purple-400 scale-[1.02] shadow-lg"
                        : "bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-slate-500"
                    }`}
                  >

                    <span>

                      <span className="font-bold mr-3">
                        {String.fromCharCode(65 + index)}.
                      </span>

                      {option}

                    </span>

                    {selectedAnswer === option && (
                      <span className="text-xl">
                        ✓
                      </span>
                    )}

                  </button>

                ))}

              </div>

              {/* NEXT / SUBMIT */}

              <button
                onClick={handleNext}
                disabled={!selectedAnswer}
                className={`mt-8 w-full py-4 rounded-xl font-bold transition-all ${
                  selectedAnswer
                    ? "bg-blue-500 hover:bg-blue-700 cursor-pointer active:scale-[0.98]"
                    : "bg-slate-700 text-gray-500 cursor-not-allowed"
                }`}
              >
                {currentQuestion === questions.length - 1
                  ? "Submit Quiz ✓"
                  : "Next Question →"}
              </button>

            </div>

          )}

        </div>

      </div>
    )
  }

  // ---------------- REGISTER PAGE ----------------

if (page === "register") {

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">

      <div className="w-full max-w-md">

        <h1 className="text-4xl font-bold text-center">
          Create Account ✨
        </h1>

        <p className="text-gray-400 text-center mt-2">
          Start your AI-powered learning journey
        </p>

        <input
  className="mt-8 w-full p-3 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:border-purple-500"
  placeholder="Full Name"
  type="text"
  value={registerName}
  onChange={(e) => setRegisterName(e.target.value)}
/>

        <input
          className="mt-4 w-full p-3 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:border-purple-500"
          placeholder="Email"
          type="email"
          value={registerEmail}
onChange={(e) => setRegisterEmail(e.target.value)}
        />

        <input
          className="mt-4 w-full p-3 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:border-purple-500"
          placeholder="Password"
          type="password"
          value={registerPassword}
  onChange={(e) => setRegisterPassword(e.target.value)}
        />

        <input
          className="mt-4 w-full p-3 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:border-purple-500"
          placeholder="Confirm Password"
          type="password"
           value={confirmPassword}
  onChange={(e) => setConfirmPassword(e.target.value)}
          
        />

        <button
  onClick={validateRegistration}
  className="mt-6 w-full bg-purple-500 hover:bg-purple-700 px-6 py-3 rounded-xl font-bold transition"
>
  Create Account
</button>

{authError && (
  <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-center">
    {authError}
  </div>
)}

        <div className="flex items-center gap-3 my-6">

          <div className="h-px bg-slate-700 flex-1"></div>

          <span className="text-gray-500 text-sm">
            OR
          </span>

          <div className="h-px bg-slate-700 flex-1"></div>

        </div>

        <button
          className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 px-6 py-3 rounded-xl font-semibold transition"
        >
          Continue with Google
        </button>

        <button
          className="mt-3 w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 px-6 py-3 rounded-xl font-semibold transition"
        >
          Continue with Microsoft
        </button>

        <p className="text-center text-gray-400 mt-6">

          Already have an account?{" "}

          <button
            onClick={() => setPage("login")}
            className="text-purple-400 hover:text-purple-300 font-semibold"
          >
            Login
          </button>

        </p>

        <button
          onClick={() => setPage("home")}
          className="block mx-auto mt-5 text-gray-500 hover:text-white transition"
        >
          ← Back Home
        </button>

      </div>

    </div>
  )
}

  // ---------------- LOGIN PAGE ----------------

  if (page === "login") {

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">

      <div className="w-full max-w-md">

        <h1 className="text-4xl font-bold text-center">
          Login 🔐
        </h1>

        <p className="text-gray-400 text-center mt-2">
          Welcome back to your AI Study Assistant
        </p>

        <input
          className="mt-8 w-full p-3 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:border-purple-500"
          placeholder="Email"
          type="email"
        />

        <input
          className="mt-4 w-full p-3 rounded-xl bg-slate-800 border border-slate-700 outline-none focus:border-purple-500"
          placeholder="Password"
          type="password"
        />

        <button
          className="mt-6 w-full bg-purple-500 hover:bg-purple-700 px-6 py-3 rounded-xl font-bold transition"
        >
          Login
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px bg-slate-700 flex-1"></div>

          <span className="text-gray-500 text-sm">
            OR
          </span>

          <div className="h-px bg-slate-700 flex-1"></div>
        </div>

        <button
          className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 px-6 py-3 rounded-xl font-semibold transition"
        >
          Continue with Google
        </button>

        <button
          className="mt-3 w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 px-6 py-3 rounded-xl font-semibold transition"
        >
          Continue with Microsoft
        </button>

        <p className="text-center text-gray-400 mt-6">
          Don't have an account?{" "}

          <button
            onClick={() => setPage("register")}
            className="text-purple-400 hover:text-purple-300 font-semibold"
          >
            Register
          </button>
        </p>

        <button
          onClick={() => setPage("home")}
          className="block mx-auto mt-5 text-gray-500 hover:text-white transition"
        >
          ← Back Home
        </button>

      </div>

    </div>
  )
}

  // ---------------- DASHBOARD ----------------

  if (page === "dashboard") {

    return (
      <div className="min-h-screen bg-slate-950 text-white p-8">

        <h1 className="text-4xl font-bold text-center">
          AI Study Assistant 📚
        </h1>

        <div className="max-w-2xl mx-auto mt-10">

          <input
            className="w-full p-4 rounded bg-slate-800"
            placeholder="Ask something..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <button
            onClick={callBackend}
            className="mt-4 bg-purple-500 px-6 py-3 rounded hover:bg-purple-700"
          >
            Ask AI
          </button>

          {answer && (
            <div className="mt-6 bg-purple-600 p-4 rounded-2xl">

              <p className="font-bold">
                🤖 AI Assistant
              </p>

              <p className="whitespace-pre-wrap mt-2">
                {answer}
              </p>

            </div>
          )}

        </div>

        {/* ---------------- STUDY PROGRESS ---------------- */}

        <div className="max-w-4xl mx-auto mt-12">

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">
              📊 Your Study Progress
            </h2>
            <p className="text-gray-400 mt-2">
              Keep learning and track your progress
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center">
              <div className="text-3xl">🏆</div>
              <p className="text-3xl font-bold text-purple-400 mt-3">
                {quizzesCompleted}
              </p>
              <p className="text-gray-400 mt-1">Quizzes Completed</p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center">
              <div className="text-3xl">🧠</div>
              <p className="text-3xl font-bold text-blue-400 mt-3">
                {questionsAnswered}
              </p>
              <p className="text-gray-400 mt-1">Questions Answered</p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center">
              <div className="text-3xl">📈</div>
              <p className="text-3xl font-bold text-green-400 mt-3">
                {quizzesCompleted > 0
                  ? Math.round(totalScorePercentage / quizzesCompleted)
                  : 0
                }%
              </p>
              <p className="text-gray-400 mt-1">Average Score</p>
            </div>

          </div>
        </div>

        <button
          className="mt-10 text-gray-400"
          onClick={() => setPage("home")}
        >
          ← Back Home
        </button>

      </div>
    )
  }

  // ---------------- HOME PAGE ----------------

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* NAVBAR */}

      <nav className="flex justify-between items-center px-6 py-5 bg-slate-900">

        <h2 className="font-bold">
          AI Study Assistant
        </h2>

        <button
          className="bg-purple-500 px-4 py-2 rounded"
          onClick={() => setPage("login")}
        >
          Login
        </button>

      </nav>

      {/* HERO */}

      <div className="text-center mt-10 px-5">

        <h1 className="text-3xl sm:text-6xl font-bold text-purple-400">
          Learn Smarter with AI 🚀
        </h1>

        <p className="mt-4 text-gray-300">
          Upload PDFs, ask doubts, generate quizzes, and study better.
        </p>

        <button
          className="mt-6 bg-purple-500 px-5 py-3 rounded-lg hover:bg-purple-700"
          onClick={() => setPage("dashboard")}
        >
          Get Started
        </button>

      </div>

      {/* FEATURES */}

      <div className="flex flex-wrap justify-center gap-6 mt-20 px-5">

        <div className="bg-slate-800 p-6 w-72 rounded-lg text-center">

          <h2 className="text-xl font-bold">
            📄 Upload Notes
          </h2>

          <p className="mt-2 text-gray-300">
            Upload PDFs and study materials easily.
          </p>

        </div>

        <div className="bg-slate-800 p-6 w-72 rounded-lg text-center">

          <h2 className="text-xl font-bold">
            🤖 AI Doubt Solver
          </h2>

          <p className="mt-2 text-gray-300">
            Ask questions and get smart AI answers.
          </p>

        </div>

        <div className="bg-slate-800 p-6 w-72 rounded-lg text-center">

          <h2 className="text-xl font-bold">
            🧠 Quiz Generator
          </h2>

          <p className="mt-2 text-gray-300">
            Generate quizzes and flashcards instantly.
          </p>

        </div>

      </div>

      {/* UPLOAD SECTION */}

      <div className="text-center mt-24 pb-20 px-5">

        <h2 className="text-3xl font-bold">
          Upload Your Study Materials 📚
        </h2>

        <p className="mt-3 text-gray-300">
          Upload PDFs, notes, and documents to start learning with AI.
        </p>

        {/* FILE INPUT */}

        <div className="max-w-xl mx-auto mt-8">

  <label
    className="block border-2 border-dashed border-slate-600 hover:border-purple-400 bg-slate-900/60 rounded-2xl p-8 cursor-pointer transition-all"
  >

    <div className="text-5xl">
      📄
    </div>

    <p className="mt-4 text-lg font-semibold">
      Choose a PDF
    </p>

    <p className="mt-2 text-sm text-gray-400">
      Click here to select your study material
    </p>

    <input
      type="file"
      accept=".pdf"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files[0]

        if (file) {
          setSelectedFile(file)
          setUploadedFileName("")
          setUploadMessage("")
        }
      }}
    />

  </label>

  {selectedFile && (
    <div className="mt-4 bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-between">

      <div className="flex items-center gap-3 min-w-0">

        <span className="text-2xl">
          📄
        </span>

        <div className="text-left min-w-0">

          <p className="font-semibold truncate">
            {selectedFile.name}
          </p>

          <p className="text-sm text-gray-400">
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>

        </div>

      </div>

      <button
        onClick={() => {
  setSelectedFile(null)
  setUploadedFileName("")
  setUploadMessage("")
  setAnswer("")
  setSummary("")
  setQuiz("")
  setQuizMode(null)
}}
        className="text-red-400 hover:text-red-300 font-semibold ml-4"
      >
        ✕
      </button>

    </div>
  )}

  <button
    onClick={uploadFile}
    disabled={!selectedFile}
    className={`mt-5 w-full py-3 rounded-xl font-bold transition-all ${
      selectedFile
        ? "bg-purple-500 hover:bg-purple-700 cursor-pointer active:scale-95"
        : "bg-slate-700 text-gray-500 cursor-not-allowed"
    }`}
  >
    ⬆️ Upload PDF
  </button>

</div>

        {/* SUMMARY */}

        <button
          onClick={generateSummary}
          className="mt-4 ml-4 bg-green-500 px-5 py-3 rounded hover:bg-green-700"
        >
          Generate Summary
        </button>

        {/* QUIZ */}

        <button
          onClick={generateQuiz}
          className="mt-4 ml-4 bg-blue-500 px-5 py-3 rounded hover:bg-blue-700"
        >
          Generate Quiz 🧠
        </button>

        <button
  onClick={generateFlashcards}
  disabled={!answer || flashcardLoading}
  className={`mt-4 ml-4 px-5 py-3 rounded font-bold transition-all ${
    answer && !flashcardLoading
      ? "bg-purple-500 hover:bg-purple-700 cursor-pointer active:scale-95"
      : "bg-slate-700 text-gray-500 cursor-not-allowed"
  }`}
>
  {flashcardLoading
    ? "Creating Flashcards..."
    : "Generate Flashcards 🃏"}
</button>

        {flashcardError && (
          <div className="mt-6 max-w-xl mx-auto bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-center">
            {flashcardError}
          </div>
        )}

        {/* UPLOAD MESSAGE */}

        {uploadMessage && (
          <p className="mt-4 text-green-400 font-semibold">
            {uploadMessage}
          </p>
        )}

        {uploadedFileName && (
  <div className="max-w-xl mx-auto mt-5 bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3 text-left">

    <span className="text-2xl">
      ✅
    </span>

    <div>
      <p className="font-semibold text-green-400">
        PDF Ready
      </p>

      <p className="text-sm text-gray-400">
        {uploadedFileName}
      </p>
    </div>

  </div>
)}

        {/* EXTRACTED PDF TEXT */}

        {answer && (
          <div className="mt-6 bg-slate-800 p-4 rounded-lg text-left max-h-96 overflow-auto">

            <h3 className="text-xl font-bold mb-2">
              📖 Extracted PDF Text
            </h3>

            <p className="whitespace-pre-wrap">
              {answer}
            </p>

          </div>
        )}

        {/* SUMMARY */}

        {summary && (
          <div className="mt-6 bg-slate-800 p-4 rounded-lg text-left">

            <h3 className="text-xl font-bold mb-2">
              📄 PDF Summary
            </h3>

            <p className="whitespace-pre-wrap">
              {summary}
            </p>

          </div>
        )}

      </div>

    </div>
  )
}

export default App