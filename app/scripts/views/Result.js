define([
  'underscore',
  'backbone',
  'handlebars',
  'collections/Products',
  'collections/Answers',
  'collections/Reviews',
  'collections/Notes',
  'text!templates/result.handlebars'
], function(_, Backbone, Handlebars, ProductsCollection,
    AnswersCollection, ReviewCollection, NotesCollection, tpl) {

  'use strict';

  var ResultView = Backbone.View.extend({

    el: '#resultView',

    template: Handlebars.compile(tpl),

    initialize: function() {
      this.answersCollection = new AnswersCollection();
      this.productsCollection = new ProductsCollection();
      this.reviewsCollection = new ReviewCollection();
      this.notesCollection = new NotesCollection(),
      this.setListeners();
    },

    setListeners: function() {
      Backbone.Events.on('Router:questions', this.empty, this);
      Backbone.Events.on('Toolbar:submit', this.showData, this);
      Backbone.Events.on('criteria:change', this.toggleCriteria, this);
      Backbone.Events.on('sources:change', this.toggleSources, this);
      Backbone.Events.on('comments:change', this.toggleComments, this);
      Backbone.Events.on('notes:change', this.toggleNotes, this);
      Backbone.Events.on('reviews:change', this.toggleReviews, this);
    },

    render: function() {
      var product_map = this.productsCollection.toJSON(),
        map = false,
        self = this;

      if (product_map[0] && product_map[0].map === 'TRUE') {
        map = true;
      }

      var reviews = this.reviewsCollection.toJSON();
      var notes = this.notesCollection.toJSON();

      _.each(this.answersCollection.toJSON(), function(answer) {
        _.each(answer.questions, function(data){
          _.extend(data, {
            map: map,
            table: self.currentTable
          });
          _.each(data.answers, function(m) {
            _.extend(m, {
              reviews: _.where(reviews, {
                aspectid: m.id,
                targetid: m.targetId
              }),
              notes: _.where(notes, {
                aspectid: m.id,
                targetid: m.targetId
              })
            });
          });
        });
      });

      this.$el.html(this.template({
        items: this.answersCollection.toJSON(),
      }));

      this.toggleCriteria();
      this.toggleSources();
      this.toggleComments();
      this.toggleNotes();
      this.toggleReviews();

      this.formatTextAreas();
      this.setLinks();
    },

    setLinks: function() {
      var html = $('.mod-results')[0].innerHTML;
      var newHTML = this.formatLinks(html);
      $('.mod-results').html(newHTML);
    },

    formatTextAreas: function() {
      _.each($('textarea'), _.bind(function(txt) {
        var parent = $(txt).parent();
        var content = $(txt).html();
        var elem = document.createElement('p');
        $(elem).html(content);
        $(parent).html(elem);
      }, this));
    },

    formatLinks: function(text) {
      var exp = /(\b(https?:\/\/|ftp:\/\/|file:\/\/|www.)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
      return text.replace(exp, function(txt, b, regexpResult) {
        if (regexpResult === 'www.') {
          return '<a  target=\'_blank\' href=http://' + txt + '>' + txt + '</a>';
        } else {
          return '<a  target=\'_blank\' href=' + txt + '>' + txt + '</a>';
        }

      });
    },

    getNotes: function(formdata) {
      var deferred = new $.Deferred();
      var question = formdata.questions;
      var target = formdata.targets;

      var result = '',
        query_question = '',
        query_target = '';


      if (question && question !== 'all') {
        if (typeof(question) === 'string') {
          result = '\'' + question + '\'';
        } else {
          _.map(question, function(q) {
            result += _.str.sprintf('\'%s\'', q) + ',';
          });

          result = result.slice(0, result.length -1);
        }

        query_question = _.str.sprintf('aspectid in (%s)', result);
      }

      if (target && target !== 'all') {
        if (query_question) {
          query_target = _.str.sprintf('and targetid in (%s)', target);
        } else {
          query_target = _.str.sprintf('targetid in (%s)', target);
        }
      }

      this.notesCollection.getNotes(query_question, query_target, function() {
        deferred.resolve();
      });

      return deferred.promise();
    },

    getReviews: function(formdata) {
      var deferred = new $.Deferred();
      var question = formdata.questions;
      var target = formdata.targets;

      var result = '',
        query_question = '',
        query_target = '';

      if (question && question !== 'all') {
        if (typeof(question) === 'string') {
          result = '\'' + question + '\'';
        } else {
          _.map(question, function(q) {
            result += _.str.sprintf('\'%s\'', q) + ',';
          });

          result = result.slice(0, result.length -1);
        }

        query_question = _.str.sprintf('aspectid in (%s)', result);
      }

      if (target && target !== 'all') {
        if (query_question) {
          query_target = _.str.sprintf('and targetid in (%s)', target);
        } else {
          query_target = _.str.sprintf('targetid in (%s)', target);
        }

      }

      this.reviewsCollection.getReviews(query_question, query_target, function(){
        deferred.resolve();
      });

      return deferred.promise();
    },

    _isMappable: function (formdata) {
      var deferred = new $.Deferred();
      var table = formdata.table;

      this.productsCollection._isMappable(table, function(){
        deferred.resolve();
      });

      return deferred.promise();
    },

    empty: function() {
      this.$el.html('');

    },

    showData: function(formdata) {
      this.empty();

      $.when(
        this._isMappable(formdata),
        this.getAnswers(formdata),
        this.getReviews(formdata),
        this.getNotes(formdata)
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
    },

    toggleSources: function() {
      if (localStorage.getItem('GICompilerSources') === 'true') {
        $('.sources').removeClass('is-hidden');
      } else {
        $('.sources').addClass('is-hidden');
      }
    },

    toggleComments: function() {
      if (localStorage.getItem('GICompilerComments') === 'true') {
        $('.comments').removeClass('is-hidden');
      } else {
        $('.comments').addClass('is-hidden');
      }
    },

    toggleNotes: function() {
      if (localStorage.getItem('GICompilerNotes') === 'true') {
        $('.notes').removeClass('is-hidden');
      } else {
        $('.notes').addClass('is-hidden');
      }
    },

    toggleReviews: function() {
      if (localStorage.getItem('GICompilerReviews') === 'true') {
        $('.reviews').removeClass('is-hidden');
      } else {
        $('.reviews').addClass('is-hidden');
      }
    }

  });

  return ResultView;

});
