document.addEventListener('DOMContentLoaded', () => {
    // Screens
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const leaderboardScreen = document.getElementById('leaderboard-screen');
    const allScreens = [startScreen, gameScreen, gameOverScreen, leaderboardScreen];

    // Buttons
    const startGameButton = document.getElementById('start-game-button');
    const playSoundButton = document.getElementById('play-sound-button');
    const playAgainButton = document.getElementById('play-again-button');
    const submitScoreButton = document.getElementById('submit-score-button');
    const mainMenuButton = document.getElementById('main-menu-button'); // From Game Over
    const leaderboardButtonMain = document.getElementById('leaderboard-button-main'); // From Start Screen
    const backToMainMenuButton = document.getElementById('back-to-main-menu-button'); // From Leaderboard

    // Displays & Inputs
    const charactersContainer = document.getElementById('characters-container');
    const resultText = document.getElementById('result-text');
    const instructionText = document.getElementById('instruction-text');
    const scoreDisplay = document.getElementById('score');
    const livesDisplay = document.getElementById('lives');
    const finalScoreText = document.getElementById('final-score');
    const playerNameInput = document.getElementById('player-name-input');
    const nameInputContainer = document.getElementById('name-input-container');
    const leaderboardList = document.getElementById('leaderboard-list');

    // Audio
    const fartAudioPlayer = document.getElementById('fart-audio-player');
    const uiCorrectSound = document.getElementById('ui-correct-sound');
    const uiIncorrectSound = document.getElementById('ui-incorrect-sound');
    const uiGameOverSound = document.getElementById('ui-game-over-sound');
    const uiClickSound = document.getElementById('ui-click-sound');

    // Game State
    let score = 0;
    let lives = 5;
    const MAX_LIVES = 5;
    let currentFarterId = null;
    let canGuess = false;
    let charactersInRound = [];
    let gameInProgress = false;

    const LEADERBOARD_KEY = 'whoDealtItLeaderboard';
    const MAX_LEADERBOARD_ENTRIES = 10;

    // --- Character and Sound Data ---
    // IMPORTANT: Add your actual image and sound paths!
    const allCharacters = [
        { id: 'char1', name: 'Granny Pearl', image: 'images/char1.jpeg', fartSounds: ['sounds/fart1.mp3'] },
        { id: 'char2', name: 'Biker Brute', image: 'images/char2.jpeg', fartSounds: ['sounds/fart2.mp3'] },
        { id: 'char3', name: 'Little Sue', image: 'images/char3.jpeg', fartSounds: ['sounds/fart3.mp3'] },
        { id: 'char4', name: 'Mr. Suits', image: 'images/char4.jpeg', fartSounds: ['sounds/fart4.mp3'] },
        { id: 'char5', name: 'Yoga Yasmin', image: 'images/char5.jpeg', fartSounds: ['sounds/fart5.mp3'] },
        { id: 'char6', name: 'Muscle Mike', image: 'images/char6.jpeg', fartSounds: ['sounds/fart6.mp3'] },
        { id: 'char7', name: 'Chef Gordon', image: 'images/char7.jpeg', fartSounds: ['sounds/fart7.mp3'] },
        { id: 'char8', name: 'Opera Diva', image: 'images/char8.jpeg', fartSounds: ['sounds/fart8.mp3'] },
        { id: 'char9', name: 'Professor Fumble', image: 'images/char9.jpeg', fartSounds: ['sounds/fart9.mp3'] },
        { id: 'char10', name: 'construcción Carl', image: 'images/char10.jpeg', fartSounds: ['sounds/fart10.mp3'] }, // Construction Worker
        { id: 'char11', name: 'Pirate Patty', image: 'images/char11.jpeg', fartSounds: ['sounds/fart11.mp3'] },
        // { id: 'char12', name: 'King Reginald', image: 'images/king_reginald.jpeg', fartSounds: ['sounds/fart_royal_decree.mp3', 'sounds/fart_throne_room_echo.mp3'] },
        // { id: 'char13', name: 'Alien Zorp', image: 'images/alien_zorp.jpeg', fartSounds: ['sounds/fart_space_gurgle.mp3', 'sounds/fart_laser_beam_pfft.mp3'] },
        // { id: 'char14', name: 'Clown Chuckles', image: 'images/clown_chuckles.jpeg', fartSounds: ['sounds/fart_honk_horn.mp3', 'sounds/fart_silly_squeak.mp3'] },
        // { id: 'char15', name: 'Librarian Lydia', image: 'images/librarian_lydia.jpeg', fartSounds: ['sounds/fart_silent_but_dusty.mp3', 'sounds/fart_page_turn_flutter.mp3'] },
        // { id: 'char16', name: 'Farmer Giles', image: 'images/farmer_giles.jpeg', fartSounds: ['sounds/fart_tractor_backfire.mp3', 'sounds/fart_fresh_manure.mp3'] },
        // { id: 'char17', name: 'Ballerina Beatrice', image: 'images/ballerina_beatrice.jpeg', fartSounds: ['sounds/fart_graceful_whisp.mp3', 'sounds/fart_tutu_fluff.mp3'] },
        // { id: 'char18', name: 'Detective Snoop', image: 'images/detective_snoop.jpeg', fartSounds: ['sounds/fart_mystery_creak.mp3', 'sounds/fart_case_closed_poof.mp3'] },
        // { id: 'char19', name: 'Surfer Sal', image: 'images/surfer_sal.jpeg', fartSounds: ['sounds/fart_wave_crash.mp3', 'sounds/fart_breezy_toot.mp3'] },
        // { id: 'char20', name: 'Mad Scientist Iggy', image: 'images/mad_scientist_iggy.jpeg', fartSounds: ['sounds/fart_bubbling_potion.mp3', 'sounds/fart_electric_zap_fizzle.mp3'] }
    ];

    // --- UI Navigation ---
    function showScreen(screenToShow) {
        allScreens.forEach(screen => screen.classList.remove('active'));
        screenToShow.classList.add('active');
        playUiSound(uiClickSound);
    }

    // --- Sound Functions ---
    function playUiSound(soundElement) {
        if (soundElement && soundElement.src) {
            soundElement.currentTime = 0;
            soundElement.play().catch(e => console.warn("UI sound play error:", e));
        }
    }

    // --- Game Logic Functions ---
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function getRandomSound(soundsArray) {
        return soundsArray[Math.floor(Math.random() * soundsArray.length)];
    }

    function updateLivesDisplay() {
        livesDisplay.innerHTML = 'Lives: ' + '❤️'.repeat(lives) + '💔'.repeat(MAX_LIVES - lives);
    }

    function resetGame() {
        score = 0;
        lives = MAX_LIVES;
        scoreDisplay.textContent = score;
        updateLivesDisplay();
        gameInProgress = true;
        setupRound();
        showScreen(gameScreen)
    }

    function setupRound() {
        if (!gameInProgress) return;

        canGuess = false;
        resultText.textContent = '';
        instructionText.textContent = 'Press Play Fart & Guess Who!';
        playSoundButton.classList.remove('hidden');
        playSoundButton.disabled = false;
        charactersContainer.innerHTML = '';

        // Select 4 unique characters for the round
        if (allCharacters.length < 4) {
            console.error("Not enough unique characters to start a round!");
            resultText.textContent = "Need at least 4 characters!";
            gameInProgress = false;
            return;
        }
        const shuffledCharacters = shuffleArray([...allCharacters]);
        charactersInRound = shuffledCharacters.slice(0, 4);

        const farterIndex = Math.floor(Math.random() * charactersInRound.length);
        currentFarterId = charactersInRound[farterIndex].id;

        const fartSoundFile = getRandomSound(charactersInRound[farterIndex].fartSounds);
        fartAudioPlayer.src = fartSoundFile;
        // console.log(`Farter: ${charactersInRound[farterIndex].name}, Sound: ${fartSoundFile}`);

        charactersInRound.forEach(char => {
            const charDiv = document.createElement('div');
            charDiv.classList.add('character');
            charDiv.dataset.id = char.id;

            const img = document.createElement('img');
            img.src = char.image;
            img.alt = char.name;
            // img.onerror = () => { img.src = 'images/default_char_placeholder.png'; console.warn(`Image not found: ${char.image}`);};


            charDiv.appendChild(img);
            charDiv.addEventListener('click', handleCharacterClick);
            charactersContainer.appendChild(charDiv);
        });
    }

    function playFartSound() {
        if (fartAudioPlayer.src && gameInProgress) {
            playUiSound(uiClickSound);
            fartAudioPlayer.play()
                .then(() => {
                    playSoundButton.disabled = true;
                    playSoundButton.classList.add('hidden');
                    instructionText.textContent = "Who did it?! Click on a character!";
                    canGuess = true;
                })
                .catch(error => {
                    console.error("Error playing fart sound:", error);
                    resultText.textContent = "Sound error! Try again.";
                    playSoundButton.disabled = false; // Allow retry
                });
        }
    }

    function handleCharacterClick(event) {
        if (!canGuess || !gameInProgress) return;
        playUiSound(uiClickSound);

        const clickedCharDiv = event.currentTarget;
        const guessedId = clickedCharDiv.dataset.id;
        canGuess = false;

        document.querySelectorAll('.character').forEach(el => el.classList.remove('selected'));
        clickedCharDiv.classList.add('selected');

        const actualFarterDiv = charactersContainer.querySelector(`.character[data-id="${currentFarterId}"]`);

        const revealOverlay = document.createElement('div');
        revealOverlay.classList.add('reveal-overlay');

        if (guessedId === currentFarterId) {
            score++;
            resultText.textContent = 'CORRECT! Sniff Master!';
            resultText.style.color = 'var(--correct-green)';
            if (actualFarterDiv) {
                actualFarterDiv.classList.add('correct', 'revealed');
                actualFarterDiv.appendChild(revealOverlay.cloneNode(true));
                // Add Stink Puff (basic version for now)
                createStinkPuff(actualFarterDiv);
            }
            playUiSound(uiCorrectSound);
            setTimeout(setupRound, 2000); // Auto next round
        } else {
            lives--;
            resultText.textContent = `WRONG! It was ${charactersInRound.find(c => c.id === currentFarterId).name}!`;
            resultText.style.color = 'var(--incorrect-red)';

            clickedCharDiv.classList.add('incorrect-guess'); // Specific class for the one clicked
            clickedCharDiv.appendChild(revealOverlay.cloneNode(true)); // Show "facepalm" on clicked

            if (actualFarterDiv && actualFarterDiv !== clickedCharDiv) {
                const correctOverlay = document.createElement('div'); // Separate overlay for the actual farter
                correctOverlay.classList.add('reveal-overlay');
                actualFarterDiv.classList.add('incorrect', 'revealed'); // 'incorrect' styles actual farter as "who it was"
                actualFarterDiv.appendChild(correctOverlay);
                createStinkPuff(actualFarterDiv);
            }
            playUiSound(uiIncorrectSound);
            updateLivesDisplay();

            if (lives <= 0) {
                gameOver();
            } else {
                setTimeout(setupRound, 3000); // Longer delay for wrong answer
            }
        }
        scoreDisplay.textContent = score;
    }

    function createStinkPuff(characterDiv) {
        // This is a very basic visual. We'll replace with SVG animation later.
        const puff = document.createElement('div');
        puff.classList.add('stink-puff'); // We'll style this later
        // Position it near the character's bottom - rough positioning for now
        puff.style.left = '50%';
        puff.style.bottom = '10px';
        puff.style.transform = 'translateX(-50%)';
        puff.innerHTML = '💨'; // Simple emoji puff
        puff.style.fontSize = '30px';
        puff.style.opacity = '1';
        characterDiv.appendChild(puff);

        // Animate it slightly
        puff.animate([
            { opacity: 1, transform: 'translate(-50%, 0) scale(1)' },
            { opacity: 0, transform: 'translate(-50%, -30px) scale(1.5)' }
        ], {
            duration: 1000,
            easing: 'ease-out',
            fill: 'forwards'
        });
        setTimeout(() => puff.remove(), 1000);
    }


    function gameOver() {
        gameInProgress = false;
        playUiSound(uiGameOverSound);
        finalScoreText.textContent = score;
        showScreen(gameOverScreen);

        const highScores = getLeaderboard();
        if (highScores.length < MAX_LEADERBOARD_ENTRIES || score > highScores[highScores.length - 1].score) {
            nameInputContainer.classList.remove('hidden');
            playerNameInput.value = '';
            playerNameInput.focus();
        } else {
            nameInputContainer.classList.add('hidden');
        }
    }

    // --- Leaderboard Functions ---
    function getLeaderboard() {
        const scores = localStorage.getItem(LEADERBOARD_KEY);
        return scores ? JSON.parse(scores) : [];
    }

    function saveScoreToLeaderboard(name, score) {
        const scores = getLeaderboard();
        scores.push({ name, score });
        scores.sort((a, b) => b.score - a.score); // Sort descending
        const newScores = scores.slice(0, MAX_LEADERBOARD_ENTRIES);
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(newScores));
    }

    function displayLeaderboard() {
        const scores = getLeaderboard();
        leaderboardList.innerHTML = ''; // Clear previous list

        if (scores.length === 0) {
            leaderboardList.innerHTML = '<li>No scores yet! Be the first!</li>';
            return;
        }

        scores.forEach((entry, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="rank">${index + 1}.</span>
                <span class="name">${escapeHtml(entry.name)}</span>
                <span class="score">${entry.score} pts</span>
            `;
            leaderboardList.appendChild(li);
        });
        showScreen(leaderboardScreen);
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&")
            .replace(/</g, "<")
            .replace(/>/g, ">")
            .replace(/"/g, '"')
            .replace(/'/g, "'");
    }


    // --- Event Listeners ---
    startGameButton.addEventListener('click', resetGame);
    playSoundButton.addEventListener('click', playFartSound);
    playAgainButton.addEventListener('click', resetGame);

    submitScoreButton.addEventListener('click', () => {
        playUiSound(uiClickSound);
        const playerName = playerNameInput.value.trim() || "Anonymous Farter";
        if (playerName) {
            saveScoreToLeaderboard(playerName, score);
            nameInputContainer.classList.add('hidden');
            displayLeaderboard(); // Show leaderboard after submitting
        }
    });

    mainMenuButton.addEventListener('click', () => showScreen(startScreen));
    leaderboardButtonMain.addEventListener('click', displayLeaderboard);
    backToMainMenuButton.addEventListener('click', () => showScreen(startScreen));


    // --- Initialize Game ---
    showScreen(startScreen); // Show start screen initially
    updateLivesDisplay(); // Initialize lives display for the first game
});