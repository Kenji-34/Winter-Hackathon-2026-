import { useState } from 'react'
import quizData from './mock.json'
import './css/Mcq.css'
import { setDraft } from './draftStore'

const QUESTIONS_PER_QUIZ = 3

function getRandomQuestions() {
  return [...quizData.questions]
    .sort(() => Math.random() - 0.5)
    .slice(0, QUESTIONS_PER_QUIZ)
}

export default function Mcq() {
  const [questions, setQuestions] = useState(getRandomQuestions)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [result, setResult] = useState(null)
  const [explanationOpen, setExplanationOpen] = useState(true)
  const [score, setScore] = useState(0)
  const [complete, setComplete] = useState(false)

  const question = questions[questionIndex]
  const questionNumber = questionIndex + 1
  const totalQuestions = questions.length

  function handleSubmit() {
    if (selectedAnswer === null) return
    const isCorrect = selectedAnswer === question.answer
    setResult(isCorrect ? 'correct' : 'wrong')
    setExplanationOpen(true)
    if (isCorrect) setScore(currentScore => currentScore + 1)
  }

  function goToNextQuestion() {
    if (questionIndex === totalQuestions - 1) {
      setComplete(true)
      return
    }
    setQuestionIndex(currentIndex => currentIndex + 1)
    setSelectedAnswer(null)
    setResult(null)
    setExplanationOpen(true)
  }

  function retryCurrentQuestion() {
    setSelectedAnswer(null)
    setResult(null)
    setExplanationOpen(true)
  }

  function goToFormat() {
    // TEMP: subjectId/image are unset until Capture.jsx is wired in — see draftStore.js
    setDraft({
      subjectId: null,
      image: null,
      topic: quizData.topic,
      title: quizData.title,
      tags: quizData.tags,
      questions: quizData.questions,
    })
    window.location.hash = '/format'
  }

  function restartQuiz() {
    setQuestions(getRandomQuestions())
    setQuestionIndex(0)
    setSelectedAnswer(null)
    setResult(null)
    setExplanationOpen(true)
    setScore(0)
    setComplete(false)
  }

  return (
    <main className="mcq-page">
      <section className="mcq-shell" aria-labelledby="question-title">
        <button className="mcq-back" type="button" aria-label="Go back to homepage" onClick={() => { window.location.hash = '/' }}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
        </button>

        {!complete && (
          <>
            <div className="mcq-heading-row">
              <h1 id="question-title">Question {questionNumber}</h1>
              <button className="mcq-skip" type="button" onClick={goToNextQuestion}>Skip</button>
            </div>

            <div className="mcq-progress" role="progressbar" aria-label="Quiz progress" aria-valuemin="1" aria-valuemax={totalQuestions} aria-valuenow={questionNumber}>
              <span style={{ width: `${(questionNumber / totalQuestions) * 100}%` }} />
            </div>
            <p className="mcq-count">{questionNumber}/{totalQuestions}</p>

            {result === null ? (
              <>
                <h2 className="mcq-question">{question.q}</h2>
                <div className="mcq-answers" role="radiogroup" aria-label="Answer options">
                  {question.options.map((answer, index) => (
                    <button className={`mcq-answer${selectedAnswer === index ? ' selected' : ''}`} type="button" role="radio" aria-checked={selectedAnswer === index} onClick={() => setSelectedAnswer(index)} key={answer}>
                      <span className="mcq-radio" aria-hidden="true" />
                      <span>{answer}</span>
                    </button>
                  ))}
                </div>
                <button className="mcq-submit" type="button" disabled={selectedAnswer === null} onClick={handleSubmit}>Submit</button>
              </>
            ) : (
              <section className="mcq-result" aria-live="polite">
                <div className={`mcq-feedback ${result}`}>
                  <span className="mcq-feedback-icon" aria-hidden="true">{result === 'correct' ? '✓' : '×'}</span>
                  <span>{result === 'correct' ? 'Correct answer!' : 'Wrong answer :('}</span>
                </div>

                <div className={`mcq-explanation${explanationOpen ? ' open' : ''}`}>
                  <button className="mcq-explanation-heading" type="button" aria-expanded={explanationOpen} onClick={() => setExplanationOpen(open => !open)}>
                    <span>Explanation</span>
                    <span className="mcq-chevron" aria-hidden="true">⌃</span>
                  </button>
                  {explanationOpen && <p>{question.explanation}</p>}
                </div>

                <div className="mcq-result-actions">
                  {result === 'wrong' && (
                    <button className="mcq-retry" type="button" onClick={retryCurrentQuestion}>
                      Try again
                    </button>
                  )}
                  <button className="mcq-submit mcq-continue" type="button" onClick={goToNextQuestion}>
                    {questionIndex === totalQuestions - 1 ? 'See result' : 'Continue'}
                  </button>
                </div>
              </section>
            )}
          </>
        )}

        {complete && (
          <section className="mcq-complete" aria-live="polite">
            <div className="mcq-complete-icon" aria-hidden="true">✓</div>
            <h1 id="question-title">Quiz complete!</h1>
            <p>You answered <strong>{score}</strong> out of <strong>{totalQuestions}</strong> questions correctly.</p>
            <button className="mcq-submit" type="button" onClick={score === totalQuestions ? goToFormat : restartQuiz}>
              {score === totalQuestions ? 'Make note' : 'Try again'}
            </button>
            <button className="mcq-home-link" type="button" onClick={() => { window.location.hash = '/' }}>Back to home</button>
          </section>
        )}
      </section>
    </main>
  )
}
