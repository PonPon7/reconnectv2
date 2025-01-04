document.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById("background-music");
    const muteButton = document.getElementById("mute-btn");

    // Initial volume and muted state
    audio.volume = 1.0; // Full volume
    audio.muted = false;

    let isPlaying = false;

    muteButton.addEventListener("click", () => {
        if (!isPlaying) {
            audio.play().then(() => {
                console.log("Audio started successfully.");
                muteButton.textContent = "🔊"; // Update button to unmuted
            }).catch((error) => {
                console.error("Audio playback failed:", error);
            });
        } else {
            audio.pause();
            console.log("Audio paused.");
            muteButton.textContent = "🔈"; // Update button to muted
        }
        isPlaying = !isPlaying;
    });

    // Debugging Events
    audio.addEventListener("canplay", () => console.log("Audio is ready to play."));
    audio.addEventListener("play", () => console.log("Audio is playing..."));
