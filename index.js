/** THIS IS DUMB AS SHIT BUT ALL THE CLINT-SIDE JS ARE IN THE MAIN SITE.JS.
** SAME AS THE TEMPLATE ARE IN THE CURRENT SNIPPET SHOW.HTML **/

var async = require('async');
var _ = require('lodash');
var extend = require('extend');
var snippets = require('apostrophe-snippets');
var moment = require('moment');
var qs = require('qs');
var randy = require('randy');
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('lYsnTjk_FMV72qSw_3CBxA');

module.exports = comments;

function comments(options, callback) {
	return new comments.SnippetsComments(options, callback);
}

comments.SnippetsComments = function(options, callback) {
	var apos = options.apos;
	var app = options.app;

	var self = this;
	self._apos = apos;
	self._app = app;

	apos.mixinModuleEmail(self);

  _.defaults(options, {
    instance: 'comment',
    name: options.name || 'comments',
    instanceLabel: options.instanceLabel || 'Comment',
    label: options.label || 'Comments',
    icon: options.icon || 'icon-comments' /*,
   	menuName: 'aposCommentsMenu',
	browser: {
		baseConstruct: 'AposSnippets'
	},
    groupFields: [{
        name: 'commentsDetails',
        label: 'Comment Details',
        icon: 'content',
        fields: ['commentsStatus', 'amountOfComments']
      }]*/
  });

  options.addFields = [

    {
      name: 'commentsStatus',
      label: 'Comments Status',
      type: 'select',
      choices: [{
		label: 'Open',
		value: 'Open'
	  }, {
		label: 'Close',
		value: 'Close'
	  }]
    }, {
		name: 'amountOfComments',
		label: 'Amount of comments',
		type: 'string'
	}
  ].concat(options.addFields || []);

  options.removeFields = [
    'hideTitle'
  ].concat(options.removeFields || []);

  options.modules = (options.modules || []).concat([ { dir: __dirname, name: 'comments' } ]);


	snippets.Snippets.call(this, options, null);


	// Establish the default sort order for comments
	var superGet = self.get;

	// MANAGING ROUTES - COMMENTS API
	app.post('/apos-snippets-comments/set_comment', function(req, res) {
		var name = apos.sanitizeString(req.body.name);
		var email = apos.sanitizeString(req.body.email);
		var title = apos.sanitizeString(req.body.title);
		var message = apos.sanitizeString(req.body.message);
		var post_id = apos.sanitizeString(req.body.post_id);
		// if req.body.reply_of_message_id == 0 its a new comment and not a reply
		var reply_of_message_id = apos.sanitizeString(req.body.reply_of_message_id);
		var url = apos.sanitizeString(req.body.url);


		// Adding fields into the collection
		apos.db.collection("aposComments", function(err, aposComments) {
			if(err) {
				console.log("ERR 1 ", err);
				res.send("ERR 1 ", err);
			}

			aposComments.insert({
				"name": name,
				"email": email,
				"title": title,
				"message": message,
				"post_date": moment(new Date()).format('YYYY-MM-DD'),
				"post_id": post_id,
				"reply_of_message_id": reply_of_message_id,
				"url": url,
				"approved": false
			}, function(err, result) {
				if(err)
					console.log("ERR 2 ", err);
				else {

					var message = {
					    "html": "הודעה ממערכת - haredisocity.org <br /> ישנה תגובה חדשה הממתינה לאישור - <a href='http://www.haredisocity.org"+result[0].url+"'>http://www.haredisocity.org"+result[0].url+"</a>",
					    "text": "",
					    "subject": "הודעה מאתר haredisociety.org",
					    "from_email": "webmaster@haredisociety.org",
					    "from_name": "haredisociety.org Webmaster",
					    "to": [{
					            "email": "dannyb9737@gmail.com",
					            "name": "haredisociety",
					            "type": "to"
					        },{
					            "email": "danny.miotix@gmail.com",
					            "name": "haredisociety",
					            "type": "to"
					        }],
					    "headers": {
					        "Reply-To": "danny.miotix@gmail.com"
					    },
					    "important": false,
					    "track_opens": null,
					    "track_clicks": null,
					    "auto_text": null,
					    "auto_html": null,
					    "inline_css": null,
					    "url_strip_qs": null,
					    "preserve_recipients": null,
					    "view_content_link": null,
					    "bcc_address": "silvi-g@env.org.il",
					    "tracking_domain": null,
					    "signing_domain": null,
					    "return_path_domain": null,
					    "merge": true,
					    "merge_language": "mailchimp"
					};
					var async = true;
					var ip_pool = "Main Pool";
					var send_at = "example send_at";
					mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
					    console.log(result);
					}, function(e) {
					    // Mandrill returns the error as an object with name and message keys
					    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
					    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
					});

				}

			});
		});

		res.send('sent');
	});

	// Removing Approval
	app.get('/apos-snippets-comments/removing_approvel_comment/:id', function(req, res) {
		var comment_id = apos.sanitizeString(req.params.id);
		if(req.user.permissions.admin == true) {
			apos.db.collection("aposComments", function(err, aposComments) {
				if(err)
					console.log("ERR 7.3 ", err);

					var ObjectId = require('mongodb').ObjectID;
					aposComments.update({_id: ObjectId(comment_id)}, {$set: {approved: false}}, function(err, doc) {
						if(err)
							console.log("ERR 7.4 ", err);

						console.log('comment unapproved');
					});
			});
		}
	});
	// Approving a comment
	app.get('/apos-snippets-comments/approve_comment/:id', function(req, res) {
		var comment_id = apos.sanitizeString(req.params.id);
		if(req.user.permissions.admin == true) {
			apos.db.collection("aposComments", function(err, aposComments) {
				if(err)
					console.log("ERR 7.1 ", err);

					var ObjectId = require('mongodb').ObjectID;
					aposComments.update({_id: ObjectId(comment_id)}, {$set: {approved: true}}, function(err, doc) {
						if(err)
							console.log("ERR 7.2 ", err);

						console.log('comment approved');
					});
			});
		}
	});


	// Deleting a comment
	app.get('/apos-snippets-comments/delete_comment/:id', function(req, res) {
		/* @reply_id - contains the comment _ID(Mongodb's ID) */
		var reply_id = apos.sanitizeString(req.params.id);
		res.send(reply_id);

		if(req.user) {
			if(req.user.permissions.admin == true) {

				apos.db.collection("aposComments", function(err, aposComments) {
					if(err)
						console.log("ERR 5.1 ", err);

					var ObjectId = require('mongodb').ObjectID;
					// Deleting parent comment.
					aposComments.remove({ _id: ObjectId(reply_id)}, function(err) {
						if(err)
							console.log("ERR 5.3 ", err);
					});
					// Deleting child comments.
					aposComments.remove({ reply_of_message_id: reply_id}, function(err) {
						if(err)
							console.log("ERR 5.2 ", err);
					});
				});

			}
		} else res.send("You are not allowed to be in here!");

	});


  self.setOptionsForDefaultView = function(options) {
    options.upcoming = true;
  };


	self.get = function(req, userCriteria, optionsArg, callback) {
	var options = {};
	// "Why copy the object like this?" If we don't, we're modifying the
	// object that was passed to us, which could lead to side effects
	extend(true, options, optionsArg || {});
		return superGet.call(self, req, userCriteria, options, function(err, results) {
			if (err) {
				return callback(err);
			}

			// Adding to the snippet the the comments array, the the comments count.
			async.each(results.snippets, function(result, _callback) {
				result.comments = {};
				// id => result._id

					apos.db.collection("aposComments", function(err, aposComments) {
						aposComments.find({"post_id": result._id, "approved": true}, function(err, approvedComments) {
							approvedComments.count(function(_err, _count) {
								if(_err)
									console.log("ERR 5", _err);
								else
									result.comments.count = _count;

									aposComments.find({"post_id": result._id}, function(err, allComments) {
										allComments.toArray(function(_err, commentsArray) {
											if(_err)
												console.log("ERR 7", _err);
											else
												result.comments.comments = commentsArray;
											_callback();
									});
								});

							});
						});

				});
			}, ready);

			function ready(err) {
				if(err) {
					throw err;
				}
				return callback(null, results);
			}

		});
	};


	// ** ???
	var superBeforePutOne = self.beforePutOne;
	self.beforePutOne = function(req, slug, options, snippet, callback) {
		//self.denormalizeDates(snippet);
		return superBeforePutOne(req, slug, options, snippet, callback);
	};


	if (callback) {
		process.nextTick(function() { return callback(null); });
	}
};
