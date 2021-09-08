var orderNum = $.query.get('orderNum');
// 渲染金额在页面上
$.ajax({
	type: 'get',
	url: '/order/account/' + orderNum,
	headers: { Authorization: Cookies.get('token') },
	success: function(res) {
		if(res.code !== 200) { console.log(res.msg); return; }
		$('span.pay-price').text(res.data);
	}
});
$('.header>img').on('click', function() {
	window.location.replace('/order/order.html');
});
// 支付方式
$('ul.pay-model>li').on('click', function() {
	$('span.checkbox').removeClass('active');
	$(this).find('span.checkbox').addClass('active');
});
// 支付
$('.confirm-pay>a').on('click', function() {
	$.ajax({
		url: '/order/pay/' + orderNum,
		type: 'get',
		headers: { Authorization: Cookies.get('token') },
		success: function(res) {
			if(res.code !== 200) { console.log(res.msg); return; }
		}
	});
	layer.msg('支付成功');
	setTimeout(function() {
		window.location.replace('/order/order.html');
	},1000);
});
// 倒计时
setInterval(countTime,1000);
var time = 7200000 + new Date().getTime();
function countTime(){
	var diff = time - new Date().getTime();
	var diff = diff/1000;
	second = Math.floor(diff%60);
	$('span.pay-second').text(second);
	minute = Math.floor(diff/60%60);
	$('span.pay-minute').text(minute);
	hour = Math.floor(diff / 3600);
	$('span.pay-hour').text(hour);
}
