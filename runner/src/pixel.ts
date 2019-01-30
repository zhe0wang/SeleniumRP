import { PNG } from 'pngjs';

async function getImgData(imgStr, dimensions?, currentWindowSizes?) {
	let base64Data = imgStr.replace(/^data:image\/png;base64,/, '');

	if (dimensions && dimensions.left >= 0 && dimensions.top >= 0 && dimensions.width && dimensions.height) {
		let buffer = Buffer.from(base64Data, 'base64');
		let png = PNG.sync.read(buffer);
		let ratio = png.width / currentWindowSizes.width;
		let regionPng = new PNG({ width: dimensions.width * ratio, height: dimensions.height * ratio });
		PNG.bitblt(png, regionPng, dimensions.left * ratio, dimensions.top * ratio, dimensions.width * ratio, dimensions.height * ratio, 0, 0);
		base64Data = PNG.sync.write(regionPng).toString('base64');
	}

	return base64Data;
}

function highlight(actions, data, color, currentWindowSizes) {
	let idx,
		dimensions = Object.assign({}, actions),
		isValid = dimensions && dimensions.left >= 0 && dimensions.top >= 0 && dimensions.width && dimensions.height;

	if (!isValid) {
		return data;
	}

	let buffer = Buffer.from(data, 'base64');
	let png = PNG.sync.read(buffer);
	let ratio = png.width / currentWindowSizes.width;
	dimensions.top *= ratio;
	dimensions.left *= ratio;
	dimensions.width *= ratio;
	dimensions.height *= ratio;
	
	let targetHeight = Math.min(dimensions.top + dimensions.height, png.height);
	let targetWidth = Math.min(dimensions.left + dimensions.width, png.width);
	for (let y = dimensions.top; y < targetHeight; y += 1) {
		for (let x = dimensions.left; x < targetWidth; x += 1) {
			if (y > dimensions.top && y < targetHeight - 1 && x > dimensions.left && x < targetWidth - 1) {
				continue;
			}

			idx = (png.width * y + x) << 2;
			png.data[idx] = color[0];
			png.data[idx + 1] = color[1];
			png.data[idx + 2] = color[2];
		}
	}

	return PNG.sync.write(png).toString('base64');
}

const Pixel = {
	getImgData: getImgData,
	highlight: highlight
};

export default Pixel;