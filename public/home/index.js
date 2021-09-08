new Swiper('.banner', {
	loop: true,			// 无缝
	autoplay: {			//自动播放
		delay: 2000,
		disableOnInteraction: false,
	},
	freeMode: false,
	pagination: {
		el: '.banner>.swiper-pagination',
		type: 'bullets',
		// renderCustom: function(swiper, current,total) {
		// 	const html = `
		// 		<div class="swiper-dots">
		// 			<span class="swiper-dot${current === 1 && 'active'} "></span>
		// 			<span class="swiper-dot${current === 2 && 'active'} "></span>
		// 			<span class="swiper-dot${current === 3 && 'active'} "></span>
		// 			<span class="swiper-dot${current === 4 && 'active'} "></span>
		// 		</div>
		// 	`;
		// 	return html;
		// }
	},
});
(function() {
	// 计时器
	var timer = setInterval(countTime,1000);
	var nextTime = new Date(2022,06,01,0,0,0);
	function countTime() {
		var diff = nextTime.getTime() - new Date().getTime();
		diff = diff / 1000;
		var second = Math.floor(diff % 60);
		$('span.timer-second').text(second);
		var minute = Math.floor(diff / 60 % 60);
		$('span.timer-minute').text(minute);
		var hour = Math.ceil(diff / 3600);
		$('span.timer-hour').text(hour);
	}
	
})();