(() => {
	async function sha256(message) {
		const msgBuffer = new TextEncoder('utf-8').encode(message);
		const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
		return hashHex;
	}
	
	function showError(){
		let string = `
			<style>.image-scramble-warning { opacity: 1; transition: opacity .2s } .image-scramble-fadeout { opacity: 0; }</style>
			<div class="image-scramble-warning" style="position:fixed;bottom:10px;right:10px;width:350px;border:1px solid rgba(230, 40, 40, 0.2);background-color:rgba(230, 40, 40, 0.1);backdrop-filter:blur(2px);padding:10px;border-radius:5px;z-index:9999999999;color:white;font:17px Monaco, monospace;text-shadow:0px 0px 4px rgba(0, 0, 0, 0.5);text-align:center">Unable to download image. Most likely caused by cross origin being disallowed. Try navigating directly to the image and try again.</div>
		`;
		document.body.insertAdjacentHTML("afterbegin", string);
	}
	
	const url = scrambleURL;
	let promises = [];
	
	var image = new Image();
	promises.push(new Promise((resolve, reject) => {
		image.onload = () => {
			console.log("Image loaded.");
			
			resolve(image);
		}
	}));
	image.crossOrigin = "anonymous";
	image.src = url;

	var arraybufferxhr = new XMLHttpRequest();
	arraybufferxhr.open("GET", url, true);
	arraybufferxhr.responseType = "arraybuffer";
	promises.push(new Promise((resolve, reject) => {
		arraybufferxhr.onload = (buffer) => {
			const words = new Uint32Array(buffer);
			let hex = "";
			for (let i = 0;i < words.length;i++){
				hex += words.get(i).toString(16);
			}
			
			resolve(hex);
		};
	})
	.then(result => sha256(result)));
	if (arraybufferxhr.send()){
			
	} else { 
		showError();
		setTimeout(() => { document.querySelector(".image-scramble-warning").classList.add("image-scramble-fadeout") }, 1300);
		setTimeout(() => { document.querySelector(".image-scramble-warning").remove() }, 1600);
	}
	
	var blobxhr = new XMLHttpRequest();
	blobxhr.open("GET", url, true);
	blobxhr.responseType = "blob";
	promises.push(new Promise((resolve, reject) => {
		blobxhr.onload = () => {
			resolve(blobxhr.response);
		};
	}));
	if (blobxhr.send()){
		
	}else{ 
		showError();
		setTimeout(() => { document.querySelector(".image-scramble-warning").classList.add("image-scramble-fadeout") }, 1300);
		setTimeout(() => { document.querySelector(".image-scramble-warning").remove() }, 1600);
	}
	
	Promise.all(promises)
	.then((results) => {
		let canvas = document.createElement("canvas");
		let context = canvas.getContext("2d");
		
		context.canvas.width = results[0].width;
		context.canvas.height = results[0].height;
		
		context.drawImage(results[0], 0, 0);
		
		console.log("initial sha256: " + results[1]);
		
		let randomise = (pixel) => {
			if (pixel > 0 && pixel < 255){
				return (Math.random() < 0.5 ? pixel - 1 : pixel + 1);
			}else if (pixel > 0){
				return pixel - 1;
			}else if (pixel < 255){
				return pixel + 1;
			}else{
				return pixel;
			}
		}
		
		let imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
		for (let i = 0; i < imageData.data.length; i += 4){
			const pick = Math.random();
			if (pick <= 0.1){
				imageData.data[i] = randomise(imageData.data[i]);
			}else if (pick <= 0.2){
				imageData.data[i + 1] = randomise(imageData.data[i + 1]);
			}else if (pick <= 0.3){
				imageData.data[i + 2] = randomise(imageData.data[i + 2]);
			}
		}
		context.putImageData(imageData, 0, 0);
		
		imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
		const words = new Uint32Array(imageData.data.buffer);
		let hex = "";
		for (let i = 0;i < words.length;i++){
			hex += words[i].toString(16);
		}
		
		sha256(hex).then((result) => console.log("final sha256: " + result));
		
		new Promise((resolve, reject) => {
			var fileReader = new FileReader();
			fileReader.onloadend = function(e) {
			  var arr = (new Uint8Array(e.target.result)).subarray(0, 4);
			  var header = "";
			  for(var i = 0; i < arr.length; i++) {
				 header += arr[i].toString(16);
			  }
			  
			  let type = "UNKNOWN";
			  switch (header) {
				  case "89504e47":
					  type = "image/png";
					  break;
				  case "47494638":
					  type = "image/gif";
					  break;
				  case "ffd8ffe0":
				  case "ffd8ffe1":
				  case "ffd8ffe2":
				  case "ffd8ffe3":
				  case "ffd8ffe8":
					  type = "image/jpeg";
					  break;
				  default:
					  type = results[2].type; 
					  break;
			  }
			  
			  resolve(type);
			};
			
			fileReader.readAsArrayBuffer(results[2]);
		})
		.then((mimeType) => {
			const dataURL = canvas.toDataURL(mimeType);
			
			const download = document.createElement("a");
			download.href = dataURL;
			download.download = (image.src?.split('/')[image.src?.split('/')?.length - 1].split('.').length > 1 ? image.src?.split('/')?.[image.src?.split('/')?.length - 1] : null) ?? `image.${mimeType.split('/')[1]}`;
			document.body.appendChild(download);
			download.click();
			document.body.removeChild(download);
		});
	});
})();