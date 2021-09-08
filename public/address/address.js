if(!Cookies.get('user')) {
	window.location.replace('/login/login.html');
}
Cookies.set('address', window.location.href);
// 判断地址来源 返回上一页不然返回个人中心
$('.header>img').on('click', function() {
	var referrer = document.referrer === window.location.href ? '/profile/profile.html' : document.referrer;
	window.location.href = referrer;
});
// 渲染原来有的地址
$.ajax({
	url: '/address/list',
	headers: { Authorization: Cookies.get('token') },
	success: function(res) {
		if(res.code !== 200) { console.log(res.msg); return; }
		
		$('.content').append(modeAddress(res.data));
	},
});
// 地址模板
function modeAddress(address) {
	var htmlStr = '';
	address.forEach(function(item) {
		htmlStr += `
			<div class="border-1px address-item" data-id=${item.id}>
				<div>
					<span class="receive-nameandphone">
						<span class="receive-name">${item.receiveName}</span>
						<span class="receive-phone">${item.receivePhone}</span>
					</span>
					<p><i class='border-1px ${item.isDefault === 1? "default" : ""}'>默认</i><span>${item.receiveRegion}${item.receiveDetail}</span></p>
				</div>
				<span></span>
			</div>
		`;
	});
	return htmlStr;
}
// 地址增删改查
// 设为默认
$('.set-detail').on('click', function() {
	var id = $('input.id').val();
	if($(`.address-item[data-id=${id}] i`).hasClass('default')) return;
	$(this).toggleClass('default');
});
// 编辑
$('.content').on('click', '.address-item', function() {
	var id = $(this).attr('data-id');
	$('input.id').val(id);
	$('.del-add').removeClass('hidden');
	if($(`.address-item[data-id=${id}] i`).hasClass('default')) {
		$('.set-detail').addClass('default');
	}else {
		$('.set-detail').removeClass('default');
	}
	$.ajax({
		url: '/address/model/' + id,
		type: 'get',
		headers: { Authorization: Cookies.get('token') },
		success: function(res) {
			if(res.code !== 200) { console.log(res.msg); return; };
			$('input.receive-name').val(res.data.receiveName);
			$('input.receive-phone').val(res.data.receivePhone);
			$('input.receive-region').val(res.data.receiveRegion);
			$('input.receive-detail').val(res.data.receiveDetail);
		},
	});
	$('.edit-header>span').text('编辑地址');
	$('.edit-address').addClass('show');
	
});
// 增加
$('.add-address').on('click', function() {
	$('.del-add').addClass('hidden');
	$('form')[0].reset();
	$('input.id').val(0);
	$('.edit-header>span').text('新增地址');
	$('.set-detail').removeClass('default');
	$('.edit-address').addClass('show');
});
// 删除
$('.del-add').on('click',function() {
	layer.confirm('是否要删除地址？', {
		btn: [ '是','否']
	}, function(index) {
		var id = $('input.id').val();
		$.ajax({
			type: 'get',
			url: '/address/remove/'+ id,
			headers: { Authorization: Cookies.get('token'), },
			success: function(res) {
				if(res.code !== 200) { console.log(res.msg); return; };
			}
		});
		$(`.address-item[data-id=${id}]`).remove();
		$('.edit-address').removeClass('show');
		layer.close(index);
	});
});
// 点击确定按钮
$('button.btn-ok-ok').on('click', function() {
	var id = $('input.id').val();
	var address = [{
		id: id,
		receiveName: $('input.receive-name').val(),
		receivePhone: $('input.receive-phone').val(),
		receiveRegion: $('input.receive-region').val(),
		receiveDetail: $('input.receive-detail').val(),
	}];
	if(	$('.edit-header>span').text() === '编辑地址') {
		$.ajax({
			url: '/address/update',
			type: 'post',
			headers: { Authorization: Cookies.get('token') },
			data: {
				id: id,
				receiveName: $('input.receive-name').val(),
				receivePhone: $('input.receive-phone').val(),
				receiveRegion: $('input.receive-region').val(),
				receiveDetail: $('input.receive-detail').val(),
			},
			success: function(res) {
				if(res.code !== 200) { console.log(res.msg); return; };
			}
		});
		$(`.address-item[data-id=${id}]`).replaceWith(modeAddress(address));
	}else {
		$.ajax({
			type: 'post',
			url: '/address/add',
			headers: { Authorization: Cookies.get('token'), },
			data: {
				receiveName: $('input.receive-name').val(),
				receivePhone: $('input.receive-phone').val(),
				receiveRegion: $('input.receive-region').val(),
				receiveDetail: $('input.receive-detail').val()
			},
			success: function(res) {
				if(res.code !== 200) { console.log(res.msg); return; };
				id = res.data;
			}
		});
		// setTimeout(function() {
		// 	window.location.replace(window.location.href);
		// },1000);
		$('.content').append(modeAddress(address));
	}
	// 设为默认
	if($('.set-detail').hasClass('default')) {
		setTimeout(function() {
			$.ajax({
				type: 'get',
				url: '/address/set_default/' + id,
				headers: { Authorization: Cookies.get('token') },
			});
		},500);
		$('.address-item>div>p i').removeClass('default');	
		$(`.address-item[data-id=${id}]>div>p i`).addClass('default');
	}
	$('.edit-address').removeClass('show');
});
$('.edit-header>img').on('click', function() {
	$('.edit-address').removeClass('show');
});