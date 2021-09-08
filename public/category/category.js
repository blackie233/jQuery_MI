// 发ajax请求一级分类的数据，并动态渲染
$.ajax({
	url: "/category/list/0",
	success: function(res) {
		if(res.code !== 200) {
			console.log(res.msg);
			return;
		}
		var htmlStr = "";
		res.data.forEach(function(item) {
			htmlStr += `
				<li data-id="${item.id}" data-avatar="${item.avatar}">
					<span>${item.name}</span>
				</li>
			`;
		});
		$('ul.list-main').html(htmlStr).children().eq(0).trigger('click');
	}
});
// 给ul.list-main绑定点击事件实现一级分类切换
$('ul.list-main').on('click', function(e) {
	var $li = e.target.tagName === 'LI' ? $(e.target) : $(e.target).parent();
	var fName = $li.children('span').text();
	if($li.hasClass('active')) return;
	$li.addClass('active').siblings('.active').removeClass('active');
	// 右上以及图片分类切换
	$('img.avatar').attr('src', $li.attr('data-avatar'));
	// 请求对应的二级分类数据动态渲染
	$.ajax({
		url: "/category/list/" + $li.attr('data-id'),
		success: function(res) {
			if(res.code !== 200) { console.log(res.msg); return; }
			$('ul.list-sub').empty();
			if(res.data.length) {
				$('p.tip').hide();
				var htmlStr = "";
				res.data.forEach(function(item) {
					htmlStr += `
						<li>
							<a href="/list/list.html?fid=${item.fid}&cid=${item.id}&fName=${fName}">
								<img src="${item.avatar}" />
								<span>${item.name}</span>
							</a>
						</li>
					`;
				});
				
				$('ul.list-sub').html(htmlStr).show();
			}else {
				$('p.tip').show();
				$('ul.list-sub').hide();
			}
		}
	});
});




