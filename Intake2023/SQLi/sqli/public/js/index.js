  $(document).ready(function(){
        $('.log-btn').click(function(){
					$.ajax({
						url: '/login',
						type: 'POST',
						data: {
							username: $('#username').val(),
							password: $('#password').val()
						},
						success: function(data){
							alert(data);
						}
					});
        });
    });
