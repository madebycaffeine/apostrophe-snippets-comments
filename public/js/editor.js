// JavaScript which enables editing of this module's content belongs here.
// sub classing snippets in the browser side.

function AposSnippetsComments(optionsArg) {
  var self = this;
  var options = {
    instance: 'comment',
    name: 'comments'
  };
  $.extend(options, optionsArg);
  AposSnippets.call(self, options);
}
