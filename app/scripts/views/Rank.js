define([
  'underscore',
  'backbone',
  'handlebars',
  'collections/Answers',
  'text!templates/rank.handlebars'
], function(_, Backbone, Handlebars, AnswersCollection, tpl) {

  'use strict';

  var RankView = Backbone.View.extend({

    el: '#rankView',

    template: Handlebars.compile(tpl),

    initialize: function() {
      this.setListeners();
    },

    setListeners: function() {
      this.answersCollection = new AnswersCollection();
      Backbone.Events.on('Router:rank', this.setList, this);
    },

    setList: function(data) {
      this.empty();

      $.when(
        this.getAnswers(data)
      ).then(_.bind(function() {
        this.render();
      }, this));
    },

    render: function() {
      var data = this.answersCollection.toJSON();
      var answers = _.pluck(data, 'answers')[0];

      this.$el.html(this.template({
        question: data[0].answers[0].text,
        answers: _.uniq(_.sortBy(answers, function(answer) {
          return Number(answer.score) * -1 + answer.target[0];
        }), function(answer) {
          return answer.score + answer.target;
        })
      }));
    },

    getAnswers: function(data) {
      var deferred = new $.Deferred();
      var params = {
        table: data[0],
        targets: 3
      };

      this.answersCollection.getByTargetAndQuestion(params, function() {
        deferred.resolve();
      });

      return deferred.promise();
    },

    empty: function() {
      this.$el.html('');
    }

  });

  return RankView;

});
