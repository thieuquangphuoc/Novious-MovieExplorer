import { useState, useEffect } from "react";
import questions from "../data/questions";

const BEST_KEY = "novious-quiz-best";

const Quiz = () => {
  // chi so cau hoi dang hien
  const [current, setCurrent] = useState(0);
  // dap an nguoi choi vua bam o cau nay; null = chua chon
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [best, setBest] = useState(0);

  // doc diem cao nhat da luu, chi mot lan khi mo trang
  useEffect(() => {
    const saved = localStorage.getItem(BEST_KEY);
    if (saved !== null) setBest(Number(saved));
  }, []);

  // moi khi lam xong mot luot, ghi lai neu pha ky luc
  useEffect(() => {
    if (finished && score > best) {
      setBest(score);
      localStorage.setItem(BEST_KEY, String(score));
    }
  }, [finished, score, best]);

  const question = questions[current];

  const handlePick = (index) => {
    if (picked !== null) return;          // da chon roi thi khoa lai
    setPicked(index);
    if (index === question.answer) setScore(score + 1);
  };

  const handleNext = () => {
    if (current + 1 === questions.length) {
      setFinished(true);
    } else {
      setCurrent(current + 1);
      setPicked(null);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setPicked(null);
    setScore(0);
    setFinished(false);
  };

  // mau nen cua tung nut dap an, phu thuoc vao trang thai da chon hay chua
  const optionStyle = (index) => {
    if (picked === null) {
      return "border-neutral-700 bg-[#1c1c1c] hover:border-[#E50914] hover:bg-[#241518]";
    }
    if (index === question.answer) {
      return "border-green-500 bg-green-500/15 text-green-300";
    }
    if (index === picked) {
      return "border-[#E50914] bg-[#E50914]/15 text-red-300";
    }
    return "border-neutral-800 bg-[#1c1c1c] text-neutral-500";
  };

  if (finished) {
    const percent = Math.round((score / questions.length) * 100);

    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-lg border border-neutral-800 bg-[#1c1c1c] p-10 text-center">
          <p className="text-sm uppercase tracking-widest text-neutral-500">Kết quả</p>

          <p className="mt-4 text-6xl font-bold text-white">
            {score}
            <span className="text-3xl text-neutral-500">/{questions.length}</span>
          </p>

          <p className="mt-2 text-[#E50914]">Đúng {percent}% số câu</p>

          <p className="mt-6 text-sm text-neutral-400">
            Điểm cao nhất của bạn: <span className="font-semibold text-white">{best}</span>/
            {questions.length}
          </p>

          <button
            onClick={handleRestart}
            className="mt-8 rounded bg-[#E50914] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#f6121d]"
          >
            Chơi lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* thanh tien do */}
        <div className="mb-2 flex items-baseline justify-between text-sm text-neutral-500">
          <span>
            Câu {current + 1} / {questions.length}
          </span>
          <span>
            Điểm: <span className="text-white">{score}</span>
          </span>
        </div>

        <div className="mb-8 h-1 w-full overflow-hidden rounded bg-neutral-800">
          <div
            className="h-full bg-[#E50914] transition-all duration-300"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>

        <h1 className="mb-8 text-2xl font-bold text-white sm:text-3xl">{question.question}</h1>

        <div className="flex flex-col gap-3">
          {question.options.map((option, index) => (
            <button
              key={option}
              onClick={() => handlePick(index)}
              disabled={picked !== null}
              className={`rounded border px-5 py-4 text-left text-white transition-colors ${optionStyle(index)}`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* chi hien sau khi da chon */}
        {picked !== null && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-neutral-400">
              {picked === question.answer
                ? "Chính xác."
                : `Sai rồi — đáp án đúng là "${question.options[question.answer]}".`}
            </p>

            <button
              onClick={handleNext}
              className="rounded bg-[#E50914] px-5 py-2 font-semibold text-white transition-colors hover:bg-[#f6121d]"
            >
              {current + 1 === questions.length ? "Xem kết quả" : "Câu tiếp"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
