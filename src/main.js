import './app.css'
import App from './App.svelte'

let docEl = document.documentElement
if (localStorage.getItem('theme')) docEl.classList.add(`theme-${localStorage.getItem('theme')}`)
else docEl.classList.add( window.matchMedia('(prefers-color-scheme: dark)').matches ? 'theme-dark' : 'theme-light' )

if (localStorage.getItem('hue')) docEl.style.setProperty('--h', localStorage.getItem('hue'))

const app = new App({
  target: document.getElementById('app'),
})

export default app

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/service-worker.js')
	.then(function(reg){
		console.log("service worker ok");
	}).catch(function(err) {
		console.log("service worker error", err)
	});
};