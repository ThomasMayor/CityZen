"use strict";
exports.__esModule = true;
var app_1 = require("./server/app");
var NodeServer = new app_1.Server();
NodeServer.initServer();
NodeServer.init();
NodeServer.bootstrap();
