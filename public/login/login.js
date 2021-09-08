var $loginForm = $('form.login').Validform({
	tiptype: 3,
});
// 用户注册验证
var $registerForm = $('form.register-form').Validform({
	tiptype: 3,
});
// 注册页面
$('a.user-register').on('click', function() {
	$('.register').addClass('active');
});
$('.register-header>img').on('click', function() {
	$(this).parents('.register').removeClass('active');
});
$('button.btn-register').on('click', function() {
	var name = $('input.register-name').val().trim();
	var phone = $('input.register-phone').val().trim();
	var pwd = $('input.register-pwd').val().trim();
	var agree = $('input.checkbox').prop('checked');
	var isNameRight = 1, isPhoneRight = 1;
	if(name === "" || phone === "" || pwd === "" || !agree) return;
	$.ajax({
		type: 'get',
		url: '/user/check_name/' + name,
		success: function(res) {
			console.log(res.data);
			if(res.data) { layer.msg("用户名已被占用，请重新输入"); return; } 
		}
	});
	$.ajax({
		type: 'get',
		url: '/user/check_phone/' + phone,
		success: function(res) {
			console.log(res.data);
			if(res.data) { layer.msg("手机号已被占用，请重新输入"); return; } 
		}
	});
	$.ajax({
		type: 'post',
		url: '/user/register',
		data: {
			name: name,
			pwd: pwd,
			phone: phone,
		},
		success: function(res) {
			if(res.code !== 200) { console.log(res.msg); return;}
			layer.msg('注册成功！');
			setTimeout(function() {
				window.location.replace('/login/login.html');
			},2000);
		}
	});
	
});
// 登录
$('button.btn-login').on('click', function() {
	console.log($loginForm.check(false));
	// 表单验证
	
	// 发送ajax,进行登录请求
	$.ajax({
		type: "post",
		url: "/user/login_pwd",
		data: { 
			name: $('input.name').val().trim(),
			pwd: $('input.pwd').val().trim()
		 },
		success: function(res){
			if(res.code !== 200) {
				layer.msg(res.msg);
				return;
			}
			Cookies.set('token',res.data);
			Cookies.set('user',$('input.name').val().trim());
			layer.msg('登录成功');
			var referrer = document.referrer === window.location.href ?'/home/index.html' : document.referrer;
			setTimeout(function() {
				window.location.replace(referrer);
			},1000);
		}
	});
});
$('.form-item-group>input')
.on('focus',function() {
	if($(this).siblings('.Validform_checktip').hasClass('Validform_wrong')) {
		$(this).removeClass('active').addClass('error');
		return;
	}
	$('.form-item-group>input').removeClass('active');
	$(this).addClass('active');
})
.on('blur', function() {
	$(this).removeClass('active');
	if($(this).siblings('.Validform_checktip').hasClass('Validform_wrong')) {
		$(this).removeClass('active').addClass('error');
	}else {
		$(this).removeClass('error');
	}
});
$('.form-item-group>input').on('input',function() {
	if($(".form-item-group>input.name").val().length !== 0) {
		$('span.icon-clear').addClass('active');
	}
	var isNull = $(".form-item-group>input.name").val() !== "" && $(".form-item-group>input.pwd").val() !== "";
	$('.btn-login').attr('disabled', !isNull);
	if(isNull)$('.btn-login').removeClass('disable');
	$(this).addClass('active').remove('error');
});
$('span.icon-clear').on('click', function() {
	$(".form-item-group>input.name").val('');
});
$('span.icon-eyes').on('click', function() {
	$(this).toggleClass('active');
	var isEyes = $(this).hasClass('active') ? "text" : "password";
	// $(".form-item-group>input.pwd").css('type', isEyes);
	document.querySelector('.form-item-group>input.pwd').type = isEyes;
});
$('.phone-login').on('click', function() {
	$(this).parents('.login-content').removeClass('active').siblings('.login-content-phone').addClass('active');
});
$('.user-login').on('click', function() {
	$(this).parents('.login-content-phone').removeClass('active').siblings('.login-content').addClass('active');
});
