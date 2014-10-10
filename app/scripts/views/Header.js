'use strict';

define([
  'jquery',
  'underscore',
  'underscoreString',
  'backbone',
  'handlebars',
  'text!templates/header.handlebars'
], function($, _, underscoreString, Backbone, Handlebars, tpl) {

  var HeaderView = Backbone.View.extend({

    el: '#headerView',

    events: {
      'click #printBtn': 'print'
    },

    template: Handlebars.compile(tpl),

    initialize: function() {
      this.setListeners();
    },

    setListeners: function() {
      Backbone.Events.on('Router:questions', this.setTitle, this);
      Backbone.Events.on('Router:map', this.setTitle, this);
      Backbone.Events.on('Router:rank', this.setTitle, this);
      Backbone.Events.on('setCurrent', this.setCurrent, this);
    },

    render: function() {
      this.$el.html(this.template({
        title: this.currentTitle,
        table: this.currentParams[0],
        question: this.currentParams[1]
      }));

      if (this.currentTitle.length > 40) {
        $('#headerTitle').css('font-size', '30px');
      }

      _.each($('a'), _.bind(function(l) {
        if ($(l).data('location') === this.current) {
          $(l).addClass('is-current');

          if (this.current === 'map') {
            var printBtn = $('#printBtn');
            printBtn.addClass('is-disabled');
            printBtn.addClass('is-disabled:hover');
            this.undelegateEvents();
            printBtn.hover(function(){
              $(this).css('text-decoration', 'none');
            });
          } else {
            this.delegateEvents({'click #printBtn' : 'print'});
          }
        }
      }, this));

    },

    setCurrent: function(currentPage) {
      this.current = currentPage;
    },

    setTitle: function(params) {
      this.currentParams = params;

      $.get(this.getUrl(), _.bind(function(data) {
        this.currentTitle = data.rows[0].title;
        this.render();
      }, this));
    },

    getUrl: function() {
      return '//globalintegrity.cartodb.com/api/v2/sql?q=' + this.getQuery();
    },

    getQuery: function() {
      return _.str.sprintf('SELECT projectname AS title FROM export_generic_prod_%(table)s_dp LIMIT 1', {
        table: this.currentParams[0]
      });
    },

    print: function() {
      window.print();
    }

  });

  return HeaderView;

});
