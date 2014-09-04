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
      console.log(this.answersCollection.toJSON());
      this.$el.html(this.template({
        answers: this.answersCollection.toJSON()
      }));
    },

    empty: function() {
      this.$el.html('');
    },

    showData: function(params) {
      this.empty();

      $.when(
        this.getAnswers(params)
      ).then(_.bind(function() {
        this.render();
      }, this));
    },

    getAnswers: function(params) {
      var deferred = new $.Deferred();

      this.answersCollection.getByTargetAndQuestion(params.target, params.question, function() {
        deferred.resolve();
      });

      return deferred.promise();
    },

  });

  return ResultView;

});
