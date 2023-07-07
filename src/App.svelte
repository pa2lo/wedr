<script>
	import { onMount } from "svelte"
	import { fly, fade, slide } from "svelte/transition"
	import Icon from "./components/Icon.svelte"
	import LocationSelect from "./components/LocationSelect.svelte"
	import Widget from "./components/Widget.svelte"
	import DayWeather from "./components/DayWeather.svelte"

	import { getHumanDateTime, getDayName, getWeatherIcon, codeMap } from "./helpers"

	// variables
	let appState = 'loading'
	let loadingInfo = ''

	let docEl = document.documentElement
	let browserScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
	let appTheme = localStorage.getItem('theme') || browserScheme

	let city = '-'
	let currentPosition = {}
	let accurancy = null
	let fetchedData = null
	let fetchedDate = null
	let fetchedDateTime = null
	let currentWeather = {}
	let dailyWeather = {}
	let hourlyWeather = {}

	let locationError = ''

	// handle position
	function getPosition(maxAge = 0) {
		loadingInfo = 'Getting position'
		navigator.geolocation.getCurrentPosition(positionSuccess, positionError, { timeout: 20000, enableHighAccuracy: true, maximumAge: maxAge })
	}

	function positionSuccess(pos) {
		const { latitude: lat, longitude: lon } = pos.coords
		accurancy = parseInt(pos.coords.accuracy)
		currentPosition = {
			lat,
			lon
		}
		getWeather(lat, lon)
		getCity(lat, lon)
	}

	function positionError(err) {
		console.warn(`ERROR(${err.code}): ${err.message}`)
		locationError = err.message || 'Error'
		locationModal = true
	}

	// weather data
	function getCity(lat, lon) {
		fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}`).then(res => res.json()).then(data => {
			city = data.locality
		})
	}

	function getWeather(lat, lon) {
		if (appState != 'loading') appState = 'loading'
		loadingInfo = 'Downloading data'
		fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation,temperature_2m,relativehumidity_2m,apparent_temperature,weathercode,cloudcover,visibility,windspeed_10m,winddirection_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum&current_weather=true&timezone=auto`).then(res => res.json()).then(data => {
			currentWeather = data.current_weather
			let currentTime = fetchedDate = new Date()
			fetchedDateTime = fetchedDate.getTime()
			let currentDate = currentTime.getDate()
			let currentHour = currentTime.getHours()

			dailyWeather = data.daily.time.reduce((acc, time, index) => {
				acc[time] = {
					precipitation: data.daily.precipitation_sum[index],
					sunrise: data.daily.sunrise[index],
					sunset: data.daily.sunset[index],
					temperature_max: data.daily.temperature_2m_max[index],
					temperature_min: data.daily.temperature_2m_min[index],
					weathercode: data.daily.weathercode[index],
					time: data.daily.time[index]
				}
				return acc
			}, {})

			hourlyWeather = data.hourly.time.reduce((acc, time, index) => {
				let formatedTime = new Date(time)
				let formatedDate = formatedTime.getDate()
				let formatedHour = formatedTime.getHours()
				if ((formatedDate == currentDate && formatedHour < currentHour) || Object.keys(acc).length > 35) return acc

				let t = time.split('T')[0]
				acc[time] = {
					hour: formatedHour,
					time: time,
					precipitation: data.hourly.precipitation[index],
					temperature: data.hourly.temperature_2m[index],
					weathercode: data.hourly.weathercode[index],
					isDay: dailyWeather[t].sunrise <= time && time <= dailyWeather[t].sunset,
					humidity: data.hourly.relativehumidity_2m[index],
					apparent_temperature: data.hourly.apparent_temperature[index],
					cloudcover: data.hourly.cloudcover[index],
					visibility: data.hourly.visibility[index],
					windspeed: data.hourly.windspeed_10m[index],
					winddirection: data.hourly.winddirection_10m[index]
				}
				return acc
			}, {})

			fetchedData = data
			appState = 'showWeather'
			loadingInfo = ''
		})
	}

	function updateWeather() {
		let lat = customLocation ? customLocation.lat : currentPosition.lat
		let lon = customLocation ? customLocation.lon : currentPosition.lon
		getWeather(lat, lon)
	}

	function getSunCompleted() {
		if (!sunVisible || !currentDayDataSunrise || !currentDayDataSunset) return '0%'
		return `${100 * ((fetchedDateTime - currentDayDataSunrise) / (currentDayDataSunset - currentDayDataSunrise))}%`
	}

	// onMount
	onMount(() => {
		if (localStorage.getItem('weatherLocation')) {
			let location = JSON.parse(localStorage.getItem('weatherLocation'))
			customLocation = location
			getWeather(location.lat, location.lon)
			city = location.name
		} else getPosition(1800000)

		if (localStorage.getItem('hue')) hue = localStorage.getItem('hue')

		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault()
			installPrompt = e
		})
	})

	// computed
	$: currentHourData = fetchedData ? Object.values(hourlyWeather)[0] : {}
	$: currentDayData = fetchedData ? Object.values(dailyWeather)[0] : {}
	$: currentDayDataSunrise = currentDayData && new Date(currentDayData.sunrise).getTime()
	$: currentDayDataSunset = currentDayData && new Date(currentDayData.sunset).getTime()
	$: sunVisible = fetchedData && currentDayDataSunrise <= fetchedDateTime && fetchedDateTime <= currentDayDataSunset

	// day weather
	let dayWeather = false
	let dayWeatherData = null

	function showDayWeather(day) {
		let hours = fetchedData.hourly.time.reduce((acc, time, index) => {
			if (time.includes(day)) {
				acc.push({
					time: time.split('T')[1],
					weathercode: fetchedData.hourly.weathercode[index],
					temperature: fetchedData.hourly.temperature_2m[index],
					cloudcover: fetchedData.hourly.cloudcover[index],
					humidity: fetchedData.hourly.relativehumidity_2m[index],
					windspeed: fetchedData.hourly.windspeed_10m[index],
					precipitation: fetchedData.hourly.precipitation[index],
					isDay: dailyWeather[day].sunrise <= time && time <= dailyWeather[day].sunset
				})
			}
			return acc
		}, [])
		dayWeatherData = {
			day: dailyWeather[day],
			hourly: hours
		}
		history.pushState({dayWeather: 1}, '', '')
		dayWeather = true
	}

	// theme switcher
	function switchTheme() {
		if (appTheme == 'dark') {
			appTheme = 'light'
			docEl.classList.remove('theme-dark')
			docEl.classList.add('theme-light')
		} else {
			appTheme = 'dark'
			docEl.classList.remove('theme-light')
			docEl.classList.add('theme-dark')
		}

		if (appTheme != browserScheme) localStorage.setItem('theme', appTheme)
		else localStorage.removeItem('theme')
	}

	// palette switcher
	let hue = '200'
	let themeColors = ['0', '30', '60', '100', '170', '200', '255', '310']
	let showHueSelect = false
	function setHue(color) {
		hue = color
		showHueSelect = false
		if (color == '200') {
			docEl.style.removeProperty('--h')
			localStorage.removeItem('hue')
		} else {
			docEl.style.setProperty('--h', color)
			localStorage.setItem('hue', color)
		}
	}

	// location selection
	let locationModal = false
	let customLocation = null

	function showLocationModal() {
		history.pushState({locationModal: 1}, '', '')
		locationModal = true
	}

	function closeModal() {
		if (appState == 'loading' && locationModal) locationModal = false
		else if (locationModal || dayWeather) history.back()
	}

	function setCustomLocation(ev) {
		closeModal()

		getWeather(ev.detail.lat, ev.detail.lon)
		city = ev.detail.name
		customLocation = ev.detail
	}
	function setDefaultLocation() {
		closeModal()

		appState = 'loading'
		getPosition()

		customLocation = null
	}

	// handle popstate
	window.onpopstate = (e) => {
		if (e.state?.locationModal == 1) locationModal = true
		else if (e.state?.dayWeather == 1 && dayWeatherData) dayWeather = true
		else if (locationModal) locationModal = false
		else if (dayWeather) dayWeather = false
	}

	// other
	function selfFocus(e) {
		let focusTarget = e.target.matches('button') ? e.target : e.target.closest('button')
		focusTarget.focus()
	}

	// app install
	let installPrompt = null
	function installApp() {
		if (!installPrompt) return
		installPrompt.prompt()
		installPrompt.userChoice.then(outcome => {
			if (outcome === 'accepted') installPrompt = null
		})
	}
</script>

{#if appState == 'loading'}
	<div transition:fade={{duration: 200}} class="loaderCont">
		<span class="loader"></span>
		<div class="loadingInfo">{ loadingInfo }</div>
	</div>
{:else}
	{#if fetchedData}
		<div transition:fade class="weather">
			<header class="section dw-header flex ai-c">
				<button on:click|preventDefault={showLocationModal} class="dw-button"><Icon name='geo' />Change location</button>
				<div class="wd-theme flex ai-c">
					<button on:click|preventDefault={switchTheme} class="themeSwitcher is-{appTheme}"><Icon name='dark' /><Icon name='light' /></button>
					<div class="paletteCont">
						<button class="dw-button dw-button-ico" on:click|preventDefault={(e) => selfFocus(e)}><Icon name='palette' /></button>
						<div class="wd-palette">
							{#each themeColors as color}
								<button on:click={() => setHue(color)} class="wd-palette-item" class:active={hue == color} style="--c: {color};"></button>
							{/each}
						</div>
					</div>
				</div>
			</header>
			<main class="section currentWeather">
				<div class="currentWeather-info flex ai-c">
					<div class="currentWeather-left">
						<div class="currentCity fz1 flex ai-c"><Icon name='geo' /> <span>{ city }</span></div>
						<div class="currentTemp fz3">{ currentWeather.temperature }°</div>
						<div class="currentWeatherName fz1">{ codeMap[currentWeather.weathercode].title }</div>
					</div>
					<div class="currentWeather-right">
						<div class="currentWeatherIco fz4"><Icon name={ getWeatherIcon(currentWeather.weathercode, sunVisible) } /></div>
					</div>
				</div>
				<div class="currentWeather-updateInfo flex ai-c">
					<div class="currentWeather-updatedTime">{ getHumanDateTime(fetchedDate) }</div>
					<button class="updateWeather" on:click|preventDefault={updateWeather}>
						<Icon name='refresh' />
						<span class="updateWeather-text">Update</span>
					</button>
				</div>
			</main>
			<section class="section todayWeather">
				<div class="todayWeather-items">
					{#each Object.values(hourlyWeather) as val}
						<div class="tw-item">
							<div class="tw-time">{val.hour}:00</div>
							<div class="tw-icon" title="{codeMap[val.weathercode].title}"><Icon name={getWeatherIcon(val.weathercode, val.isDay)} /></div>
							<div class="tw-temp fz1">{val.temperature}°</div>
						</div>
					{/each}
				</div>
			</section>
			<section class="section weekWeather">
				<table class="weekWeather-items">
					{#each Object.entries(dailyWeather) as [day, val], index}
						<tr class="ww-item" on:click|preventDefault={() => showDayWeather(day)}>
							<td class="ww-day">{ getDayName(val.time, index)}</td>
							<td class="ww-icon" title="{codeMap[val.weathercode].title}"><Icon name={getWeatherIcon(val.weathercode, true)} /></td>
							<td class="ww-max fz1">{val.temperature_max}°</td>
							<td class="ww-min">{val.temperature_min}°</td>
							<td class="ww-arrow"><Icon name='right' /></td>
						</tr>
					{/each}
				</table>
			</section>
			<section class="section weatherWidgets">
				<Widget icon='thermometer' title='Feels like'>{currentHourData.apparent_temperature}°</Widget>
				<Widget icon='droplet' title='Humidity'>{currentHourData.humidity}%</Widget>
				<Widget icon='clouds' title='Cloud cover'>{currentHourData.cloudcover}%</Widget>
				<Widget icon='water' title='Precipitation' unit='mm'>{currentDayData.precipitation}</Widget>
				<Widget icon='cursor' title='Wind' rotate={currentWeather.winddirection} unit='km/h'>{currentWeather.windspeed}</Widget>
				<Widget icon='eye' title='Visibility' unit='km'>{currentHourData.visibility / 1000}</Widget>

				<div class="widgetFull">
					<div class="wWidget-text">
						<div class="wWidget-title">Sunrise</div>
						<div class="wWidget-value fz1">{currentDayData.sunrise.split('T')[1]}</div>
					</div>
					<div class="sun-line" style="--complete: {getSunCompleted()}">
						{#if sunVisible}
							<div class="sun-line-ico"><Icon name='sun' /></div>
						{/if}
					</div>
					<div class="wWidget-text wWidget-text-right">
						<div class="wWidget-title">Sunset</div>
						<div class="wWidget-value fz1">{currentDayData.sunset.split('T')[1]}</div>
					</div>
				</div>
			</section>
			{#if installPrompt}
				<div transition:slide class="installPrompt section">
					<a href="#install" on:click|preventDefault={installApp} class="installPrompt-fakeLink flex ai-c">
						<div class="installPrompt-ico">
							<Icon name='download' />
						</div>
						<div class="installPrompt-text">Download weather app to your device.</div>
					</a>
					<button class="installPrompt-close" on:click={() => installPrompt = null}><Icon name='x' /></button>
				</div>
			{/if}
		</div>

		{#if dayWeather}
			<div transition:fly={{ x: 300 }} class="dayDetails">
				<DayWeather {dayWeatherData} {city} on:close={closeModal} />
			</div>
		{/if}
	{/if}
{/if}
{#if locationModal}
	<LocationSelect	{accurancy} {appState} {customLocation} {locationError}	on:close={closeModal} on:setCustomLocation={setCustomLocation} on:setDefaultLocation={setDefaultLocation} />
{/if}