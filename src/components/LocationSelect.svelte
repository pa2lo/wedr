<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { fly } from "svelte/transition"
	import Icon from "./Icon.svelte"

	export let customLocation
	export let appState
	export let locationError
	export let accurancy

	const dispatch = createEventDispatcher()

	let locationsHistory = []
	let locationSearchInput = ''
	let isSearching = false
	let searchResults = []
	let searchDebounce = null

	onMount(() => {
		if (localStorage.getItem('locationsHistory')) locationsHistory = JSON.parse(localStorage.getItem('locationsHistory'))
	})

	function searchLocation() {
		isSearching = true
		if (searchDebounce) clearTimeout(searchDebounce)
		searchDebounce = setTimeout(() => {
			if (!locationSearchInput) return
			let url = `https://geocoding-api.open-meteo.com/v1/search?${new URLSearchParams({name: locationSearchInput}).toString()}`
			fetch(url).then(res => res.json()).then(data => {
				searchResults = data.results || []
				isSearching = false
			})
		}, 500)
	}

	function removeHistoryItem(item) {
		locationsHistory = locationsHistory.filter(historyItem => historyItem != item)
		if (locationsHistory.length > 0) localStorage.setItem('locationsHistory', JSON.stringify(locationsHistory))
		else localStorage.removeItem('locationsHistory')
	}

	function setCustomLocation(location) {
		if (customLocation && customLocation.id == location.id) return
		locationSearchInput = ''

		let newLocation = {
			id: location.id,
			name: location.name,
			lat: location.latitude,
			lon: location.longitude
		}

		if (!locationsHistory.includes(location)) {
			locationsHistory.push(location)
			locationsHistory = locationsHistory
		}

		localStorage.setItem('weatherLocation', JSON.stringify(newLocation))
		localStorage.setItem('locationsHistory', JSON.stringify(locationsHistory))

		dispatch('setCustomLocation', newLocation)
	}

	function setDefaultLocation() {
		if (!customLocation) return
		locationSearchInput = ''
		localStorage.removeItem('weatherLocation')

		dispatch('setDefaultLocation')
	}

	function closeModal() {
		dispatch('close')
	}
</script>

<div transition:fly={{ x: 300 }} class="locationModal">
	<div class="section dw-header flex ai-c">
		<div class="locationModal-title fz1">Select location</div>
		{#if appState != 'loading'}
			<button class="dw-button dw-button-ico" on:click|preventDefault={closeModal}><Icon name='x' /></button>
		{/if}
	</div>
	<div class="section locationSearch">
		<input bind:value={locationSearchInput} on:input={searchLocation} class="locationSearch-input" type="text" placeholder="Seach city f.e. Bratislava...">
		{#if locationSearchInput}
			<button class="locationSearch-clear" on:click={() => locationSearchInput = ''}><Icon name='x' /></button>
		{/if}
	</div>
	<div class="section locations-list">
		<div class="locations-item-outer">
			<a href="/" class="locations-item" class:active={!customLocation} class:disabled={locationError} on:click|preventDefault={() => setDefaultLocation()}>
				<div class="locations-itemIcon"><Icon name='geo' /></div>
				<div class="locations-itemTitle">
					Current location
					{#if accurancy}
						<span class="locations-itemTitle-smaller">(accurancy: {accurancy}m)</span>
					{/if}
					{#if locationError}
						<div class="locations-itemTitle-error">{ locationError }</div>
					{/if}
				</div>
			</a>
		</div>
		{#if locationSearchInput}
			<div class="locations-item locations-itemHeader">Search results</div>
			{#if isSearching}
				<div class="locations-item-outer">
					<div class="locations-item locations-item-info">
						<div class="locations-item-loader"></div>
						<span class="locations-itemTitle">Searching</span>
					</div>
				</div>
			{:else}
				{#if searchResults.length}
					{#each searchResults as item}
						<div class="locations-item-outer">
							<a href="/" class="locations-item" class:active={customLocation && customLocation.id == item.id} on:click|preventDefault={() => setCustomLocation(item)}>
								<div class="locations-itemFlag"><img src='https://purecatamphetamine.github.io/country-flag-icons/3x2/{item.country_code}.svg' alt="" /></div>
								<span class="locations-itemTitle">
									{item.name}
									{#if item.admin1}
										<span class="locations-itemTitle-smaller">({item.admin1})</span>
									{/if}
								</span>
							</a>
						</div>
					{/each}
				{:else}
					<div class="locations-item-outer">
						<div class="locations-item locations-item-info">
							<span class="locations-itemTitle">No results for "{locationSearchInput}"</span>
						</div>
					</div>
				{/if}
			{/if}
		{:else}
			{#if locationsHistory && locationsHistory.length}
				<div class="locations-item locations-itemHeader">Recent locations</div>
				{#each locationsHistory as item}
				<div class="locations-item-outer">
					<a href="/" class="locations-item" class:active={customLocation && customLocation.id == item.id} on:click|preventDefault={() => setCustomLocation(item)}>
						<div class="locations-itemFlag"><img src='https://purecatamphetamine.github.io/country-flag-icons/3x2/{item.country_code}.svg' alt="" /></div>
						<span class="locations-itemTitle">
							{item.name}
							{#if item.admin1}
								<span class="locations-itemTitle-smaller">({item.admin1})</span>
							{/if}
						</span>
					</a>
					<button on:click|preventDefault={() => removeHistoryItem(item)} class="locations-item-remove"><Icon name='trash' /></button>
				</div>
				{/each}
			{/if}
		{/if}
	</div>
</div>