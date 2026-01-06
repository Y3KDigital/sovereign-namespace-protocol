'use client';

import { useState, useEffect } from 'react';
import { getPublicApiBase } from '@/lib/publicApiBase';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

interface QuizScreenProps {
  sessionToken: string;
  onNext: () => void;
}

export default function QuizScreen({ sessionToken, onNext }: QuizScreenProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<{
    score: number;
    total: number;
    passed: boolean;
    failed_questions?: Array<{ question: string; your_answer: string; correct_answer: string; explanation: string }>;
  } | null>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const apiBase = getPublicApiBase();
      
      const response = await fetch(
        `${apiBase}/api/practice/quiz/questions`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load quiz questions');
      }

      const data = await response.json();
      
      // Randomize question order (client-side)
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      setAnswers(new Array(shuffled.length).fill(-1));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    // Validate all questions answered
    if (answers.some(a => a === -1)) {
      setError('Please answer all questions before submitting');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const apiBase = getPublicApiBase();

      const response = await fetch(
        `${apiBase}/api/practice/quiz/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_token: sessionToken,
            answers: answers,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }

      const result = await response.json();
      setQuizResult(result);

      // If passed, allow navigation after 2 seconds
      if (result.passed) {
        setTimeout(() => {
          onNext();
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    setQuizResult(null);
    setAnswers(new Array(questions.length).fill(-1));
    setError(null);
    // Re-randomize questions
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-gray-300">Loading quiz questions...</p>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-6">
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={loadQuestions}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show quiz result (pass or fail)
  if (quizResult) {
    if (quizResult.passed) {
      return (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-green-900/30 border border-green-500 rounded-lg p-8 text-center">
            <span className="text-6xl mb-4 block">✅</span>
            <h2 className="text-3xl font-bold text-green-400 mb-2">Quiz Passed!</h2>
            <p className="text-xl text-gray-300 mb-4">
              Score: {quizResult.score} / {quizResult.total}
            </p>
            <p className="text-gray-400">
              You have demonstrated understanding of the protocol's permanence and finality.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Redirecting to completion gate...
            </p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-8">
            <div className="text-center mb-6">
              <span className="text-6xl mb-4 block">❌</span>
              <h2 className="text-3xl font-bold text-red-400 mb-2">Quiz Not Passed</h2>
              <p className="text-xl text-gray-300 mb-2">
                Score: {quizResult.score} / {quizResult.total}
              </p>
              <p className="text-gray-400">
                You must achieve 100% to proceed. Please review the incorrect answers below and try again.
              </p>
            </div>

            {quizResult.failed_questions && quizResult.failed_questions.length > 0 && (
              <div className="space-y-4 mb-6">
                <h3 className="text-xl font-semibold text-red-300">Incorrect Answers:</h3>
                {quizResult.failed_questions.map((failed, idx) => (
                  <div key={idx} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <p className="font-semibold text-white mb-2">{failed.question}</p>
                    <p className="text-sm text-red-400 mb-1">
                      <strong>Your answer:</strong> {failed.your_answer}
                    </p>
                    <p className="text-sm text-green-400 mb-2">
                      <strong>Correct answer:</strong> {failed.correct_answer}
                    </p>
                    <p className="text-sm text-gray-400 italic">
                      {failed.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center">
              <button
                onClick={handleRestart}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Restart Quiz
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Show quiz questions
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Mandatory Quiz</h1>
        <p className="text-xl text-gray-300 mb-2">
          Test your understanding of the protocol's permanence and finality
        </p>
        <p className="text-gray-400">
          You must answer all {questions.length} questions correctly to proceed (100% required)
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question, qIdx) => (
          <div key={question.id} className="bg-gray-800 rounded-lg p-6">
            <p className="font-semibold text-lg mb-4 text-white">
              {qIdx + 1}. {question.question}
            </p>
            <div className="space-y-3">
              {question.options.map((option, oIdx) => (
                <label
                  key={oIdx}
                  className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    answers[qIdx] === oIdx
                      ? 'bg-blue-900/50 border border-blue-500'
                      : 'bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${qIdx}`}
                    checked={answers[qIdx] === oIdx}
                    onChange={() => handleAnswerChange(qIdx, oIdx)}
                    className="mt-1"
                  />
                  <span className="text-gray-300">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-4">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || answers.some(a => a === -1)}
          className={`font-semibold py-3 px-8 rounded-lg transition-colors ${
            isSubmitting || answers.some(a => a === -1)
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="text-center text-sm text-gray-500">
        Questions answered: {answers.filter(a => a !== -1).length} / {questions.length}
      </div>
    </div>
  );
}
