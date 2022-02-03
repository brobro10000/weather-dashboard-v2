var daysForecast = 5;
var flag = 0;

(function createHeader() {
    $('<header>').attr({ "id": "headerContainer", 'class': 'mb-3' }).appendTo(document.body)
    $('<h1>').text('Weather Dashboard').attr({ 'class': 'weatherHeader text-center p-3' }).appendTo('#headerContainer')
})();

(function createMainContainer() {
    $('<main>').attr({ 'id': 'mainContainer', 'class': 'row onStart' }).appendTo(document.body)
})();

(function createAside() {
    $('<aside>').attr({ 'id': 'asideContainer', 'class': 'col' }).appendTo('#mainContainer')
    createSearch()
    $('<hr>').attr({ 'class': 'mt-4 mb-4' }).appendTo('#asideContainer')
    retrieve()
})()

function createSearch() {
    $('<div>').attr({ 'id': 'query' }).appendTo('#asideContainer')
    $('<h2>').text('Search for a City:').appendTo('#query')
    $('<input>').attr({ 'id': 'queryValue', 'class': 'p-2 mt-2 w-100 text-center', 'type': 'text', 'name': 'queryValue', 'pattern': / /, 'placeholder': 'Enter a City', 'onkeyup': 'search(event)' }).appendTo('#query')
    $('<label>').attr({ 'type': 'text' }).appendTo('#query')
    $('<button>').text('Search').attr({ 'class': 'btn btn-primary text-center w-100 mt-3', 'onclick': 'search(event)' }).appendTo('#query')
    autoComplete()
};

function displayWeather(city, data) {
    $('<section>').attr({ 'id': 'weatherContainer', 'class': 'col-8', 'hidden': '' }).appendTo('#mainContainer')
    $('<div>').attr({ 'id': 'dailyContainer', 'class': 'border border-dark p-2' }).appendTo('#weatherContainer')
    $('<h2>').text(`${city} (${data.dt})`).attr({ 'id': "dailyTitle" }).appendTo('#dailyContainer')
    $('<img>').attr({ "id": "icon", 'src': data.icon }).appendTo(`#dailyTitle`)
    $('<h6>').text(`Temp: ${data.temp}\u00B0F`).appendTo('#dailyContainer')
    $('<h6>').text(`Wind: ${data.wind_speed} MPH`).appendTo('#dailyContainer')
    $('<h6>').text(`Humidity: ${data.humidity}%`).appendTo('#dailyContainer')
    $('<h6>').text(`UV Index: `).attr('id', 'UV').appendTo('#dailyContainer')
    $('<h6>').text(`${data.uvi}`).attr({ 'id': 'UVBox', 'class': `p-3 pt-0 pb-0`, 'style': 'display:inline;' }).appendTo('#UV')
    UVColor(data.uvi)

    $('<div>').attr({ 'id': 'forecastContainer' }).attr({ 'class': 'mt-2' }).appendTo('#weatherContainer')
    $('<h3>').text(`${daysForecast}-Day Forecast:`).attr({ 'id': "dailyTitle" }).appendTo('#forecastContainer')
    $('<div>').attr({ 'id': 'forecastCardDeck', 'class': 'card-deck row' }).appendTo('#forecastContainer')
}

function displayForecast(i, data) {
    $('<div>').attr({ 'id': `forecastCard${i}`, 'class': 'card col m-2 p-2 text-center' }).appendTo('#forecastCardDeck')
    $('<h4>').text(`${data.dt}`).attr({ 'class': 'card-title' }).appendTo(`#forecastCard${i}`)
    $('<h6>').text(`Temp: ${data.day}\u00B0F`).attr({ 'class': 'card-text' }).appendTo(`#forecastCard${i}`)
    $('<img>').attr({ 'src': data.icon, 'style': 'align-self:center;' }).appendTo(`#forecastCard${i}`)
    $('<h6>').text(`Wind: ${data.wind_speed} MPH`).attr({ 'class': 'card-text' }).appendTo(`#forecastCard${i}`)
    $('<h6>').text(`Humidity: ${data.humidity}%`).attr({ 'class': 'card-text' }).appendTo(`#forecastCard${i}`)
}

function UVColor(UV) {
    if (UV >= 11) {
        $("#UVBox").removeClass("none low moderate high veryHigh").addClass("extreme")
    } else if (UV >= 8) {
        $("#UVBox").removeClass("none low moderate high extreme").addClass("veryHigh")
    } else if (UV >= 6) {
        $("#UVBox").removeClass("none low moderate veryHigh extreme").addClass("high")
    } else if (UV >= 3) {
        $("#UVBox").removeClass("none low high veryHigh extreme").addClass("moderate")
    } else if (UV >= 1) {
        $("#UVBox").removeClass("none moderate high veryHigh extreme").addClass("low")
    } else if (UV >= 0) {
        $("#UVBox").removeClass("low moderate high veryHigh extreme").addClass("none")
    }
}

function search(event) {
    let cityName = $('#queryValue').val()
    let apiKey = 'fdfa7b628ea8fa5f5d86d7437b5d1acb'
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`

    if (event.code == 'Enter' || event.type == 'click') {
        cityName = (function processString(cityName) {
            cityName = cityName.trim().toLowerCase().split('')
            cityName[0] = cityName[0].toUpperCase()

            cityName.forEach((element, index) => {
                if (cityName[index - 1] == ' ') {
                    cityName[index] = element.toUpperCase()
                }
            })
            return cityName.join('')
        })(cityName)

        window.cityName = cityName

        fetch(url).then(response => {
            if (response.ok) {
                return response.json()
            } else {
                $('#queryValue').val('').attr({ 'placeholder': 'Invalid City, Enter a Valid City' });
            }
        }).then(data => {
            if (!data) {
                return
            } else {
                let { lon, lat } = data.coord;
                window.coords = { lon, lat }
                save()
                $('#historyContainer').remove()
                retrieve()
                weatherData(cityName, { lon, lat })
            }
        })
    }
    else
        return;
}

function weatherData(cityName, coordinates) {
    let apiKey = 'fdfa7b628ea8fa5f5d86d7437b5d1acb'
    let url = `https://api.openweathermap.org/data/2.5/onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial&appid=${apiKey}`

    fetch(url).then(response => {
        if (response.ok) {
            return response.json()
        } else {
            return
        }
    }).then(data => {
        if (!data) {
            return
        }
        (function currentWeather(current) {
            let { dt, temp, wind_speed, humidity, uvi } = current;
            let { icon } = current.weather[0]

            dt = new Date(dt * 1000).toLocaleDateString('en-US')

            icon = `http://openweathermap.org/img/wn/${icon}.png`

            $('#weatherContainer').remove()
            displayWeather(cityName, { dt, temp, wind_speed, humidity, uvi, icon })
            if ($('#weatherContainer').attr('hidden')) {
                $('#weatherContainer').removeAttr('hidden')
                $('#mainContainer').removeClass('onStart').addClass('m-3')
            } else {
                $('#weatherContainer').removeAttr('hidden')
            }
        })(data.current);

        (function forecastWeather(forecast) {

            for (var i = 1; i < daysForecast + 1; i++) {
                let { dt, wind_speed, humidity } = forecast[i];
                let { icon } = forecast[i].weather[0]
                let { day } = forecast[i].temp

                dt = new Date(dt * 1000).toLocaleDateString('en-US')
                icon = `http://openweathermap.org/img/wn/${icon}.png`

                displayForecast(i, { dt, wind_speed, humidity, icon, day })
            }
        })(data.daily)
    })
}

function save() {
    localStorage.setItem(cityName, JSON.stringify(coords))
};

function retrieve() {
    let LS = Object.entries(localStorage).sort()
    $('<div>').attr({ 'id': 'historyContainer' }).appendTo('#asideContainer')
    if (LS.length == 0) {
        return
    } else {
        $('<h2>').text('Search History').attr({ 'style': 'text-decoration:underline;text-align:center;' }).appendTo('#historyContainer')
        LS.forEach(element => {
            element[1] = JSON.parse(element[1])
            createHistory(element)
        })
        createClearStorage()
    }
}

function createHistory(data) {
    data[1] = Object.entries(data[1])
    $('<button>').text(data[0]).attr({ 'class': 'btn btn-primary text-center w-100 mt-3', 'onclick': `weatherData('${data[0]}',{${data[1][0][0]}:${data[1][0][1]},${data[1][1][0]}:${data[1][1][1]}})` }).appendTo('#historyContainer')
}


function createClearStorage() {
    $('<hr>').attr({ 'class': 'mt-4 mb-4' }).appendTo('#historyContainer')
    $('<button>').text('Clear History').attr({ 'class': 'btn btn-primary text-center w-100 mt-3', 'onclick': `clearStorage()` }).appendTo('#historyContainer')
}

function clearStorage() {
    localStorage.clear()
    return window.location.reload()
}

function autoComplete() {
    const cities = []
    fetch(`https://pkgstore.datahub.io/core/world-cities/world-cities_json/data/5b3dd46ad10990bca47b04b4739a02ba/world-cities_json.json`).then(response => {
        if (response.ok) {
            return response.json()
        } else {
            return
        }
    }).then(data => {
        console.log(data)
        data.forEach(element => {
            cities.push(`${element.name}, ${element.country}`)
        })
        console.log(cities)
    })
    $('#queryValue').autocomplete({
        source: function (request, response) {
            var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(request.term), "i");
            response(
                $.grep(cities, function (item) {
                    return matcher.test(item);
                })
            )
        },
        minLength: 2,
        position: {collision:'flip'}
    })
}
