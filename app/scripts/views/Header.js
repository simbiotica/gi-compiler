'use strict';

define([
  'jquery',
  'underscore',
  'underscoreString',
  'backbone',
  'handlebars',
  'text!templates/header.handlebars',
], function($, _, underscoreString, Backbone, Handlebars, tpl) {

  var HeaderView = Backbone.View.extend({

    el: '#headerView',

    events: {
      'click #printBtn': '_print',
      'click #embedBtn' : '_getEmbedMap'
    },

    template: Handlebars.compile(tpl),

    initialize: function() {
      this.setListeners();
    },

    setListeners: function() {
      Backbone.Events.on('Router:questions', this.setTitle, this);
      Backbone.Events.on('Router:map', this.setTitle, this);
      Backbone.Events.on('Router:embedMap', this.setTitle, this);
      Backbone.Events.on('Router:rank', this.setTitle, this);
      Backbone.Events.on('setCurrent', this.setCurrent, this);
    },

    _getEmbedMap: function(e) {
      e.preventDefault();
      $('#overlayView').toggleClass('is-hidden');
    },

    _setupHeader: function() {

      if (this.currentTitle.length > 40) {
        $('#headerTitle').css('font-size', '30px');
      }

      if (this.currentParams[1]) {
        $('#embedBtn').removeAttr('disabled');
      } else {
        $('#embedBtn').addClass('is-disabled');
      }

      _.each($('a'), _.bind(function(l) {
        if ($(l).data('location') === this.current) {
          $(l).addClass('is-current');
        }
      }, this));
    },

    // _checkClientId: function() {

    //   $.ajax({
    //     url: '//globalintegrity.cartodb.com/api/v2/sql',
    //     data: {
    //       q: _.str.sprintf(query, {
    //         id : localStorage.getItem('client'),
    //         product_id: this.currentParams[0]
    //       })
    //     },
    //     success: _.bind(onSuccess, this),
    //     fail: function(err) {
    //       throw err;
    //     }
    //   });


    //   function onSuccess(data) {

    //     var valid = data.rows[0].valid;

    //     if (!valid) {
    //       localStorage.clear();
    //     }

    //     this.render();
    //   }
    // },

    render: function() {
      var map;

      $('.layout-header').removeClass('is-hidden');

      if (this.current === 'map') {
        map = true;
      }

      this.$el.html(this.template({
        client: localStorage.getItem('client'),
        map: map,
        title: this.currentTitle,
        table: this.currentParams[0],
        question: this.currentParams[1]
      }));

      this._setupHeader();
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

    _print: function() {
      window.print();
    }

  });

  return HeaderView;

});
