<template>
	<view>
		<button @click="takePhoto">拍照上传</button>
		<canvas canvas-id="myCanvas" id="myCanvas" style="width: 100vw;height: 100vw"></canvas>
	</view>
</template>

<script>
import axios from "axios";
export default {
	methods: {
		takePhoto() {
			const _this = this;
			const ctx = uni.createCanvasContext('myCanvas')
			uni.chooseImage({
				success: function (res) {
					const tempFilePath = res.tempFilePaths[0];
					const tempImage = new Image();
					tempImage.src = tempFilePath;
					tempImage.onload = (e) => {
						// 获取图片宽高
						const { width: _width, height: _height } = e.target;
						const widthScale = _this.getWidthScale(_width)
						const heightScale = _this.getHeightScale(_height)
						// 决定宽高缩放比例
						const scale = widthScale <= heightScale ? widthScale : heightScale;
						const { width, height } = {
							width: _width * scale,
							height: _height * scale
						}
						ctx.drawImage(tempFilePath, 0, 0, width, height)
						const timestamp = Date.now().toString();
						// 绘制水印
						ctx.setFillStyle('blue');
						ctx.setFontSize(20);
						ctx.setTextAlign('center');
						ctx.fillText(timestamp, width / 2, height - 20);
						ctx.draw(false, () => {
							// 输出base64
							uni.canvasToTempFilePath({
								canvasId: 'myCanvas',
								width,
								height,
								destWidth: width/1.2,
								destHeight: height/1.2,
								success: (res) => {
									const tempFilePath = res.tempFilePath;
									// 上传 tempFilePath 到 OSS
									_this.uploadToOSS(tempFilePath, timestamp);
								},
								fail: (err) => {
									console.error('Canvas to temp file path failed:', err);
								}
							}, _this);
						})
					}
				}
			})
		},
		uploadToOSS(filePath, timestamp) {
			// 将 filePath 上传到 OSS
			axios.post('http://localhost:3000/upload', { data: filePath }).then(res => {
				window.open(res.data.url)
			})
		},
		getWidthScale(imgWidth) {
			const windowWidth = window.innerWidth
			return windowWidth / imgWidth
		},
		getHeightScale(imgHeight) {
			const windowHeight = window.innerHeight
			return windowHeight / imgHeight
		},
	}
};
</script>
