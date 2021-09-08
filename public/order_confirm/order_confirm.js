if(!Cookies.get('user')) window.location.replace('/login/login.html');

// 返回上一页
console.log(document.referrer === Cookies.get('address'));
var isReturn = document.referrer === window.location.href || document.referrer === Cookies.get('address');
console.log(isReturn);
var referrer = isReturn ? '/cart/cart.html' : document.referrer;
$('.header>img').on('click', function() {
	window.location.href = referrer;
});


// 订单内容
var reg = /\,/;
var buyId = reg.test($.query.get('pid')) ? $.query.get('pid').split(',') : [$.query.get('pid')];
console.log(buyId);
var allTotal = 0;
var orderNum = '';
$.ajax({
	type: 'post',
	url: '/cart/list_ids',
	headers: { Authorization: Cookies.get('token') },
	data: {
		ids: buyId,
	},
	success: function(res) {
		if(res.code !== 200) { console.log(res.msg); return; }
		var htmlStr = "";
		res.data.forEach(function(item) {
			htmlStr += `
				<div data-pid='${item.pid}' class="order-item">
					<img src=${item.avatar} alt="商品图片">
					<div class="order-item-detail">
						<h6>${item.name}</h6>
						<div>
							<span>￥${item.price}.00</span>
							<h6>x <span>${item.count}</span></h6>
						</div>
						<span>7天无理由退货</span>
					</div>
				</div>
			`;
			allTotal += parseInt(item.count) * parseInt(item.price);
		});
		$('span.order-price').text(allTotal);
		$('.order-item-wrapper').html(htmlStr);
	}
});
// 提交订单
$('.order-total>a').on('click', function() {
	$.ajax({
		type: 'post',
		url: '/order/confirm',
		headers: { Authorization: Cookies.get('token') },
		data: {
			ids: buyId,
			account: allTotal,
			addressId: parseInt($('.choice-address>div').attr('data-id')),
		},
		success: function(res) {
			if(res.code !== 200) { console.log(res.msg); return; }
			orderNum = res.data;
			window.location.href = `/pay/pay.html?orderNum=${orderNum}`;
		}
	});
});
// 地址管理
// 渲染所有地址
$.ajax({
	type: 'get',
	url: '/address/list',
	headers: { Authorization: Cookies.get('token') },
	success: function(res) {
		if(res.code !== 200) { console.log(res.msg); return; }
		var htmlStr = '';
		res.data.forEach(function(item) {
			htmlStr += `
				<div class="choice-address-item" data-id="${item.id}">
					<span class="checkbox"></span>
					<div>
						<span><span>${item.receiveName}<span class="default-address">默认</span></span><span>${item.receivePhone}</span></span>
						<p>${item.receiveRegion}${item.receiveDetail} </p>
					</div>
					<span class="edit-address"></span>
				</div>
			`;
		});
		$('.choice-address-content').html(htmlStr);
		$(`.choice-address-item[data-id=${defaultId}]`).find('span.default-address').addClass('default');
		$('.choice-address-item').on('click', function() {
			$('span.checkbox').removeClass('active');
			$(this).children('span.checkbox').addClass('active');
			// 渲染选中的地址
			var id = parseInt($(this).attr('data-id'));
			$.ajax({
				type: 'get',
				url: '/address/model/'+ id,
				headers: { Authorization: Cookies.get('token') },
				success: function(res) {
					if(res.code !== 200) { console.log(res.msg); return; }
					$('.choice-address').html(choiceAddress(res.data));
				},
			});
			$('.shop-popup').removeClass('show');
			$('.shop-popup-wrapper').removeClass('show');
		});
	},
});
// 获取默认地址 渲染在页面
function choiceAddress(address) {
	return `
		<div data-id="${address.id}">
			<h6><span>${address.receiveName}</span>&nbsp;&nbsp;<span>${address.receivePhone}</span></h6>
			<span>${address.receiveRegion + address.receiveDetail}</span>
		</div>
		<img src="/images/product/coupon_list_arrow.png" alt="">
	`;
}
var defaultId = 0;
$.ajax({
	type: 'get',
	url: '/address/get_default',
	headers: { Authorization: Cookies.get('token') },
	success: function(res) {
		if(res.code !== 200) { console.log(res.msg); return; }
		if(!res.data) return;
		
		defaultId = res.data.id;
		$('.choice-address').html(choiceAddress(res.data));
	},
});

// 点击出现弹框
$('.choice-address').on('click', function() {
	$('.shop-popup-wrapper').addClass('show');
	$('.shop-popup').addClass('show');
});
$('.shop-popup-wrapper').on('click', function() {
	$('.shop-popup').removeClass('show');
	$('.shop-popup-wrapper').removeClass('show');
});
$('.shop-popup>img').on('click', function() {
	$('.shop-popup').removeClass('show');
	$('.shop-popup-wrapper').removeClass('show');
});
// 用户没有收货地址 跳转
$('button.btn-yes').on('click', function() {
	window.location.href = '/address/address.html';
});