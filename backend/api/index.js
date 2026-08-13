"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
require("dotenv/config");
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const express_1 = require("express");
const app_module_1 = require("../src/app.module");
const app_setup_1 = require("../src/app-setup");
let serverPromise = null;
async function bootstrapServer() {
    const server = (0, express_1.default)();
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(server));
    (0, app_setup_1.configureApp)(app);
    await app.init();
    return server;
}
function getServer() {
    if (!serverPromise)
        serverPromise = bootstrapServer();
    return serverPromise;
}
async function handler(req, res) {
    const server = await getServer();
    server(req, res);
}
//# sourceMappingURL=index.js.map