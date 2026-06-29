const weatherForm = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');
const weatherOutput = document.getElementById('weather-output');
const forecastSection = document.getElementById('forecast-section');
const forecastGrid = document.getElementById('forecast-grid');

const cityNameEl = document.querySelector('.city-name');
const weatherIcon = document.getElementById('weather-icon');
const temperatureEl = document.querySelector('.temperature');
const descriptionEl = document.querySelector('.description');

const feelsLikeEl = document.querySelector('.feels-like');
const humidityEl = document.querySelector('.humidity');
const pressureEl = document.querySelector('.pressure');
const windEl = document.querySelector('.wind');

const errorEl = document.getElementById('error');
const forecastCardTemplate = document.getElementById('forecast-card-template');

document.addEventListener('DOMContentLoaded', () => {
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        cityInput.value = lastCity;
        fetchWeather(lastCity);
    }
});

weatherForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (!city) return;

    localStorage.setItem('lastCity', city);
    await fetchWeather(city);
});

async function fetchWeather(city) {
    errorEl.textContent = '';
    weatherOutput.classList.add('hidden');
    forecastSection.classList.add('hidden');
    forecastGrid.innerHTML = forecastCardTemplate.outerHTML;

    try {
        const currentResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${CONFIG.API_KEY}&units=metric&lang=ru`);
        if (!currentResponse.ok) throw new Error('Город не найден или ошибка API');
        const currentData = await currentResponse.json();
        updateCurrentUI(currentData);

        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${CONFIG.API_KEY}&units=metric&lang=ru`);
        if (!forecastResponse.ok) throw new Error('Ошибка прогноза');
        const forecastData = await forecastResponse.json();
        updateForecastUI(forecastData);
    } catch (error) {
        errorEl.textContent = error.message;
    }
}

function updateCurrentUI(data) {
    weatherOutput.classList.remove('hidden');
    errorEl.textContent = '';

    const { name, main, weather, wind } = data;
    const { temp, feels_like, humidity, pressure } = main;
    const { description, icon } = weather[0];

    cityNameEl.textContent = `Погода в ${name}`;
    temperatureEl.textContent = `${Math.round(temp)}°C`;
    descriptionEl.textContent = description.charAt(0).toUpperCase() + description.slice(1);

    weatherIcon.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    weatherIcon.alt = description;

    feelsLikeEl.textContent = `${Math.round(feels_like)}°C`;
    humidityEl.textContent = `${humidity}%`;
    pressureEl.textContent = `${pressure} гПа`;
    windEl.textContent = `${wind.speed} м/с`;
}

function updateForecastUI(data) {
    forecastSection.classList.remove('hidden');

    const dailyForecasts = {};
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const hour = date.getHours();
        if (hour >= 12 && hour < 15) {
            const dateStr = date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
            dailyForecasts[dateStr] = item;
        }
    });

    Object.values(dailyForecasts).forEach(forecast => {
        const card = forecastCardTemplate.content.cloneNode(true);
        const date = new Date(forecast.dt * 1000);
        const dateStr = date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' });
        const { temp } = forecast.main;
        const { description, icon } = forecast.weather[0];

        card.querySelector('.forecast-date').textContent = dateStr;
        card.querySelector('.forecast-icon').src = `https://openweathermap.org/img/wn/${icon}.png`;
        card.querySelector('.forecast-icon').alt = description;
        card.querySelector('.forecast-temp').textContent = `${Math.round(temp)}°C`;
        card.querySelector('.forecast-description').textContent = description.charAt(0).toUpperCase() + description.slice(1);

        forecastGrid.appendChild(card);
    });
}