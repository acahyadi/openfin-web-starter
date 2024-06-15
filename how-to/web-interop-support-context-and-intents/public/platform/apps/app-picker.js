import { createOptionEntry, setElementVisibility } from '../util/helper.js';

let launchBtn;
let cancelSelectionBtn;
let appsContainer;
let appSelectionContainer;
let appSummaryContainer;

let apps;
let appLookup = {};
let appService;

document.addEventListener('DOMContentLoaded', () => {
	if (window.fdc3 !== undefined) {
		init();
	} else {
		window.addEventListener('fdc3Ready', init);
	}
});

/**
 * Initialize the DOM.
 */
async function init() {
	cancelSelectionBtn = document.querySelector('#cancel');

	appSelectionContainer = document.querySelector('#app-container');
	appsContainer = document.querySelector('#applications');
	appsContainer.addEventListener('change', async (appList) => {
		const appId = appList.target.value;
		await onAppSelection(appId);
	});

	appSummaryContainer = document.querySelector('#summary');
	setElementVisibility(appSummaryContainer, false);
	launchBtn = document.querySelector('#launch');
	cancelSelectionBtn.addEventListener('click', async () => {
	});

	launchBtn.addEventListener('click', async () => {
		const appId = appsContainer.value;
		if(appId !== undefined && appId !== null && appId !== '') {
			window.fdc3.open({ appId });
		}
	});

	const appServiceId = 'app-service';
	console.log('App service initialized', appServiceId);
	// appService = await window.fin.InterApplicationBus.Channel.connect(appServiceId);
	console.log('Requesting apps...');
	//await appService.dispatch('get-apps', async (data) => {
		// reset everything
		apps = undefined;
		appLookup = {};
		if (data.customData !== undefined) {
			apps = data.customData.apps;
		}

		if (Array.isArray(apps)) {
			for (const app of apps) {
				appLookup[app.appId] = app;
			}
			await setupAppView(apps, intent.name);
		}
	//});
	console.log('App picker initialized');
}

/**
 * Setup the app view.
 * @param applications The application to use.
 */
async function setupAppView(applications) {
	setElementVisibility(appInstanceSelectionContainer, false);
	setElementVisibility(appSummaryContainer, false);
	appsContainer.options.length = 0;
	if (Array.isArray(applications) && applications.length > 0) {
		for (let i = 0; i < applications.length; i++) {
				const appEntry = createOptionEntry(applications[i].title, applications[i].appId, i === 0);
				appsContainer.append(appEntry);
		}
		setElementVisibility(appSelectionContainer, true);
		await onAppSelection(applications[0].appId);
	} else {
		setElementVisibility(appSelectionContainer, false);
	}
}

/**
 * Handle the app selection changing.
 * @param appId The app id.
 */
async function onAppSelection(appId) {
	setupAppMetadata(appId);
}

/**
 * Load an app preview.
 * @param appId The app to load the preview for.
 */
function loadAppPreview(appId) {
	const appPreviewImage = document.querySelector('#preview');
	setElementVisibility(appPreviewImage, false);
	const appMetadata = appLookup[appId];
	if (Array.isArray(appMetadata?.images) && appMetadata.images.length > 0) {
		appPreviewImage.src = appMetadata.images[0].src;
		setElementVisibility(appPreviewImage, true);
	} else if (Array.isArray(appMetadata?.screenshots) && appMetadata.screenshots.length > 0) {
		appPreviewImage.src = appMetadata.screenshots[0].src;
		setElementVisibility(appPreviewImage, true);
	}
}

/**
 * Setup app metadata.
 * @param appId The app to setup the metadata for.
 */
function setupAppMetadata(appId) {
	const appMetadata = appLookup[appId];
	if (appMetadata !== undefined) {
		const appImage = document.querySelector('#logo');
		if (Array.isArray(appMetadata.icons) && appMetadata.icons.length > 0) {
			appImage.src = appMetadata.icons[0].src;
			setElementVisibility(appImage, true);
		} else {
			setElementVisibility(appImage, false);
		}

		const appDescription = document.querySelector('#description');
		if (appMetadata.description !== undefined && appMetadata.description.length > 0) {
			appDescription.textContent = appMetadata.description;
			setElementVisibility(appDescription, true);
		} else {
			setElementVisibility(appDescription, false);
		}
		loadAppPreview(appId);
		setElementVisibility(appSummaryContainer, true);
	} else {
		setElementVisibility(appSummaryContainer, false);
	}
}
