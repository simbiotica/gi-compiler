/*jshint multistr: true */

'use strict';

define([
  'jquery',
  'underscore',
  'underscoreString',
  'backbone',
  'handlebars',
  'collections/Products',
  'text!templates/header.handlebars',
], function($, _, underscoreString, Backbone, Handlebars, ProductsCollection, tpl) {

  var HeaderView = Backbone.View.extend({

    el: '#headerView',

    events: {
      'click #home': 'checkClient',
      'click #printBtn': '_print',
      'click #embedBtn' : '_getEmbedMap'
    },

    template: Handlebars.compile(tpl),

    initialize: function() {
      this.productsCollection = new ProductsCollection();
      this.setListeners();
    },

    setListeners: function() {
      Backbone.Events.on('Router:questions', this.setTitle, this);
      Backbone.Events.on('Router:map', this.setTitle, this);
      Backbone.Events.on('Router:embedMap', this.setTitle, this);
      Backbone.Events.on('Router:rank', this.setTitle, this);
      Backbone.Events.on('setCurrent', this.setCurrent, this);
      //Backbone.Events.on('Product:is-mappable', this._isMappable, this);
    },

    checkClient: function(e) {
      if (e) {
        e.preventDefault();
      }

      if (this.clientId !== Number(localStorage.getItem('client'))) {
        localStorage.setItem('client', this.clientId);
        e.currentTarget.href= '#client/' + this.clientId;
      }

      window.location.href = e.currentTarget.getAttribute('href');
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

        if ($(l).data('location') === 'map' && this.isMappable === 'FALSE') {
          $(l).addClass('is-disabled');
          $(l).css('pointer-events', 'none');
          this.isMappable = null;
        }

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
        logo_url: this.logo_url,
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
      var self = this;

      $.get(this.getUrl(), _.bind(function(data) {
        this.currentTitle = data.rows[0].title;
        this.logo_url = data.rows[0].logo_url;
        this.clientId = data.rows[0].client_id;
        this.productsCollection._isMappable(this.currentParams[0], function(){
          var json = self.productsCollection.toJSON();
          self.isMappable = json[0].map;
          self.render();
        });
      }, this));
    },

    getUrl: function() {
      return '//globalintegrity.cartodb.com/api/v2/sql?q=' + this.getQuery();
    },

    getQuery: function() {
      return _.str.sprintf('SELECT projectname as title, logo_url, client_id \
        FROM export_generic_prod_%(table)s_dp, products \
        where product_id::integer = productid::integer LIMIT 1', {
        table: this.currentParams[0]
      });
    },

    _print: function() {
      window.print();
    }

  });

  return HeaderView;

});
