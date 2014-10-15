'use strict';

define([
  'backbone',
  'underscore',
  'handlebars',
  'text!templates/overlay.handlebars'
], function(Backbone, _, Handlebars, tpl){

  var OverlayView = Backbone.View.extend({

    el: '#overlayView',

    template: Handlebars.compile(tpl),

    events: {
      'click .close' : '_closeOverlay',
      'click .overlay-bg' : '_closeOverlay',
      'click #embed' : '_getEmbed',
      'click #link' : '_getLink',
      'click .share-btn' : '_setActive'
    },

    initialize: function() {
      this._setListeners();
    },

    _setListeners: function() {
      Backbone.Events.on('Router:map', this._getURL, this);
      $('body').on('keydown', _.bind(function(e){
        if (e.keyCode === 27) {
          this._closeOverlay();
        }
      }, this));
    },

    _closeOverlay: function() {
      this.$el.addClass('is-hidden');
    },

    _getURL: function(params) {
      if (params[1]) {
        this.url = window.location.href;
        this._render();
        this._getEmbed();
        $('#embed').addClass('btn-is-active');
      }
    },

    _setActive: function(e) {
      $('.share-link button').removeClass('btn-is-active');
      $(e.currentTarget).addClass('btn-is-active');
    },

    _getEmbed: function() {
      var url = this.url + '/embed';
      var iframe = '<iframe width="960" height="600" frameborder="0" src="' + url + '"></iframe>';
      $('#urlframe').val(iframe);
    },

    _getLink: function() {
      $('#urlframe').val(this.url);
    },

    _render: function() {
      this.$el.html(this.template());
    }

  });

  return OverlayView;

});
