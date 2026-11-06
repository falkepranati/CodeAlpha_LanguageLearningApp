const words = [
    { word: "Beautiful", pronunciation: "BYOO-tuh-ful", meaning: "सुंदर" },
    { word: "Courage", pronunciation: "KUR-ij", meaning: "धैर्य" },
    { word: "Honest", pronunciation: "ON-ist", meaning: "प्रामाणिक" },
    { word: "Journey", pronunciation: "JUR-nee", meaning: "प्रवास" },
    { word: "Knowledge", pronunciation: "NOL-ij", meaning: "ज्ञान" },
    { word: "Friendship", pronunciation: "FREND-ship", meaning: "मैत्री" },
    { word: "Happiness", pronunciation: "HAP-ee-nis", meaning: "आनंद" },
    { word: "Strength", pronunciation: "STRENGTH", meaning: "सामर्थ्य" },
    { word: "Freedom", pronunciation: "FREE-dum", meaning: "स्वातंत्र्य" },
    { word: "Success", pronunciation: "suk-SES", meaning: "यश" }
];

let currentIndex = 0;
let showingTranslation = false;
let learnedWords = loadLearnedWords();
let quizIndex = -1;
let quizAnswered = false;

const wordElement = document.getElementById("word");
const pronunciationElement = document.getElementById("pronunciation");
const meaningElement = document.getElementById("meaning");
const translation = document.getElementById("translation");
const meaningBtn = document.getElementById("meaningBtn");
const previousBtn = document.getElementById("previousBtn");
const nextBtn = document.getElementById("nextBtn");
const speakBtn = document.getElementById("speakBtn");
const wordCount = document.getElementById("wordCount");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");

function loadLearnedWords() {
    try {
        const saved = JSON.parse(
            localStorage.getItem("linguaLearned") || "[]"
        );
        return Array.isArray(saved)
            ? saved.filter(i => Number.isInteger(i) && i >= 0 && i < words.length)
            : [];
    } catch {
        return [];
    }
}

function saveLearnedWords() {
    try {
        localStorage.setItem(
            "linguaLearned",
            JSON.stringify(learnedWords)
        );
    } catch {
        // The app can still be used for the current session.
    }
}

function renderWord() {
    const item = words[currentIndex];

    wordElement.textContent = item.word;
    pronunciationElement.textContent =
        "Pronunciation: " + item.pronunciation;
    meaningElement.textContent = item.meaning;

    translation.hidden = !showingTranslation;
    meaningBtn.textContent = showingTranslation
        ? "Hide Translation"
        : "Show Translation";

    wordCount.textContent =
        `Word ${currentIndex + 1} of ${words.length}`;

    previousBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === words.length - 1;

    progressText.textContent =
        `${learnedWords.length} / ${words.length} words learned`;

    progressBar.style.width =
        (learnedWords.length / words.length * 100) + "%";
}

meaningBtn.addEventListener("click", () => {
    showingTranslation = !showingTranslation;

    if (showingTranslation && !learnedWords.includes(currentIndex)) {
        learnedWords.push(currentIndex);
        saveLearnedWords();
    }

    renderWord();
});

previousBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
        currentIndex--;
        showingTranslation = false;
        renderWord();
    }
});

nextBtn.addEventListener("click", () => {
    if (currentIndex < words.length - 1) {
        currentIndex++;
        showingTranslation = false;
        renderWord();
    }
});

speakBtn.addEventListener("click", () => {
    if (!("speechSynthesis" in window)) {
        alert("Speech is not supported in this browser.");
        return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(
        words[currentIndex].word
    );

    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
});

const quizQuestion = document.getElementById("quizQuestion");
const quizOptions = document.getElementById("quizOptions");
const quizFeedback = document.getElementById("quizFeedback");
const nextQuizBtn = document.getElementById("nextQuizBtn");

function startQuiz() {
    quizIndex = (quizIndex + 1) % words.length;
    quizAnswered = false;

    const correctWord = words[quizIndex];

    quizQuestion.textContent =
        `What is the Marathi meaning of "${correctWord.word}"?`;

    quizOptions.replaceChildren();
    quizFeedback.textContent = "";

    const options = [correctWord.meaning];

    while (options.length < 4) {
        const candidate =
            words[Math.floor(Math.random() * words.length)].meaning;

        if (!options.includes(candidate)) {
            options.push(candidate);
        }
    }

    options.sort(() => Math.random() - 0.5);

    options.forEach(option => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = option;

        button.addEventListener("click", () => {
            if (quizAnswered) return;

            quizAnswered = true;

            [...quizOptions.children].forEach(choice => {
                choice.disabled = true;

                if (choice.textContent === correctWord.meaning) {
                    choice.classList.add("correct");
                }
            });

            if (option === correctWord.meaning) {
                quizFeedback.textContent = "Correct! Well done! 🎉";
                quizFeedback.style.color = "#168052";
            } else {
                button.classList.add("wrong");
                quizFeedback.textContent =
                    "Not quite. Correct answer: " + correctWord.meaning;
                quizFeedback.style.color = "#c0394b";
            }
        });

        quizOptions.appendChild(button);
    });
}

nextQuizBtn.addEventListener("click", startQuiz);

renderWord();
startQuiz();