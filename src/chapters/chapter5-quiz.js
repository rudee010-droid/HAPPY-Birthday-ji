import gsap from 'gsap';
import { config } from '../config.js';
import { sound } from '../fx/sound.js';
import { confetti } from '../fx/confetti.js';
import { haptics } from '../fx/haptics.js';

export function initChapter5() {
  const progressText = document.getElementById('quiz-progress');
  const questionText = document.getElementById('quiz-question-text');
  const optionsContainer = document.getElementById('quiz-options-container');
  const feedbackBox = document.getElementById('quiz-feedback-box');
  const scoreCard = document.getElementById('quiz-score-card');
  const verdictText = document.getElementById('quiz-verdict');
  const restartBtn = document.getElementById('quiz-restart-btn');

  const quizList = config.quiz;
  let currentQ = 0;
  let score = 0;
  let answered = false;

  const renderQuestion = () => {
    answered = false;
    const q = quizList[currentQ];
    if (progressText) progressText.textContent = `Question ${currentQ + 1}/${quizList.length}`;
    if (questionText) questionText.textContent = q.question;
    if (feedbackBox) {
      feedbackBox.className = 'hidden p-4 rounded-2xl text-sm font-medium transition-all duration-300';
      feedbackBox.innerHTML = '';
    }

    if (optionsContainer) {
      optionsContainer.innerHTML = '';
      q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'w-full text-left p-3.5 sm:p-4 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-98 border border-white/20 text-sm sm:text-base text-white/95 transition-all flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-hot-pink';
        btn.innerHTML = `
          <span>${opt}</span>
          <span class="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center text-xs group-hover:border-hot-pink group-hover:bg-hot-pink/20">
            ${String.fromCharCode(65 + idx)}
          </span>
        `;

        btn.addEventListener('click', () => handleAnswer(idx, btn));
        optionsContainer.appendChild(btn);
      });
    }
  };

  const handleAnswer = (selectedIdx, btnElement) => {
    if (answered) return;
    answered = true;
    const q = quizList[currentQ];
    const isCorrect = selectedIdx === q.correctIndex;

    if (isCorrect) {
      score++;
      sound.playCorrect();
      haptics.medium();

      // Confetti burst on right answer
      const rect = btnElement.getBoundingClientRect();
      confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 45);

      btnElement.classList.remove('bg-white/10', 'border-white/20');
      btnElement.classList.add('bg-emerald-500/30', 'border-emerald-400', 'shadow-glow-pink');

      if (feedbackBox) {
        feedbackBox.classList.remove('hidden');
        feedbackBox.classList.add('bg-emerald-500/20', 'text-emerald-200', 'border', 'border-emerald-400/40');
        feedbackBox.innerHTML = `<span>🎉</span> ${q.rightReply}`;
      }
    } else {
      sound.playWrong();
      haptics.buzz();

      btnElement.classList.remove('bg-white/10', 'border-white/20');
      btnElement.classList.add('bg-rose-500/30', 'border-rose-400');

      // Shake animation
      gsap.to(btnElement, { x: 8, duration: 0.08, repeat: 3, yoyo: true });

      const wrongMsg = q.wrongReplies[Math.floor(Math.random() * q.wrongReplies.length)];
      if (feedbackBox) {
        feedbackBox.classList.remove('hidden');
        feedbackBox.classList.add('bg-rose-500/20', 'text-rose-200', 'border', 'border-rose-400/40');
        feedbackBox.innerHTML = `<span>🙈</span> ${wrongMsg}`;
      }
    }

    // Advance to next question after short delay
    setTimeout(() => {
      currentQ++;
      if (currentQ < quizList.length) {
        renderQuestion();
      } else {
        showScoreCard();
      }
    }, 1800);
  };

  const showScoreCard = () => {
    if (optionsContainer) optionsContainer.classList.add('hidden');
    if (feedbackBox) feedbackBox.classList.add('hidden');
    if (questionText) questionText.classList.add('hidden');
    if (progressText) progressText.textContent = `Completed!`;

    if (scoreCard) scoreCard.classList.remove('hidden');
    if (verdictText) {
      verdictText.textContent = `You scored ${score} out of ${quizList.length}! Whether you get 5/5 or 0/5, you remain certified 100% Bundi, and Laddu loves you unconditionally! 💖`;
    }
  };

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      currentQ = 0;
      score = 0;
      if (optionsContainer) optionsContainer.classList.remove('hidden');
      if (questionText) questionText.classList.remove('hidden');
      if (scoreCard) scoreCard.classList.add('hidden');
      renderQuestion();
    });
  }

  renderQuestion();
}

