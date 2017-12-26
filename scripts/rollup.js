const fs = require('fs');
const path = require('path');
const watch = require('node-watch');
const rollup = require('rollup');
const pluginMultiEntry = require('rollup-plugin-multi-entry');
const pluginSass = require('rollup-plugin-sass');

const scriptPath = path.dirname(require.main.filename);

const inputOptions = {
    input: {
        include: [
            path.join(scriptPath, '..', 'app', 'rendered', 'templates', '**', '*.js'),
            //SASS files
            path.join(scriptPath, '..', 'app', 'rendered', 'assets', 'scss', 'main.scss'),
            path.join(scriptPath, '..', 'app', 'rendered', 'templates', '**', '*.scss')
        ],
        exclude: [
            path.join(scriptPath, '..', 'app', 'rendered', 'templates', '**', 'vm.js'),
            path.join(scriptPath, '..', 'app', 'rendered', '**', '*.old.js')
        ]
    },
    plugins: [
        pluginMultiEntry(),
        pluginSass({
            options: {
                //uncomment to include source maps.
                // outFile: 'main.css',
                // sourceMapEmbed: true,
                // sourceMap: true
            },
            output: function (styles, styleNodes) {
                //console.log(styleNodes);
                let cssOutputFile = path.join(scriptPath, '..', 'app', 'rendered', 'assets', 'css', 'main.css');
                fs.writeFile(cssOutputFile, styles, function (err) {
                    if (err) {
                        console.error(err);
                    }
                    console.info(`SASS compiled OK.`);
                });
            }
        })
    ]
};
const outputOptions = {
    file: path.join(scriptPath, '..', 'app', 'rendered', 'assets', 'js', 'main.js'),
    format: 'iife',
    name: 'bundle',
    globals: {
        jquery: '$'
    },
    banner: '/** SUPERLUMEN - Copyright 2017 Super-Lumen - www.superlumen.org */',
    sourcemap: true
};

async function build() {
    let bundle = await rollup.rollup(inputOptions);
    //console.log(bundle.imports); // an array of external dependencies
    //console.log(bundle.exports); // an array of names exported by the entry point
    //console.log(bundle.modules); // an array of module objects
    for (let x = 0; x < bundle.modules.length; x++) {
        console.log(`Rollup Module: ${bundle.modules[x].id}`);
    }
    let { code, map } = await bundle.generate(outputOptions);
    await bundle.write(outputOptions);
};

//always run once upon script execution
build();

//paths to watch for file changes.
const watchPaths = [
    { path: '../app/rendered/assets/scss', recursive: true },
    { path: '../app/rendered/data', recursive: true },
    { path: '../app/rendered/util', recursive: true },
    { path: '../app/rendered/templates', recursive: true }
];

//check if the watch flag argument was provided
for (let x = 0; x < process.argv.length; x++) {
    if (process.argv[x].match(/-w|--watch/i)) {
        for (let i = 0; i < watchPaths.length; i++) {
            var wp = watchPaths[i];
            let wpath = path.resolve(path.join(scriptPath, wp.path));
            console.info(`Watching (Recursive=${!!wp.recursive}): ${wpath}`)
            watch(wpath, {
                recursive: !!wp.recursive
            }, function (e, name) {
                if (name.match(/(?:\.js|\.scss)$/i)) {
                    console.info('Change detected. Running Rollup...');
                    build();
                }
            });
        }
    }
};
