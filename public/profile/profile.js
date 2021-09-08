if(Cookies.get('user')) {
	$('a.personal-name').attr('href', "");
	$('a.personal-name>div>span').text(Cookies.get('user'));
	$('a.personal-name>img').attr('src','/images/profile/user_avatar.jpg');
	$('a.personal-name>div>img').remove();
	$('button.btn-exit').addClass('active');
}
$('a').on('click', function() {
	var href = this.href;
	var isAgree = false;
	if(Cookies.get('user')) return;
	layer.confirm('欢迎您来到小米有品！我们依据最新法律法规要求，制定并更新了《隐私政策》《小米有品用户协议》《小米帐号使用协议》。您需阅读并同意相关政策条款方可进行登录。',{
		btn: ['同意','不同意']
	}, function(){ window.location.href = href; });
	
	// isAgree = true;console.log(isAgree);
	return false;
})
$('button.btn-exit').on('click', function() {
	Cookies.remove('user');
	window.location.replace(window.location.href);
});