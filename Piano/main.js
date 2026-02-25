const pianoKeys = document.querySelectorAll(".piano-keys .key"),
volumeSlider = document.querySelector(".volume-slider input"),
keysCheckbox = document.querySelector(".keys-checkbox input");
let allKeys = [],
audio = new Audio(`tunes/a.wav`); // Default audio tune
const playTune = (key) => {
    audio.src = `tunes/${key}.wav`; // Set audio source for key
    audio.play();
    const clickedKey = document.querySelector(`[data-key="${key}"]`);
    clickedKey.classList.add("active");
    setTimeout(() => { // Remove highlight after 150ms
        clickedKey.classList.remove("active");
    }, 150);
}
pianoKeys.forEach(key => {
    allKeys.push(key.dataset.key); // Collect all key data
    // Play tune on click
    key.addEventListener("click", () => playTune(key.dataset.key));
});
const handleVolume = (e) => {
    audio.volume = e.target.value;
}
const showHideKeys = () => {
    // Toggle key visibility
    pianoKeys.forEach(key => key.classList.toggle("hide"));
}
const pressedKey = (e) => {
    // Play tune if key is valid
    if(allKeys.includes(e.key)) playTune(e.key);
}
keysCheckbox.addEventListener("click", showHideKeys);
volumeSlider.addEventListener("input", handleVolume);
document.addEventListener("keydown", pressedKey);