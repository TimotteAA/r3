#!/usr/bin/env node
const { existsSync } = require('fs');
const { join } = require('path');

const projectPath = join(__dirname, '../tsconfig.build.json');
if (existsSync(projectPath)) {
    // 开发环境下，先对ts进行编译
    require('ts-node').register({
        files: true,
        transpileOnly: true,
        project: projectPath,
    });
    require('tsconfig-paths/register');
}

const { creator } = require('./creator');
const { buildCli } = require('./modules/core/helpers');

buildCli(creator);