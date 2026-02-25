// Countdown Timer
function updateCountdown() {
    const now = new Date();
    const currentYear = now.getFullYear();
    let valentinesDate = new Date(currentYear, 1, 14);
    
    if (now > valentinesDate) {
        valentinesDate = new Date(currentYear + 1, 1, 14);
    }
    
    const diff = valentinesDate - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('countdown').textContent = 
        `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

updateCountdown();
setInterval(updateCountdown, 1000);

// Floating Hearts
const hearts = ['💕', '💖', '💗', '💓', '💝', '❤️'];
const container = document.getElementById('hearts');

if (container) {
    for (let i = 0; i < 20; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDuration = (Math.random() * 5 + 5) + 's';
        heart.style.animationDelay = (Math.random() * 8) + 's';
        heart.style.fontSize = (Math.random() * 15 + 15) + 'px';
        container.appendChild(heart);
    }
}

// Gift Modal
function openGift() {
    document.getElementById('giftModal').classList.add('show');
}

function closeGift(event) {
    if (event.target.classList.contains('modal') || 
        event.target.classList.contains('modal-close')) {
        document.getElementById('giftModal').classList.remove('show');
    }
}
