async function getWeather() {
    const city = document.getElementById('city').value;
    const errorMsg = document.getElementById('error-message');
    const loading = document.getElementById('loading');
    const weatherContainer = document.querySelector('.weather-container');
    
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    
    const apiKey = 'da5cc509bc967933cf9f957a7a06eb9b';
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastWeatherUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    // Show loading, hide previous content
    loading.style.display = 'block';
    weatherContainer.style.display = 'none';
    errorMsg.style.display = 'none';

    try {
        // Fetch current weather
        const currentResponse = await fetch(currentWeatherUrl);
        if (!currentResponse.ok) {
            throw new Error('City not found');
        }
        const currentData = await currentResponse.json();

        document.getElementById('cityName').textContent = currentData.name;
        document.getElementById('temperature').textContent = `${Math.round(currentData.main.temp)}°C`;
        document.getElementById('description').textContent = currentData.weather[0].description.charAt(0).toUpperCase() + currentData.weather[0].description.slice(1);
        
        // Additional weather details
        document.getElementById('humidity').textContent = `Humidity: ${currentData.main.humidity}%`;
        document.getElementById('wind').textContent = `Wind: ${currentData.wind.speed} m/s`;
        document.getElementById('feels-like').textContent = `Feels like: ${Math.round(currentData.main.feels_like)}°C`;

        const currentIcon = currentData.weather[0].icon;
        document.querySelector('.current-weather .icon').innerHTML = `<img src="https://openweathermap.org/img/wn/${currentIcon}@2x.png" alt="weather icon">`;

        // Change background based on weather condition
        const weatherCondition = currentData.weather[0].main.toLowerCase();
        changeBackground(weatherCondition);

        // Fetch forecast data
        const forecastResponse = await fetch(forecastWeatherUrl);
        const forecastData = await forecastResponse.json();

        const forecastDays = document.querySelectorAll('.day');
        const uniqueDays = [];
        
        // Get one forecast per day (noon time)
        forecastData.list.forEach((item) => {
            const date = new Date(item.dt_txt);
            const day = date.getDate();
            if (!uniqueDays.includes(day) && uniqueDays.length < 4) {
                uniqueDays.push(day);
            }
        });

        forecastDays.forEach((day, index) => {
            if (uniqueDays[index] !== undefined) {
                const forecast = forecastData.list.find((item) => new Date(item.dt_txt).getDate() === uniqueDays[index]);
                if (forecast) {
                    const forecastIcon = forecast.weather[0].icon;
                    const weekday = new Date(forecast.dt_txt).toLocaleDateString('en-US', { weekday: 'short' });
                    day.querySelector('.weekday').textContent = weekday;
                    day.querySelector('.icon').innerHTML = `<img src="https://openweathermap.org/img/wn/${forecastIcon}@2x.png" alt="forecast icon">`;
                    day.querySelector('.temp').textContent = `${Math.round(forecast.main.temp)}°C`;
                    day.style.display = 'block';
                }
            } else {
                day.style.display = 'none';
            }
        });
        
        // Hide loading, show weather
        loading.style.display = 'none';
        weatherContainer.style.display = 'block';
        
    } catch (error) {
        loading.style.display = 'none';
        weatherContainer.style.display = 'none';
        showError(error.message || 'Error fetching weather data');
    }
}

function handleEnter(event) {
    if (event.key === 'Enter') {
        getWeather();
    }
}

function showError(message) {
    const errorMsg = document.getElementById('error-message');
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
}

function changeBackground(condition) {
    const body = document.body;
    body.className = '';

    switch (condition) {
        case 'clear':
            body.classList.add('clear');
            break;
        case 'clouds':
            body.classList.add('clouds');
            break;
        case 'rain':
        case 'drizzle':
            body.classList.add('rain');
            break;
        case 'snow':
            body.classList.add('snow');
            break;
        case 'thunderstorm':
            body.classList.add('rain');
            break;
        default:
            body.classList.add('default');
            break;
    }

    console.log(`Background class applied: ${body.className}`);
}
