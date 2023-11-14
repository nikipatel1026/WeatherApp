let units = "metric";
let temperature = 0;
let userCity = "Philadelphia";

const DegreeUnits = {
  Celsius: "°C ",
  Fahrenheit: "°F ",
};

const SpeedUnits = {
  MPH: " mph",
  KPH: " km/h",
};

let degreesLabel = DegreeUnits.Celsius;
let speedLabel = SpeedUnits.KPH;

function getLocalDate(dt, includeTime = true) {
    var date = new Date(dt * 1000);
    if (includeTime) {
      // Include time in the format HH:mm
      return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) +
        ' ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });
    } else {
      // Date without time
      return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
  }

function getLocalTime(dt) {
  var date = new Date(dt * 1000);
  var hours = date.getHours();
  var minutes = date.getMinutes();
  // Format hours and minutes with leading zeros if needed
  hours = (hours < 10) ? '0' + hours : hours;
  minutes = (minutes < 10) ? '0' + minutes : minutes;
  return hours + ':' + minutes;
}

let weather = {
  apiKey: "82005d27a116c2880c8f0fcb866998a0",
  fetchWeather: function (city) {
    // Current weather API call
    $.ajax({
      url:
        "https://api.openweathermap.org/data/2.5/weather?q=" +
        city +
        "&units=" +
        units +
        "&appid=" +
        this.apiKey,
      method: "GET",
      success: (data) => {
        this.displayWeather(data);
        // Fetch and display forecast data
        this.fetchForecast(city);
      },
      error: () => {
        alert("No weather found.");
        throw new Error("No weather found.");
      },
    });
  },

  fetchForecast: function (city) {
    // Forecast API call
    $.ajax({
      url:
        "https://api.openweathermap.org/data/2.5/forecast?q=" +
        city +
        "&units=" +
        units +
        "&appid=" +
        this.apiKey,
      method: "GET",
      success: (data) => this.displayForecast(data),
      error: () => {
        alert("No forecast found.");
        throw new Error("No forecast found.");
      },
    });
  },

  displayForecast: function (data) {
    // Handle and display forecast data as needed
    const forecastList = data.list;

    // Clear previous forecast data
    $(".hourly-forecast").empty();
    $(".daily-forecast").empty();

    // Display hourly forecast
    const uniqueHours = new Set();
    for (let i = 0; i < forecastList.length; i++) {
      const forecast = forecastList[i];
      const dt = forecast.dt;
      const temperature = forecast.main.temp;
      const { icon } = forecast.weather[0];

      // Get the hour from the timestamp
      const hour = new Date(dt * 1000).getHours();

      // Display only unique hours
      if (!uniqueHours.has(hour)) {
        $(".hourly-forecast").append(`
          <div class="hourly-item">
            <p>${getLocalTime(dt)}</p>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="icon">
            <p>${temperature + degreesLabel}</p>
          </div>
        `);

        uniqueHours.add(hour);
      }
    }

    // Display 5-10 day forecast
    const dailyForecast = forecastList.filter((item) => item.dt_txt.includes("12:00:00"));

    for (let i = 0; i < dailyForecast.length; i++) {
      const forecast = dailyForecast[i];
      const dt = forecast.dt;
      const temperature = forecast.main.temp;
      const { icon } = forecast.weather[0];

      // Use getLocalDate to display only dates for the 5-10 day forecast
      $(".daily-forecast").append(`
        <div class="daily-item">
          <p>${getLocalDate(dt, false)}</p>
          <img src="https://openweathermap.org/img/wn/${icon}.png" alt="icon">
          <p>${temperature + degreesLabel}</p>
        </div>
      `);
    }
  },

  displayWeather: function (data) {
    const { name } = data;
    const country = data.sys.country;
    const { icon, description } = data.weather[0];
    const { temp, temp_min, temp_max, feels_like, humidity } = data.main;
    const { speed, deg } = data.wind;
    const dt = data.dt;
    if (country !== "") {
      $(".city").text(name + ", " + country);
    } else {
      $(".city").text(name);
    }
    $(".icon").attr(
      "src",
      "https://openweathermap.org/img/wn/" + icon + ".png"
    );
    $(".time").text(getLocalDate(dt));
    $(".description").text(description);
    $(".temp").text(temp + degreesLabel);
    $(".temp_min").text("Low " + temp_min + degreesLabel);
    $(".temp_max").text("Hi " + temp_max + degreesLabel);
    $(".feels_like").text(" Feels like " + feels_like + degreesLabel);
    $(".humidity").text("Humidity: " + humidity + "%");
    $(".wind").text("Wind speed: " + speed + speedLabel);
    $(".deg").text(
      "Direction: " + deg + " ° " + getCardinalDirection(deg)
    );
    $(".weather").removeClass("loading");
    $("body").css(
      "backgroundImage",
      "url('https://source.unsplash.com/1600x900/?" + name + "')"
    );
  },

  search: function () {
    this.fetchWeather($(".search-bar").val());
  },
};

$(".temp").click(function () {
  if (units === "metric") {
    units = "imperial";
    degreesLabel = DegreeUnits.Fahrenheit;
    speedLabel = SpeedUnits.MPH;
  } else {
    units = "metric";
    degreesLabel = DegreeUnits.Celsius;
    speedLabel = SpeedUnits.KPH;
  }
  weather.fetchWeather(userCity);
});

$(".search button").click(function () {
  weather.search();
});

$(".search-bar").keyup(function (event) {
  if (event.key == "Enter") {
    weather.search();
  }
});

function getCardinalDirection(angle) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.round(angle / 45) % 8];
}

function degToCompass(angle) {
  var val = Math.floor((angle / 22.5) + 0.5);
  var arr = [
    "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
    "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"
  ];
  return arr[val % 16];
}

function fetchUserCity() {
  let apiKey = "841afa96ceb940da8f6157a7f16cc527";
  $.ajax({
    url: "https://api.geoapify.com/v1/ipinfo?apiKey=" + apiKey,
    method: "GET",
    success: (data) => {
      if (data.city.name.trim().length > 0) {
        userCity = data.city.name;
      }
      weather.fetchWeather(userCity);
    },
    error: () => {
      alert("No city found.");
      throw new Error("No city found.");
    },
  });
}

function init() {
  fetchUserCity();
  weather.fetchWeather(userCity);
}

$(document).ready(init);
