/* global window, location */
import Channel from 'js-channel';
import EventEmitter from 'eventemitter3';
import { Promise } from 'es6-promise';
import 'iframe-resizer';
import * as _ from 'lodash';
import API from './api';

import iframeResizerOptions from './iframe-resizer-options';

window.iFrameResizer = iframeResizerOptions;

class Addon extends EventEmitter {
  constructor(options = {}) {
    super();

    this.options = options;
    this.api = new API(this);

    this.channel = Channel.build({
      window: options.window || window.parent,
      origin: '*',
      scope: options.id || location.origin, // eslint-disable-line no-restricted-globals
      postMessageObserver: (origin, message) => {
        this.emit('postMessage', origin, message);
      },
      gotMessageObserver: (origin, message) => {
        this.emit('gotMessage', origin, message);
      },
    });

    ['init', 'update', 'reload', '_event'].forEach((event) => {
      this.channel.bind(event, (tx, data) => {
        let eventName = event;
        let eventData = data;

        if (event === '_event') {
          eventName = data.eventName;
          eventData = data.eventData;
        }
        this.emit(eventName, eventData);

        return 'success';
      });
    });
  }

  request(params) {
    return new Promise((resolve, reject) => {
      if (!_.isPlainObject(params)) throw new Error('Params must be an object');

      const {
        method,
        endpoint,
        query,
        body,
      } = params;

      if (!method || !endpoint || !_.isString(method) || !_.isString(endpoint)) throw new Error('Invalid method or endpoint');

      if (!_.isUndefined(query) && !_.isPlainObject(query)) throw new Error('Query must be an object');

      if (!_.isUndefined(body) && !_.isPlainObject(body)) throw new Error('Body must be an object');

      this.channel.call({
        method: 'request',
        params,
        success(response) { resolve(response); },
        error(err) { reject(err); },
      });
    });
  }

  saveData(data) {
    return new Promise((resolve, reject) => {
      if (!_.isPlainObject(data)) throw new Error('Data must be an object');

      this.channel.call({
        method: 'saveData',
        params: data,
        success() { resolve(); },
        error(err) { reject(err); },
      });
    });
  }

  addTransaction(attrs) {
    return new Promise((resolve, reject) => {
      if (!_.isUndefined(attrs) && !_.isPlainObject(attrs)) throw new Error('Attrs must be an object');

      this.channel.call({
        method: 'addTransaction',
        params: attrs,
        success(transaction) { resolve(transaction); },
        error(err) { reject(err); },
      });
    });
  }

  editTransaction(id) {
    return new Promise((resolve, reject) => {
      if (!id || !_.isString(id)) throw new Error('Invalid id');

      this.channel.call({
        method: 'editTransaction',
        params: id,
        success(transaction) { resolve(transaction); },
        error(err) { reject(err); },
      });
    });
  }

  addInstitution(attrs) {
    return new Promise((resolve, reject) => {
      if (!_.isUndefined(attrs) && !_.isPlainObject(attrs)) throw new Error('Attrs must be an object');

      this.channel.call({
        method: 'addInstitution',
        params: attrs,
        success(institution) { resolve(institution); },
        error(err) { reject(err); },
      });
    });
  }

  downloadDocument(id) {
    return new Promise((resolve, reject) => {
      if (!id || !_.isString(id)) throw new Error('Invalid id');

      this.channel.call({
        method: 'downloadDocument',
        params: id,
        success() { resolve(); },
        error(err) { reject(err); },
      });
    });
  }

  upgradePremium() {
    return new Promise((resolve, reject) => {
      this.channel.call({
        method: 'upgradePremium',
        success() { resolve(); },
        error(err) { reject(err); },
      });
    });
  }

  getSharings() {
    return new Promise((resolve, reject) => {
      this.channel.call({
        method: 'getSharings',
        success(sharings) { resolve(sharings); },
        error(err) { reject(err); },
      });
    });
  }

  switchUser(id) {
    return new Promise((resolve, reject) => {
      if (!id || !_.isString(id)) throw new Error('Invalid id');

      this.channel.call({
        method: 'switchUser',
        params: id,
        success() { resolve(); },
        error(err) { reject(err); },
      });
    });
  }

  destroy() {
    this.channel.destroy();
  }
}

module.exports = Addon;
