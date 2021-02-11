#!/usr/bin/env node
'use strict';

/*
 * Temporary script used by twstyled fork
 * run 'node ../../twpublish' from 'packages/babel' and 'packages/preeval' to publish to github packages
 */

const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');
const spawn = require('child_process').spawnSync;

const run = () => {
  const cwd = process.cwd();
  const packageJsonSrc = readFileSync(join(cwd, 'package.json'));
  const packageJson = JSON.parse(packageJsonSrc);
  packageJson.name = packageJson.name.replace(
    '@linaria/',
    '@twstyled/linaria-'
  );
  packageJson.repository = 'https://github.com/twstyled/linaria';
  packageJson.publishConfig = {
    access: 'public',
    registry: 'https://npm.pkg.github.com/twstyled',
  };

  writeFileSync(
    join(cwd, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  let code = 0;
  try {
    spawn('npm', ['publish'], { stdio: 'inherit' });
  } catch (ex) {
    code = ex.code || 1;
  }
  writeFileSync(join(cwd, 'package.json'), packageJsonSrc);
  process.exit(code);
};

run();
