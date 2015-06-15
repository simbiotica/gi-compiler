define([
  'jquery',
  'selectize',
  'underscore',
  'backbone',
  'handlebars',
  'collections/Targets',
  'collections/Questions',
  'text!templates/toolbar.handlebars'
], function($, selectize, _, Backbone, Handlebars, TargetsCollection, QuestionsCollection, tpl) {

  'use strict';

  var ToolbarView = Backbone.View.extend({

    el: '#toolbarView',

    options: {
      selectize: {
        plugins: ['remove_button'],
        onChange: function(values) {
          _.each(values, _.bind(function(val) {
            if (val === 'all') {
              this.close();
              _.each(values, _.bind(function(v){
                if (v !== 'all') {
                  this.removeItem(v);
                }
              }, this));
            }
          }, this));
        }
      },
      questions: {
        plugins: ['remove_button'],
        render: {
          item: function(item, escape) {
            var array = item.text.split(' ');
            return (item.text ? '<div><span class=\'id\'>' + escape(array[0]) + '</span></div>' : '');
          }
        },
        onChange: function(values) {
          _.each(values, _.bind(function(val) {
            if (val === 'all') {
              this.close();
              _.each(values, _.bind(function(v){
                if (v !== 'all') {
                  this.removeItem(v);
                }
              }, this));
            }
          }, this));
        }
      }
    },

    events: {
      'change #toggleCriteria': 'setCriteria',
      'change #toggleSources': 'setSources',
      'change #toggleComments': 'setComments',
      'change #toggleNotes': 'setNotes',
      'submit form': 'onSubmit'
    },

    template: Handlebars.compile(tpl),

    initialize: function() {
      this.targetsCollection = new TargetsCollection();
      this.questionsCollection = new QuestionsCollection();

      this.setListeners();
    },

    setListeners: function() {
      Backbone.Events.on('Router:questions', this.setLocation, this);
      Backbone.Events.on('Router:map', this.setLocation, this);
      Backbone.Events.on('toggleToolbar', this.toggle, this);
    },

    setupSelects: function() {
      var $checkbox = $('input[type=\'checkbox\']');

      $('select[name=\'targets\']').selectize(this.options.selectize);

      if (this.location === 'map') {

        _.extend(this.options.questions, {maxItems: 1});

        var $question = $('select[name=\'questions\']').selectize(this.options.questions);

        //$('.grid-8').removeClass('grid-8').addClass('grid-12');
        //$('.grid-4').next().find('.selectize-control').css('width', '100%');
        $('.grid-4').first().addClass('is-hidden');
        $('.grid-2').addClass('is-hidden');

        $checkbox.parent().css('display', 'none');
        $question[0].selectize.removeOption('all');

        $question.on('change', _.bind(function(){
          this.onSubmit();
        }, this));

      } else {

        $('.grid-4').removeClass('is-hidden');
        $('.grid-8').find('.form-row').children().css('width', '100%');
        $checkbox.removeAttr('disabled');
        this.$el.css('overflow', 'visible');

        if (this.options.questions.maxItems) {
          delete this.options.questions.maxItems;
        }

        $('select[name=\'questions\']').selectize(this.options.questions);
      }
    },

    render: function() {
      var map;

      if (this.location === 'map') {
        map = true;
      }

      this.$el.removeAttr('style');

      this.$el.html(this.template({
          table: this.table,
          targets: this.targetsCollection.toJSON(),
          questions: this.questionsCollection.toJSON(),
          map: map
        }));

      this.setupSelects();

      this.setCriteria();
      this.setSources();
      this.setComments();
      this.setNotes();
    },

    toggle: function() {

      if ($('.mod-toolbar').hasClass('is-hidden')) {

        var self = this;

        $('.mod-toolbar').height('0');
        this.$el.css('overflow', 'hidden');

        $('.mod-toolbar').css('visibility', 'hidden');
        $('.mod-toolbar').css('display', 'block');

        $('.mod-toolbar').height('100');

        $('.mod-toolbar').removeClass('is-hidden');


        window.setTimeout(function(){
          $('.mod-toolbar').css('visibility', 'visible');
          self.$el.css('overflow', 'visible');
        }, 300);

      } else {

        this.$el.css('overflow', 'hidden');

        $('.mod-toolbar').height('0');

        $('.mod-toolbar').addClass('is-hidden');

        $('.mod-toolbar').css('padding', '0');
        $('.mod-toolbar').css('visibility', 'hidden');
      }
    },

    empty: function() {
      this.$el.html('');
    },

    onSubmit: function() {
      var params = this.$el.find('form').serializeArray();
      var result = {};

      _.each(params, function(p) {
        if (!result[p.name]) {
          result[p.name] = _.pluck(_.where(params, {name: p.name}), 'value');
        }
      });

      _.each(result, function(value, key) {
        if (typeof value === 'object' && value.length === 1) {
          result[key] = value[0];
        }
      });

      if (this.location === 'map') {
        window.router.navigate('#map/' + result.table + '/' + result.questions, {trigger : true});
      } else {
        Backbone.Events.trigger('Toolbar:submit', result);
      }

      return false;
    },

    setLocation: function(params) {
      var hasthtag = window.location.hash;
      var url = hasthtag.split('/');

      this.location = url[0].slice(1, url[0].length);

      this.$el.addClass('is-hidden');
      $('#mapView').removeClass('is-hidden');

      this.showData(params);

      if (url.length !== 3) {
        this.$el.removeClass('is-hidden');
        $('#mapView').addClass('is-hidden');
      }
    },

    showData: function(params) {
      this.empty();
      this.table = params[0];

      $.when(
        this.getTargets(params[0]),
        this.getQuestions(params[0])
      ).then(_.bind(function() {
        this.render();
      }, this));
    },

    getTargets: function(table) {
      var deferred = new $.Deferred();

      this.targetsCollection.getByTable(table, function() {
        deferred.resolve();
      });

      return deferred.promise();
    },

    getQuestions: function(table) {
      var deferred = new $.Deferred();

      this.questionsCollection.getByTable(table, function() {
        deferred.resolve();
      });

      return deferred.promise();
    },

    setCriteria: function(e) {
      var $criteria = $('#toggleCriteria');
      if (e) {
        localStorage.setItem('GICompilerCriteria', $criteria.prop('checked'));
      }
      $criteria.prop('checked', localStorage.getItem('GICompilerCriteria') === 'true');
      Backbone.Events.trigger('criteria:change');
    },

    setSources: function(e) {
      var $sources = $('#toggleSources');
      if (e) {
        localStorage.setItem('GICompilerSources', $sources.prop('checked'));
      }
      $sources.prop('checked', localStorage.getItem('GICompilerSources') === 'true');
      Backbone.Events.trigger('sources:change');
    },

    setComments: function(e) {
      var $comments = $('#toggleComments');
      if (e) {
        localStorage.setItem('GICompilerComments', $comments.prop('checked'));
      }
      $comments.prop('checked', localStorage.getItem('GICompilerComments') === 'true');
      Backbone.Events.trigger('comments:change');
    },

    setNotes: function(e) {
      var $notes = $('#toggleNotes');
      if (e) {
        localStorage.setItem('GICompilerNotes', $notes.prop('checked'));
      }
      $notes.prop('checked', localStorage.getItem('GICompilerNotes') === 'true');
      Backbone.Events.trigger('notes:change');
    }

  });

  return ToolbarView;

});
