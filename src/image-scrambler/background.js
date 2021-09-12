chrome.contextMenus.create({
	id: "scramble-image",
	title: "Save scrambled image as...",
	contexts: [
		"image"
	]
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
	chrome.scripting.executeScript({
		target: {
			tabId: tab.id
		},
		args: [info.srcUrl],
		func: (url) => {
			scrambleURL = url;
		}
	}, () => {
		chrome.scripting.executeScript({
			target: {
				tabId: tab.id
			},
			files: ["inject.js"]
		});
	});
});