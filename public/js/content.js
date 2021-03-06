$(function() {

  console.log('Im running no worries !');

	/** Comments Area **/
	// Hebrew translation - i18n
	polyglot.extend({
		"Your comment added successfully": "תודה רבה, תגובתך התקבלה ובמידה ותאושר תעלה לאתר",
		'Title field is requird':'שדה כותרת הוא שדה חובה',
		'Email field is requird':'שדה דוא"ל הוא שדה חובה',
    "Email isn't correct":'דוא״ל אינו תקין',
		'Name field is requird':'שדה השם הוא שדה חובה',
		'The comment deleted successfully.': 'התגובה נמחקה בהצלחה',
		'The comment approved successfully.': 'התגובה אושרה בהצלחה',
		'Are you sure want to delete this comment ?': 'בטוח שברצונך למחוק תגובה זו ?'
    });

	$(".approve_comment").click(function() {
		$.ajax ({
			url: '/apos-snippets-comments/approve_comment/'+$(this).data('id'),
			method: 'get',
			success: function() {
				alert(__('The comment approved successfully.'));
			}
		});

    $(this).parent().parent().children('.whenCommentApproved').show();
    $(this).parent().parent().children('.whenCommentApproved').addClass('inlineBlock');
    $(this).parent().hide();
	});

  $(".unapprove_comment").click(function() {
    $.ajax ({
      url: '/apos-snippets-comments/removing_approvel_comment/'+$(this).data('id'),
      method: 'get',
      success: function() {
        alert(__('The comment unapproved successfully.'));
      }
    });

    $(this).parent().parent().children('.whenCommentIsntApproved').show();
    $(this).parent().parent().children('.whenCommentIsntApproved').addClass('inlineBlock');
    $(this).parent().hide();
  });

	$(".delete_comment").click(function() {
		if(confirm(__('Are you sure want to delete this comment ?'))) {
			$.ajax ({
				url: '/apos-snippets-comments/delete_comment/'+$(this).data('id'),
				method: 'get',
				success: function() {
					alert(__('The comment deleted successfully.'));
				}
			});


			$(this).closest(".cmnt").hide("slow");
		}
	});

  var validateEmail = function(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };

	// On clicking the 'Add comment' it change the value of `reply_of_message_id` to the current comment id.
	$(".post-comment").click(function() {
		$("#reply_of_message_id").val($(this).data('comment-id'));
		console.log($("#reply_of_message_id").val());
	});

	// Submitting comment
	$("#submit_comment").click(function() {

		// form validation
		if($('#f_name').val() == "" || $('#f_name').val() == " " || $('#f_name').val() == "שם") {
			alert(__('Name field is requird'));
			return false;
		}

		if($('#f_email').val() == "" || $('#f_email').val() == " " || $('#f_email').val() == 'דוא”ל') {
			alert(__('Email field is requird'));
			return false;
		}

		if($('#f_title').val() == "" || $('#f_title').val() == " " || $('#f_title').val() == 'כותרת') {
			alert(__('Title field is requird'));
			return false;
		}

    if(!validateEmail($('#f_email').val())) {
      alert(__("Email isn't correct"))
      return false;
    }


		$.ajax ({
			url: '/apos-snippets-comments/set_comment',
			method: 'post',
			data: {
				name: $('#f_name').val(),
				email: $('#f_email').val(),
				title: $('#f_title').val(),
				message: $('#f_message').val(),
				reply_of_message_id: $('#reply_of_message_id').val(),
        url: $('#url').val(),
				post_id: $('#post_id').val()
			},
			success: function() {
				$(".addCommentBlock").html(__('Your comment added successfully'));
			}
		});

		return false;
	});

});
