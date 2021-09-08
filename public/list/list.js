(function() {
	var cid = parseInt($.query.get('cid')) || 17;
	var fid = parseInt($.query.get('fid')) || 1;
	var fName = $.query.get('fName') || '有品推荐';
	var name = "";			//搜索框输入字符串
	var orderCol = 'price';	//排序方案 rate| price |sale
	var orderDir = "asc";	//排序方向 asc | desc
	var pageSize = 6;		//每页显示多少条
	var isLoading = false;	//表示当前是否有未完成的ajax
	var hasMore = true;		//标识按当前条件看更多商品，还有没有更多可以看
	var scroll = null;		//保存new IScroll的结果
	var isTriggerLoadMore = false;	//表示滚动是否触发了加载更多
	$('.list-header>h6').text(fName);
	$.ajax({
		type: "get",
		url: "/category/list/" + fid,
		success: function(res) {
			var htmlList = "";
			res.data.forEach(function(item) {
				htmlList += `
					<li>
						<a href="/list/list.html?cid=${item.id}">
							<img src="${item.avatar}" >
							<span>${item.name}</span>
						</a>
					</li>
				`;
			});
			$('.list-category').html(htmlList);
		},
	});
	// $.ajax({
	// 	type: "get",
	// 	url: "/category/list/all",
	// 	success: function(res) {
			
	// 	};
	// });
	function updataTip() {
		if(isLoading) 
			$('p.tip').text('————加载中..————');
		else if(isTriggerLoadMore)
			$('p.tip').text('————放手立即加载————');
		else if(hasMore) 
			$('p.tip').text('————上拉加载更多————');
		else if($('ul.list li').length === 0)
			$('p.tip').text('————暂无相关商品 敬请期待————');
		else 
			$('p.tip').text('————到底了————');
	}
	function initOrRefreshScroll() {
		imagesLoaded($('.content')[0], function() {
			if(scroll === null) {
				scroll = new IScroll($('.content')[0], {
					deceleration: 0.003,	//设置阻尼系数
					bounce: false,			//边界回弹
					probeType: 2,			//开启滚动监听
					click: true,			//
				});
				scroll.on('scroll', function() {
					if(isLoading || !hasMore) return;
					isTriggerLoadMore = scroll.maxScrollY - scroll.y === 0;
					updataTip();
				});
				scroll.on('scrollEnd', function() {
					if(isTriggerLoadMore) {
						getData(true);
						isTriggerLoadMore = false;
					}
				});
			}
			else {
				scroll.refresh();
			}
		});
	}
	function getData(isLoadMore = false) {
		if(!isLoadMore) {
			$('ul.list').empty();
			scroll && scrollTo(0,0,0);
		}
		isLoading = true;
		updataTip();
		$.ajax({
			type: 'post',
			url: '/product/list',
			data: { name, cid, orderCol, orderDir, begin: $('ul.list>li').length, pageSize },
			success: function(res) {
				if(res.code !== 200) { console.log(res.msg); return; }
				hasMore = res.data.length === pageSize;
				setTimeout(function() {
					var htmlStr = "";
					res.data.forEach(function(item) {
						htmlStr += `
							<li>
								<a href="/product/product.html?id=${item.id}">
									<img src="${item.avatar}" />
									<div class="list-item-detail">
										<h3 class="ellipsis">${item.name}</h3>
										<span class="list-item-detail-define">${item.brief}</span>
										<span class="list-item-detail-price-wrapper">
											￥<span class="list-item-detail-price">${item.price}</span>.00
										</span>
										<span class="list-item-detail-rateandsales">
											<span class="list-item-detail-rate">${item.rate}条评论</span>|
											<span class="list-item-detail-sales">共卖出${item.sale}件宝贝</span>
										</span>
									</div>
								</a>
							</li>
						`;
					});
					$('ul.list').append(htmlStr);
					initOrRefreshScroll();
					isLoading = false;
					updataTip();
				},1000);
			}
		});
	}
	getData();
	// 排序切换
	$('.order-wrapper').on('click', 'li', function(e) {
		if(isLoading) { layer.msg('您的操作太频繁了，请稍后！'); return; }
		if($(this).hasClass('active')) {
			orderDir = orderDir === 'asc'? 'desc' : 'asc';
			$(e.delegateTarget).children().toggleClass('asc desc');
		} 
		else {
			orderCol = $(this).attr('data-col');
			$(this).addClass('active').siblings('.active').removeClass('active');
		}
		getData();
	});
})();

