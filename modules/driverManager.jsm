/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

let DEBUG = 1;
if (DEBUG)
  debug = function (s) { dump("-*- DriverManager: " + s + "\n"); };
else
  debug = function (s) { };

var EXPORTED_SYMBOLS = ['DriverManager'];

const MANAGER_EXE = 'resource://ffosassistant-drivermanager';
const {classes: Cc, interfaces: Ci, utils: Cu, results: Cr} = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
XPCOMUtils.defineLazyModuleGetter(this, 'utils', 'resource://ffosassistant/utils.jsm');
XPCOMUtils.defineLazyModuleGetter(this, "ParentModule", "resource://ffosassistant/parentModule.jsm");

var driverManagerModule = new ParentModule({
  messages: ['DriverManager:isRunning', 'DriverManager:start'],

  onmessage: function dm_onmessage(name, msg) {
    debug('Receive message:' + name);
    var self = this;

    switch (name) {
      // This is a sync message
      case 'DriverManager:isRunning':
        return isDriverManagerRunning();
      case 'DriverManager:start':
        startDriverManager();
        break;
    }
  }
});

let process = null;

function isDriverManagerRunning() {
  return process && process.isRunning;
}

function startDriverManager() {
  if (isDriverManagerRunning()) {
    debug("The process is already running.");
    return;
  }

  debug("Run process.");
  try {
  var managerFile = utils.getChromeFileURI(MANAGER_EXE).file;
  process = Cc['@mozilla.org/process/util;1']
              .createInstance(Ci.nsIProcess);
  process.init(managerFile);
  var args = [];
  process.runAsync(args, args.length, processObserver);
  } catch (e) {
    debug(e);
  }
}

var processObserver = {
  observe: function observe(aSubject, aTopic, aData) {
    debug('subject:' + aSubject + ', topic:' + aTopic + ', data: ' + aData);
  }
};

debug("inited.");
