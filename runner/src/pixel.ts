import PNG from 'pngjs';

async function getImgData(imgStr, dimensions?) {
    let base64Data = imgStr.replace(/^data:image\/png;base64,/, ''),
        png,
        regionPng;

    if (dimensions && dimensions.left >= 0 && dimensions.top >= 0 && dimensions.width && dimensions.height) {
        png = PNG.sync.read(new Buffer(base64Data, 'base64'));
        regionPng = new PNG({ width: dimensions.width, height: dimensions.height });
        PNG.bitblt(png, regionPng, dimensions.left, dimensions.top, dimensions.width, dimensions.height, 0, 0);
        base64Data = PNG.sync.write(regionPng).toString('base64');
    }

    return base64Data;
}

function highlight(dimensions, data, color) {
	let png,
		targetHeight,
		targetWidth,
		idx,
		isValid = dimensions && dimensions.left >= 0  && dimensions.top >= 0 && dimensions.width && dimensions.height;
	
	if (!isValid) {
		return data;
	}

	png = PNG.sync.read(new Buffer(data, 'base64'));
	targetHeight = Math.min(dimensions.top + dimensions.height, png.height);
	targetWidth = Math.min(dimensions.left +  dimensions.width, png.width);
	for (let y = dimensions.top; y < targetHeight; y += 1) {
		for (let x = dimensions.left; x < targetWidth; x += 1) {
			if (y > dimensions.top && y < targetHeight - 1 && x > dimensions.left && x < targetWidth - 1) {
				continue;
			}

			idx = (png.width * y + x) << 2;
			png.data[idx] = color[0];
			png.data[idx+1] = color[1];
			png.data[idx+2] = color[2];
		}
	}

	return PNG.sync.write(png).toString('base64');
}

const Pixel = {
    getImgData: getImgData,
    highlight: highlight
};

export default Pixel;