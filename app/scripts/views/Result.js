define([
  'underscore',
  'backbone',
  'handlebars',
  'collections/Answers',
  'text!templates/result.handlebars'
], function(_, Backbone, Handlebars, AnswersCollection, tpl) {

  'use strict';

  var ResultView = Backbone.View.extend({

    el: '#resultView',

    template: Handlebars.compile(tpl),

    initialize: function() {
      this.answersCollection = new AnswersCollection();
      this.setListeners();
    },

    setListeners: function() {
      Backbone.Events.on('Toolbar:submit', this.showData, this);
    },

    render: function() {
      this.$el.html(this.template({
        answers: this.answersCollection.toJSON()
      }));
    },

    empty: function() {
      this.$el.html('');
    },

    showData: function(formdata) {
      this.empty();

      $.when(
        this.getAnswers(formdata)
      ).then(_.bind(function() {
        this.render();
      }, this));
    },

    getAnswers: function(formdata) {
      var deferred = new $.Deferred();
      var params = {
        table: formdata.table,
        targets: '1'
      };

      this.answersCollection.getByTargetAndQuestion(params, function() {
        deferred.resolve();
      });

      return deferred.promise();
    },

  });

  return ResultView;

});
