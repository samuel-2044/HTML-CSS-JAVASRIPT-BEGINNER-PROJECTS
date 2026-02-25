// Initialize Bar Chart for Renewable Energy Production
const barCtx = document.getElementById('barChart').getContext('2d');
new Chart(barCtx, {
    type: 'bar',
    data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [{
            label: 'Monthly Renewable Energy Production (MWh)',
            data: [5000, 5500, 6000, 6500, 7000, 7500],
            backgroundColor: [
                '#388E3C',
                '#4CAF50',
                '#66BB6A',
                '#81C784',
                '#AED581',
                '#DCE775'
            ],
            borderWidth: 1,
        }],
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
        },
        scales: {
            y: { beginAtZero: true },
        },
    },
});

// Initialize Line Chart for Recycling Rates
const lineCtx = document.getElementById('lineChart').getContext('2d');
new Chart(lineCtx, {
    type: 'line',
    data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [{
            label: 'Monthly Recycling Rate (%)',
            data: [60, 65, 70, 75, 80, 85],
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            borderColor: 'rgba(76, 175, 80, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
        }],
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
        },
        scales: {
            y: { beginAtZero: true },
        },
    },
});

// Initialize Pie Chart for Renewable Energy Sources
const pieCtx = document.getElementById('pieChart').getContext('2d');
new Chart(pieCtx, {
    type: 'pie',
    data: {
        labels: ['Solar', 'Wind', 'Hydro', 'Biomass'],
        datasets: [{
            data: [35, 30, 25, 10],
            backgroundColor: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B'],
        }],
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
        },
    },
});

// Event listeners for info buttons to open modal
const modal = document.getElementById('infoModal');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.querySelector('.close');

document.querySelectorAll('.info-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const chart = btn.getAttribute('data-chart');
        const infoDiv = document.getElementById(chart + '-info');
        modalBody.innerHTML = infoDiv.innerHTML;
        modal.style.display = 'block';
    });
});

closeBtn.onclick = () => {
    modal.style.display = 'none';
};

window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};
