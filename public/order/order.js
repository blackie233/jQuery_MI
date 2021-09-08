$('.header>img').on('click', function() {
	window.location.href = '/profile/profile.html';
});
// 渲染订单
function orderStr(address) {
	var orderStr = '';
	var orderItemStr = "";
	var allCount = 0;
	
	address.forEach(function(item) {
		orderItemStr = '';
		allCount = 0;
		item.details.forEach(function(items) {
			orderItemStr += `
				<div>
					<img src=${items.avatar} alt="">
					<div class="order-detail">
						<span>${items.name}</span>
						<p>规格</p>
					</div>
					<div class="order-price">
						<span>${items.price}</span>
						<span>X${items.count}</span>
					</div>
				</div>
			`;
			allCount += parseInt(items.count);
		});
		orderStr += `
			<div pay=${item.pay} time='${item.orderTime}' class="order" data-id='${item.orderId}'>
				<div class="order-content-header">
					<div class="order-content-header-left">
						<img src="/images/order_confirm/logo_ypjingxuan.png" >
						<h6>小米自营</h6>
					</div>
					<span>${item.pay ? '已支付' : '待支付'}</span>
				</div>
				<div class="order-content">
					${orderItemStr}
				</div>
				<p>共${allCount}件商品 总金额￥${item.account}.00</p>
				<div class="order-operation">
					<span class="remove-order ${item.pay ? '' : 'hidden'}">删除订单</span>
					<p class="count-time ${item.pay ? '' : 'nopay'}">
						请在
						<span class="pay-hour"></span>:
						<span class="pay-minute"></span>:
						<span class="pay-second"></span>
						内支付
					</p>
					<button type="button">${item.pay ? '再次购买' : '立即支付'}</button>
				</div>
			</div>
		`;
	});
	return orderStr;
}
$.ajax({
	type: 'get',
	url: '/order/list_all',
	headers: { Authorization: Cookies.get('token') },
	success: function(res) {
		if(res.code !== 200) { console.log(res.msg); return; }
		$('.order-wrapper').html(orderStr(res.data));
		timeOver();
	}
});
// 倒计时
function timeOver() {
	var reg = /(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2}):(\d{2})./;
	$('.order[pay = 0]').each(function(i,item) {
		var time = $(item).attr('time');
		var year = reg.exec(time)[1], month = reg.exec(time)[2], date = reg.exec(time)[3]
			hour = reg.exec(time)[4],minute = reg.exec(time)[5], second = reg.exec(time)[6];
		var oldTime = new Date(year,month-1,date,hour,minute,second);
		var diff = 0;
		var timer = setInterval(function() {
			diff = oldTime.getTime()+ 7200000 - new Date().getTime();
			diff = diff/1000;
			if(diff< 0) {
				clearInterval(timer);
				timr = null; 
				$(item).find('p.count-time').removeClass('nopay');
				$(item).find('span.remove-order').removeClass('hidden');
				$(item).find('button').text('重新购买');
				$(item).find('.order-content-header>span').text('已取消');
				return; 
			}
			second = Math.floor(diff % 60);
			$(item).find('span.pay-second').text(second);
			minute = Math.floor(diff /60 % 60);
			$(item).find('span.pay-minute').text(minute);
			hour = Math.floor(diff / 3600);
			$(item).find('span.pay-hour').text(hour);
		},1000);
	});
}
// 删除订单
setTimeout(function() {
	$('.order-operation').on('click', 'span', function() {
		var id = $(this).closest('.order').attr('data-id');
		var that = this;
		layer.confirm('是否要删除订单？', function(index) {
			$.ajax({
				type: 'get',
				url: '/order/remove/' + id,
				headers: { Authorization: Cookies.get('token') },
				succuess: function(res) {
					if(res.code !== 200) { console.log(res.msg); return; }
				}
			});
			$(that).closest('.order').remove();
			layer.close(index);
		});
	});
},500);
// 立即支付
setTimeout(function() {
	$('.order-operation>button').on('click', function() {
		var orderId = $(this).closest('.order').attr('data-id');
		window.location.href = `/pay/pay.html?orderNum=${orderId}`;
	});
},1000);
// 选项卡切换
$('ul.order-category>li').on('click', function() {
	if($(this).hasClass('active')) return;
	$(this).addClass('active').siblings().removeClass('active');
	$.ajax({
		type: 'get',
		url: '/order/list_all',
		headers: { Authorization: Cookies.get('token') },
		success: function(res) {
			if(res.code !== 200) { console.log(res.msg); return; }
			if($('li.tq').hasClass('active')) {
				$('.order-wrapper').html(`
					<div class="no-order">
						<img src="/images/order/no_result_order.png" >
						<p>目前没有退款订单哦~</p>
					</div>
				`);
				timeOver();
			}else if($('li.done').hasClass('active')) {
				$('.order-wrapper').html(`
					<div class="no-order">
						<img src="/images/order/no_result_order.png" >
						<p>目前没有已收货订单哦~</p>
					</div>
				`);
				timeOver();
			}else if($('li.all-order').hasClass('active')) {
				$('.order-wrapper').html(orderStr(res.data));
				timeOver();
			}else if($('li.wait-pay').hasClass('active')) {
				var PayTarget = res.data.filter(function(item) {
					return item.pay === 0;
				});
				$('.order-wrapper').html(orderStr(PayTarget));
				timeOver();
			}else if($('li.done-pay').hasClass('active')) {
				var PayTarget = res.data.filter(function(item) {
					return item.pay === 1;
				});
				$('.order-wrapper').html(orderStr(PayTarget));
				timeOver();
			}
		},
	});
});