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
      Backbone.Events.on('Router:questions', this.empty, this);
      Backbone.Events.on('Toolbar:submit', this.showData, this);
      Backbone.Events.on('criteria:change', this.toggleCriteria, this);
    },

    render: function() {
      this.$el.html(this.template({
        items: this.answersCollection.toJSON(),
        table: this.currentTable
      }));

      this.toggleCriteria();
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
        targets: formdata.targets,
        questions: formdata.questions
      };

      this.answersCollection.getByTargetAndQuestion(params, function() {
        deferred.resolve();
      });

      this.currentTable = params.table;

      return deferred.promise();
    },

    toggleCriteria: function() {
      if (localStorage.getItem('GICompilerCriteria') === 'true') {
        $('.mod-results-criterias').removeClass('is-hidden');
      } else {
        $('.mod-results-criterias').addClass('is-hidden');
      }
    }

  });

  return ResultView;

});
