(function() {
	var id = parseInt($.query.get('id')) || 1;
	$.ajax({
		type: "get",
		url: '/product/model/' + id,
		success: function(res) {
			// banner条
			var arr = res.data.bannerImgs ? res.data.bannerImgs.split(',') : [];
			var htmlStr = "";
			arr.forEach(function(item) {
				htmlStr += `
					<img class="swiper-slide" src="${item}" />
				`;
			});
			$('.swiper-wrapper').html(htmlStr);
			new Swiper('.banner', {
				loop: true,
				// autoplay: {},
				freeMode: false,
				pagination: {
					el: '.banner>.swiper-pagination',
					type: 'fraction',
				},
			});
			// 价格
			$('.product-price').text(res.data.price);
			// 商品详情
			$('.product-title>h6').text(res.data.name);
			$('.choice-color>div').text(res.data.name);
			$('.produce-detail>p').text(res.data.brief);
			$('.user-rate').text(res.data.rate);
			// 用户地址
			// $('.choice-address>div>p').text()
			// 商品详情
			var otherImg = res.data.otherImgs ? res.data.otherImgs.split(',') : [];
			otherImg.forEach(function(item) {
				htmlStr += `
					<img class="swiper-slide" src="${item}" />
				`;
			});
			$('.product-detail').html(htmlStr);
		},
	});
	// 购物车数量检测
	if(Cookies.get('user')) $('.product-count').addClass('show');
	$.ajax({
		type: 'get',
		url: '/cart/total',
		headers: { Authorization: Cookies.get('token') },
		success: function(res) {
			if(res.code !== 200) { console.log(res.msg); return; }
			$('.product-count').text(res.data);
		},
	});
	// 购物车弹框
	$('span.add-shopcart').on('click', function() {
		$('.shop-popup-wrapper').addClass('show');
		$('.shop-popup').addClass('show');
	});
	$('.shop-popup-wrapper').on('click', function() {
		$('.shop-popup').removeClass('show');
		$('.shop-popup-wrapper').removeClass('show');
	});
	$('.shop-popup')
		// 关闭弹框
		.on('click', '.shop-popup>img', function() {
			$('.shop-popup').removeClass('show');
			$('.shop-popup-wrapper').removeClass('show');
		})
		// 数量加减变化
		.on('click', 'span.btn-decrease', function() {
			var count = parseInt($('span.shop-popup-count').text());
			if( count === 1) {
				$(this).addClass('disable');
				return;
			} 
			count -= 1;
			$(this).next().text(count).next().removeClass('disable');
			console.log(count);
			// if( count === 1) $(this).addClass('disable');
		})
		.on('click', 'span.btn-increase', function() {
			var count = parseInt($('span.shop-popup-count').text());
			if( count === 5) {
				$(this).addClass('disable');
				return;
			} 
			count += 1;
			$(this).prev().text(count).prev().removeClass('disable');
			console.log(count);
			if( count === 5) $(this).addClass('disable');
		})
		// 向购物车中加入商品
		.on('click', 'button.btn-yes', function() {
			if(!Cookies.get('user')) {
				window.location.replace('/login/login.html');
			}
			var count = parseInt($('span.shop-popup-count').text());
			$.ajax({
				type: 'post',
				url: '/cart/add',
				headers: { Authorization: Cookies.get('token') },
				data: {
					pid: id,
					count: count,
				},
			});
			$('.shop-popup').removeClass('show');
			$('.shop-popup-wrapper').removeClass('show');
			layer.msg('添加购物车成功');
			// 检测 现在的购物车 数量
			setTimeout(function() {
				$.ajax({
					type: 'get',
					url: '/cart/total',
					headers: { Authorization: Cookies.get('token') },
					success: function(res) {
						if(res.code !== 200) { console.log(res.msg); return; }
						console.log(res.data);
						$('.product-count').text(res.data);
					},
				});
			},300);
		});
	// 倒计时
	var countTime = new Date(2022,05,11,0,0,0);
	setInterval(function() {
		var time = countTime.getTime() -  new Date().getTime();
		time = time / 1000;
		var second = Math.floor(time % 60);
		$('span.seckill-second').text(second);
		var minute = Math.floor(time/60%60);
		$('span.seckill-minute').text(minute);
		var hour = Math.ceil(time % 3600);
		$('span.seckill-hour').text(hour);
	},1000);
	// 立即购买
	$('span.buy-now').on('click', function() {
		var orderId = 0;
		$.ajax({
			type:'post',
			url: '/cart/add',
			headers: { Authorization: Cookies.get('token') },
			data: {
				pid: id,
				count: 1,
			},
			success: function(res) {
				if( res.data !== 200 ) { console.log(res.msg); return; }
			},
		});
		setTimeout(function() {
			$.ajax({
				type: 'post',
				url: '/cart/list',
				headers: { Authorization: Cookies.get('token') },
				success: function(res) {
					console.log(res.data);
					res.data.forEach(function(item) {
						if(item.pid === id) {
							orderId = item.id;
							window.location.href = `/order_confirm/order_confirm.html?pid=${orderId}`;
						}
					});
				}
			});
		},500);
	});
	// 返回顶部
	var scroll = null;
	imagesLoaded($('.content')[0], function() {
		if(scroll === null) {
			scroll = new IScroll($('.content')[0], {
					bounce: false,
					probeType: 2,
					deceleration: 0.003,
					click: true,
			});
			// scroll.on('scroll', function() {
				$('.return-top').on('click', function() {
					// console.log(scroll.x);
					// console.log(3);
					scroll.scrollTo(0,10,1000);
				});
			// });
			
		}else {
			scroll.refresh();
		}
	});
	
})();

