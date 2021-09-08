$('.return-prev').on('click', function() {
	var referrer = document.referrer === window.location.href ? '/list/list.html' : document.referrer;
	window.location.href = referrer;
});
$('.btn-nowlogin').on('click', function() {
	layer.confirm('欢迎您来到小米有品！我们依据最新法律法规要求，制定并更新了《隐私政策》《小米有品用户协议》《小米帐号使用协议》。您需阅读并同意相关政策条款方可进行登录。',{
		btn: ['同意','不同意']
	}, function() {
		window.location.href = "/login/login.html";
	})
});
// 动态渲染用户数据
if(Cookies.get('user') !== undefined) {
	$.ajax({
		type:'post',
		headers: { Authorization: Cookies.get('token') },
		url: "/cart/list/",
		data: {},
		success: function(res) {
			if(res.code !== 200) { console.log(res.msg); return; }
			// 如果用户没有购物记录 设置目前没有添加商品哦~ 按钮文字 改成去首页逛逛 跳转首页
			if(res.data.length === 0) {
				$('.cart-content').html(`
					<img src="/images/cart/no_result_cart2.png" >
					<span class="cart-content-tips">目前没有添加商品哦~</span>
					<button class="btn-gohome">去首页逛逛</button>
				`);
				$('.btn-gohome').on('click', function() {
					window.location.href = "/home/index.html";
				});
				return;
			}
			// 如果用户有购物记录
			$('.cart-content').html(`
				<div class="cart-content-login">
					<div class="border-1px cart-login-header">
						<div class="cart-login-left">
							<span class="checkbox all"></span>
							<span class="cart-login-text">有品精选</span>
						</div>
						<span class="cart-login-right">已免运费</span>
					</div>
				</div>
			`);
			var htmlStr ="";
			res.data.forEach(function(item) {
				htmlStr += `
					<a href="/product/product.html?id=${item.pid}" data-id="${item.id}" class="cart-login-item">
						<span class="checkbox"></span>
						<img src="${item.avatar}" >
						<span class="cart-login-item-detail">
							<span class="item-detail-title">
								<span class="low-price">特价</span>
								${item.name}
							</span>
							<span class="item-detail-model">商品型号</span>
							<span class="item-detail-price">&yen;${item.price}</span>
						</span>
						<span class="count-change">
							<button class="btn-decrease" type="button" ${item.count === 1 ? 'disabled' : ''}">-</button>
							<span class="item-detail-count">${item.count}</span>
							<button class="btn-increase" type="button" ${item.count >= 10 ? 'disabled' : ''}">+</button>
						</span>
					</a>
				`;
			});
			$('.cart-content-login').append(htmlStr);
			$('.cart-content-login').append(`
				<div class="cart-login-total">
					<div class="cart-login-checkbox">
						<span class="checkbox all"></span>
						<span class="cart-login-text">全选</span>
					</div>
					<div class="cart-login-total-right">
						<span class='cart-login-total-right-total-wrapper'>合计：<span>￥<span class="cart-login-total-right-total">0</span>.00</span></span>
						<button type="button" class="btn-checkout">结算<span class="count-wrapper">(<span class="cart-login-total-right-count"></span>)</span></button>
					</div>
				</div>
			`);
			$('.cart-header-edit').css({'visibility':'visible'});
		},
	});
}
// 购物车操作
$('.cart-content')
	// 加按钮
	.on('click', '.btn-increase', function(e) {
		// 修改数据
		var id = $(this).closest('.cart-login-item').attr('data-id');
		$.ajax({
			type: 'post',
			headers: { Authorization: Cookies.get('token') },
			url: '/cart/increase/' + id,
		});
		// dom
		var count = parseInt($(this).prev().text());
		count = count + 1;
		$(this).attr('disabled', count === 10)
			.prev().text(count)
			.prev().attr('disabled', false);
		totalCount();
		return false;
	})
	// 减按钮
	.on('click', '.btn-decrease', function() {
		var id = $(this).closest('.cart-login-item').attr('data-id');
		$.ajax({
			type: 'post',
			headers: { Authorization: Cookies.get('token') },
			url: '/cart/decrease/' + id,
		});
		// dom
		var count = parseInt($(this).next().text());
		count = count - 1;
		$(this).attr('disabled', count === 1)
			.next().text(count)
			.next().attr('disabled', false);
		totalCount();
		return false;
	})
	// 复选框
	.on('click', '.checkbox:not(.all)', function() {
		$(this).toggleClass('active');
		var isChecked = $('.checkbox:not(.all)').filter(':not(".active")').length === 0 ? true : false ;
		$('.checkbox.all').toggleClass('active', isChecked);
		totalCount();
		$checkedTarget = $('.checkbox.active');
		return false;
	})
	// 全选
	.on('click', '.checkbox.all', function() {
		$('.checkbox.all').toggleClass('active');
		$('.checkbox:not(.all)').toggleClass('active', $(this).hasClass('active'));
		totalCount();
		$checkedTarget = $('.checkbox.active');
		return false;
	});
// 价格计算
function totalCount() {
	setTimeout(function() {
		$.ajax({
			type: "post",
			url: "/cart/list/",
			headers: { Authorization: Cookies.get('token') },
			success: function(res) {
				if(res.code !== 200) { console.log(res.msg);return; }
				var target = null,total = 0, goodsCount = 0;
				$('.cart-login-item .checkbox.active').each(function(i,item) {
					target = res.data.find(function(item2) { return item2.id === parseInt($(item).parents('.cart-login-item').attr('data-id')); } )
					total += target.price * target.count;
					goodsCount += target.count;
				});
				if(goodsCount === 0) $('.count-wrapper').removeClass('active');
				else $('.count-wrapper').addClass('active');
				$('.cart-login-total-right-count').text(goodsCount);
				$('span.cart-login-total-right-total').text(total);
			},
			
		});
	},50);
}
// 删除
var indexEdit = 0;
var $checkedTarget = "";
$('span.cart-header-edit').on('click',function() {
	// 编辑变成 完成 
	indexEdit = (indexEdit + 1) % 2;
	var isEdit = indexEdit===0 ? "编辑" : '完成';
	$(this).text(isEdit);
	// 计算变成删除 
	var isDelete = indexEdit === 0 ? '结算<span class="count-wrapper">(<span class="cart-login-total-right-count"></span>)</span>' : '删除';
	$('.btn-checkout').html(isDelete);
	// 全选激活清空 免运费消失 合计消失
	if(indexEdit === 0) {
		if($checkedTarget.length !== 0) $checkedTarget.addClass('active');
		$('.cart-login-total-right-total-wrapper').removeClass('remove');
		$('.cart-login-right').removeClass('remove');
	}else {
		$('.checkbox').removeClass('active');
		$('.cart-login-total-right-total-wrapper').addClass('remove');
		$('.cart-login-right').addClass('remove');
		// 选中删除 转了一下 layer
		$('.btn-checkout').on('click', function() {
			// 删除数据
			var id = [];
			$('.checkbox.active:not(.all)').each(function(i, item) {
				id.push($(item).parents('.cart-login-item').attr('data-id')) ;
			});
			$.ajax({
				type: "post",
				url: '/cart/remove',
				headers: { Authorization: Cookies.get('token') },
				data: {
					ids: id,
				},
				success: function(res) {
					console.log(res.data);
				},
			});
			// 删除dom
			layer.load(1, {
				shade: [0.1, '#fff'],
				time: 200
			});
			$('.cart-login-item .checkbox.active').parents('.cart-login-item').remove();
			if($('.checkbox:not(.all)').length === 0) {
				console.log(1);
				$('.cart-content').html(`
					<img src="/images/cart/no_result_cart2.png" >
					<span class="cart-content-tips">目前没有添加商品哦~</span>
					<button class="btn-gohome">去首页逛逛</button>
				`);
				$('.btn-gohome').on('click', function() {
					window.location.href = "/home/index.html";
				});
				return;
			}
		});
	}
	totalCount();
});
// 结算
$('.cart-content').on('click', '.btn-checkout', function() {
	var buyId = [];
	$('.checkbox.active:not(.all)').parents('.cart-login-item').each(function(i,item) {
		buyId.push($(item).attr('data-id'));
	});
	if(!$('span.cart-login-total-right-count').text()) return;
	window.location.href = `/order_confirm/order_confirm.html?pid=${buyId}`;
});