<script>
	import { createEventDispatcher } from 'svelte';

	import Icon from "./Icon.svelte"
	import Widget from "./Widget.svelte"

	import { getHumanDate, getWeatherIcon, codeMap } from "../helpers";

	export let city
	export let dayWeatherData

	const dispatch = createEventDispatcher()

	function closeModal() {
		dispatch('close')
	}
</script>

<div class="section dw-header flex ai-c">
	<div class="dw-header-text">
		<div class="dw-city">{ city }</div>
		<div class="dw-date">{ getHumanDate(dayWeatherData.day.time) }</div>
	</div>
	<button class="dw-button dw-button-ico" on:click|preventDefault={closeModal}><Icon name='x' /></button>
</div>
<section class="section dw-dayWeather flex ai-c">
	<div class="dw-dayWeather-text">
		<div class="dw-dayWeather-temp">
			<span class="dw-dayWeather-tempBigger">{ dayWeatherData.day.temperature_max }°</span>
			<span class="dw-dayWeather-tempSmaller">{ dayWeatherData.day.temperature_min }°</span>
		</div>
		<div class="dw-dayWeather-condition">{ codeMap[dayWeatherData.day.weathercode].title }</div>
	</div>
	<div class="dw-dayWeather-icon"><Icon name='{ getWeatherIcon(dayWeatherData.day.weathercode, true)}' /></div>
</section>
<section class="section dw-widgets">
	<Widget icon='water' title='Precipitation' unit='mm'>{dayWeatherData.day.precipitation}</Widget>
	<Widget icon='sunrise' title='Sunrise'>{dayWeatherData.day.sunrise.split('T')[1]}</Widget>
	<Widget icon='sunset' title='Sunset'>{dayWeatherData.day.sunset.split('T')[1]}</Widget>
</section>
<div class="section dw-hourly">
	<div class="dw-hourly-items-cont">
		<table class="dw-hourly-items">
			<tr class="dw-hourly-header">
				<td>Hourly</td>
				<td></td>
				<td class="dw-hourly-headerIco"><Icon name='thermometer' /></td>
				<td class="dw-hourly-headerIco"><Icon name='clouds' /></td>
				<td class="dw-hourly-headerIco"><Icon name='droplet' /></td>
				<td class="dw-hourly-headerIco"><Icon name='wind' /></td>
				<td class="dw-hourly-headerIco"><Icon name='water' /></td>
			</tr>
			{#each dayWeatherData.hourly as item}
				<tr class="dw-hourly-item">
					<td class="dw-hourly-time">{ item.time }</td>
					<td class="dw-hourly-icon" title="{codeMap[item.weathercode].title}"><Icon name={ getWeatherIcon(item.weathercode, item.isDay) } /></td>
					<td class="dw-hourly-temp fz1">{item.temperature}°</td>
					<td class="dw-hourly-clouds">{item.cloudcover}%</td>
					<td class="dw-hourly-clouds">{item.humidity}%</td>
					<td class="dw-hourly-clouds">{item.windspeed}<span class="dw-hourly-unit">km/h</span></td>
					<td class="dw-hourly-clouds">{item.precipitation}<span class="dw-hourly-unit">mm</span></td>
				</tr>
			{/each}
		</table>
	</div>
</div>