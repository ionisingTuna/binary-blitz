import React, { useState, useEffect, useRef } from 'react';
import { Zap, Trophy, Target, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function BinaryBlitz() {
  const [gameState, setGameState] = useState('ready');
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [currentRound, setCurrentRound] = useState(1);
  const [questionNum, setQuestionNum] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [difficulty, setDifficulty] = useState(1);
  const [feedback, setFeedback] = useState(null);
  const [roundStartTime, setRoundStartTime] = useState(null);
  const [roundHistory, setRoundHistory] = useState([]);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const inputRef = useRef(null);

  const generateQuestion = (diff) => {
    const isBinaryToDecimal = Math.random() > 0.5;
    let maxNum;
    
    if (diff <= 2) maxNum = 15;
    else if (diff <= 4) maxNum = 31;
    else if (diff <= 6) maxNum = 63;
    else if (diff <= 8) maxNum = 127;
    else maxNum = 255;

    const num = Math.floor(Math.random() * maxNum) + 1;

    if (isBinaryToDecimal) {
      return {
        type: 'bin2dec',
        question: num.toString(2),
        answer: num.toString()
      };
    } else {
      return {
        type: 'dec2bin',
        question: num.toString(),
        answer: num.toString(2)
      };
    }
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setStreak(0);
    setQuestionNum(0);
    setCurrentRound(1);
    setDifficulty(1);
    setRoundStartTime(Date.now());
    const newQuestion = generateQuestion(1);
    setQuestion(newQuestion);
    setAnswer('');
    setFeedback(null);
    setShowCorrectAnswer(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const nextRound = () => {
    setQuestionNum(0);
    setCurrentRound(prev => prev + 1);
    setRoundStartTime(Date.now());
    const newQuestion = generateQuestion(difficulty);
    setQuestion(newQuestion);
    setAnswer('');
    setFeedback(null);
    setShowCorrectAnswer(false);
    setGameState('playing');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSubmit = () => {
    if (!answer.trim() || gameState !== 'playing') return;

    const isCorrect = answer.trim() === question.answer;
    const newQuestionNum = questionNum + 1;
    setQuestionNum(newQuestionNum);

    if (isCorrect) {
      const newScore = score + 1;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      setBestStreak(Math.max(bestStreak, newStreak));
      setFeedback('correct');
      setShowCorrectAnswer(false);
      
      if (newScore % 10 === 0) {
        setDifficulty(prev => prev + 1);
      }
    } else {
      setStreak(0);
      setFeedback('wrong');
      setShowCorrectAnswer(true);
    }

    // Check if round is complete
    if (newQuestionNum >= 10) {
      const roundTime = ((Date.now() - roundStartTime) / 1000).toFixed(1);
      const newHistory = [...roundHistory, {
        round: currentRound,
        time: parseFloat(roundTime),
        score: isCorrect ? score + 1 : score
      }];
      setRoundHistory(newHistory);
      setGameState('roundComplete');
      return;
    }

    // Next question
    setTimeout(() => {
      const newQuestion = generateQuestion(difficulty);
      setQuestion(newQuestion);
      setAnswer('');
      setFeedback(null);
      setShowCorrectAnswer(false);
      inputRef.current?.focus();
    }, isCorrect ? 300 : 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const formatTime = (seconds) => {
    return `${seconds}s`;
  };

  if (gameState === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-8">
            <Zap className="w-24 h-24 text-yellow-300 mx-auto mb-4" />
            <h1 className="text-6xl font-black text-white mb-2">Binary Blitz</h1>
            <p className="text-xl text-blue-100">10 questions per round. Get faster with practice!</p>
          </div>
          <button
            onClick={startGame}
            className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-2xl px-12 py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all"
          >
            START GAME
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'roundComplete') {
    const lastRound = roundHistory[roundHistory.length - 1];
    const avgTime = roundHistory.length > 0 
      ? (roundHistory.reduce((sum, r) => sum + r.time, 0) / roundHistory.length).toFixed(1)
      : 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-4xl font-black text-gray-900 mb-6 text-center">Round {currentRound} Complete!</h2>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-black text-blue-600">{lastRound.score}/10</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="bg-green-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-black text-green-600">{lastRound.time}s</div>
                <div className="text-sm text-gray-600">Time</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-black text-purple-600">{avgTime}s</div>
                <div className="text-sm text-gray-600">Avg Time</div>
              </div>
            </div>

            {roundHistory.length > 1 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-gray-700" />
                  <h3 className="text-xl font-bold text-gray-900">Progress Over Time</h3>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={roundHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="round" label={{ value: 'Round', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Time (s)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="time" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-sm text-gray-600 text-center mt-2">
                  {roundHistory[0].time > lastRound.time 
                    ? `🎉 You're ${(roundHistory[0].time - lastRound.time).toFixed(1)}s faster than your first round!`
                    : 'Keep practicing to improve your speed!'}
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={nextRound}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-4 rounded-2xl transition-all"
              >
                Next Round
              </button>
              <button
                onClick={startGame}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold text-xl py-4 rounded-2xl transition-all"
              >
                Restart Game
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            <span className="font-bold text-xl">Round {currentRound}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl">{questionNum}/10</span>
            <span className="text-sm text-blue-100">Questions</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-300" />
            <span className="font-bold text-xl">{streak}</span>
            <span className="text-sm text-blue-100">Streak</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-300" />
            <span className="font-bold text-xl">{score}</span>
            <span className="text-sm text-blue-100">Total</span>
          </div>
        </div>

        <div className={`bg-white rounded-3xl shadow-2xl p-12 transition-all duration-300 ${
          feedback === 'correct' ? 'ring-8 ring-green-400' : 
          feedback === 'wrong' ? 'ring-8 ring-red-400' : ''
        }`}>
          <div className="text-center mb-8">
            <div className="text-sm font-semibold text-gray-500 mb-2">
              {question?.type === 'bin2dec' ? 'BINARY → DECIMAL' : 'DECIMAL → BINARY'}
            </div>
            <div className="text-7xl font-black text-gray-900 mb-2 font-mono">
              {question?.question}
            </div>
            <div className="text-sm text-gray-400">Level {difficulty}</div>
          </div>

          <div>
            <input
              ref={inputRef}
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full text-5xl font-bold text-center p-6 border-4 border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500 font-mono"
              placeholder="?"
              autoComplete="off"
              autoFocus
            />
            <button
              onClick={handleSubmit}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-4 rounded-2xl transition-all"
            >
              SUBMIT (Enter)
            </button>
          </div>

          {feedback && (
            <div className="mt-6 text-center">
              <div className={`text-xl font-bold mb-2 ${
                feedback === 'correct' ? 'text-green-600' : 'text-red-600'
              }`}>
                {feedback === 'correct' ? '✓ CORRECT!' : '✗ WRONG!'}
              </div>
              {showCorrectAnswer && (
                <div className="text-lg text-gray-700">
                  Correct answer: <span className="font-mono font-bold">{question?.answer}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <button
            onClick={startGame}
            className="text-white/80 hover:text-white font-semibold underline"
          >
            Restart Game
          </button>
        </div>
      </div>
    </div>
  );
}
