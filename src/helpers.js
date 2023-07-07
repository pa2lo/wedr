export function getHumanDate(date) {
	return new Date(date).toDateString()
}

export function getHumanDateTime(date) {
	return date.toLocaleString('en-GB', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: false })
}

export function getDayName(date, index) {
	if (index == 0) return 'Today'
	else if (index == 1) return 'Tomorrow'

	let d = new Date(date);
	  return d.toLocaleDateString('EN', { weekday: 'long' })
}

export function getWeatherIcon(code, isDay = false) {
	return codeMap[code].icon.replace('dayType', isDay ? 'sun' : 'moon')
}

export const codeMap = {
	0: {
		title: 'Clear sky',
		icon: 'dayType',
		anim: 'clear-dayType'
	},
	1: {
		title: 'Mainly clear',
		icon: 'dayType',
		anim: 'clear-dayType'
	},
	2: {
		title: 'Partly cloudy',
		icon: 'cloud-dayType',
		anim: 'partly-cloudy-dayType'
	},
	3: {
		title: 'Overcast',
		icon: 'cloud',
		anim: 'overcast'
	},
	45: {
		title: 'Fog',
		icon: 'cloud-fog',
		anim: 'fog-dayType'
	},
	48: {
		title: 'Depositing rime fog',
		icon: 'cloud-haze',
		anim: 'partly-cloudy-dayType-haze'
	},
	51: {
		title: 'Light drizzle',
		icon: 'cloud-drizzle',
		anim: 'partly-cloudy-dayType-drizzle'
	},
	53: {
		title: 'Moderate drizzle',
		icon: 'cloud-drizzle',
		anim: 'partly-cloudy-dayType-drizzle'
	},
	55: {
		title: 'Dense drizzle',
		icon: 'cloud-drizzle',
		anim: 'drizzle'
	},
	56: {
		title: 'Light freezing drizzle',
		icon: 'cloud-sleet',
		anim: 'partly-cloudy-dayType-sleet'
	},
	57: {
		title: 'Freezing drizzle',
		icon: 'cloud-sleet',
		anim: 'sleet'
	},
	61: {
		title: 'Slight rain',
		icon: 'cloud-drizzle',
		anim: 'partly-cloudy-dayType-drizzle'
	},
	63: {
		title: 'Moderate rain',
		icon: 'cloud-rain',
		anim: 'partly-cloudy-dayType-rain'
	},
	65: {
		title: 'Heavy rain',
		icon: 'cloud-rain-heavy',
		anim: 'rain'
	},
	66: {
		title: 'Light freezing rain',
		icon: 'cloud-hail',
		anim: 'partly-cloudy-dayType-hail'
	},
	67: {
		title: 'Heavy freezing rain',
		icon: 'cloud-hail',
		anim: 'hail'
	},
	71: {
		title: 'Slight snowfall',
		icon: 'cloud-snow-slight',
		anim: 'partly-cloudy-dayType-snow'
	},
	73: {
		title: 'Moderate snowfall',
		icon: 'cloud-snow-moderate',
		anim: 'partly-cloudy-dayType-snow'
	},
	75: {
		title: 'Heavy snowfall',
		icon: 'cloud-snow',
		anim: 'snow'
	},
	77: {
		title: 'Snow grains',
		icon: 'cloud-snow',
		anim: 'snow'
	},
	80: {
		title: 'Slight rain showers',
		icon: 'cloud-drizzle',
		anim: 'partly-cloudy-dayType-drizzle'
	},
	81: {
		title: 'Moderate rain showers',
		icon: 'cloud-rain',
		anim: 'partly-cloudy-dayType-rain'
	},
	82: {
		title: 'Heavy rain showers',
		icon: 'cloud-rain-heavy',
		anim: 'rain'
	},
	85: {
		title: 'Slight snow showers',
		icon: 'cloud-sleet',
		anim: 'partly-cloudy-dayType-sleet'
	},
	86: {
		title: 'Heavy snow showers',
		icon: 'cloud-sleet',
		anim: 'sleet'
	},
	95: {
		title: 'Thunderstorm',
		icon: 'cloud-lightning-rain',
		anim: 'thunderstorms-dayType-rain'
	},
	96: {
		title: 'Thunderstorm with slight hail',
		icon: 'cloud-lightning-rain',
		anim: 'thunderstorms-rain'
	},
	99: {
		title: 'Thunderstorm with heavy hail',
		icon: 'cloud-lightning-rain',
		anim: 'thunderstorms-rain'
	}
}