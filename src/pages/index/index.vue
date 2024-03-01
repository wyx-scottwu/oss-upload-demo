<template>
	<view>
		<button @click="takePhoto">拍照上传</button>
		<canvas canvas-id="myCanvas" id="myCanvas" style="width: 100vw;height: 100vw"></canvas>
		<img :src="url" style="width: 100vw"/>
	</view>
</template>

<script>
import axios from "axios";
import dayjs from "dayjs";
export default {
	data() {
		return {
			url: '',
		}
	},
	methods: {
		async	takePhoto() {
			const _this = this;
			const ctx = uni.createCanvasContext('myCanvas')
			const files = await new Promise((resolve, reject) => {
				uni.chooseImage({success: resolve, fail: reject})
			})
			const tempFilePath = files.tempFilePaths[0];
			const imageInfo = await new Promise((resolve, reject) => {
				uni.getImageInfo({ src: tempFilePath, success: resolve, fail: reject })
			})
			const { width: _width, height: _height } = imageInfo;
			
			const widthScale = _this.getWidthScale(_width)
			const heightScale = _this.getHeightScale(_height)
			// 决定宽高缩放比例
			const scale = widthScale <= heightScale ? widthScale : heightScale;
			const { width, height } = {
				width: _width * scale,
				height: _height * scale
			}
			ctx.drawImage(tempFilePath, 0, 0, width, height)
			const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
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
					// destWidth: width/1.2,
					// destHeight: height/1.2,
					quality: 0.7,
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
		},
		uploadToOSS(filePath, timestamp) {
			// 将 filePath 上传到 OSS
			axios.post('http://localhost:3000/upload', { data: filePath }).then(res => {
				// window.open(res.data.url)
				console.log("𝔀𝔂𝔁.𝓼𝓬𝓸𝓽𝓽𝔀𝓾 ~ axios.post ~ res.data.url:", res.data.url)
				// this.url = res.data.url + `?x-oss-process=image/resize,w_${window.innerWidth*2}`;
				this.url = res.data.url;
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
