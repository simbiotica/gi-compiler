define([
  'backbone'
], function(Backbone) {

  'use strict';

  var QuestionsCollection = Backbone.Collection.extend({

    url: '',

    getAll: function(callback) {
      callback();
    }

  });

  return QuestionsCollection;

});
