const fs = require('fs');
const path = require('path');
const watch = require('node-watch');
const rollup = require('rollup');
const glob = require('glob');
const pluginMultiEntry = require('rollup-plugin-multi-entry');
const pluginSass = require('rollup-plugin-sass');
const pluginReplace = require('rollup-plugin-re');

//dir path to this script
const scriptPath = path.dirname(require.main.filename);

//the templates dir path
const templatePath = path.resolve(path.join(scriptPath, '..', 'app', 'rendered', 'templates'));

//paths to watch for file changes.
const watchPaths = [
    { path: path.resolve(path.join(scriptPath, '../app/rendered/assets/scss')), recursive: true },
    { path: path.resolve(path.join(scriptPath, '../app/rendered/util')), recursive: true },
    { path: path.resolve(path.join(scriptPath, '../app/rendered/components')), recursive: true },
    { path: path.resolve(path.join(scriptPath, '../app/rendered/templates')), recursive: true }
];

//build an array of view-model paths and the default ViewModel class names
const viewModels = (function () {
    let vms = [];
    let files = glob.sync(path.join(templatePath, '**', 'view-model.js'));
    for (let f of files) {
        let vm = { path: '.' + f.substr(templatePath.length), className: null };
        //read file and extract viewmodel class names
        let js = fs.readFileSync(f).toString();
        let regex = /^export default class (.+) extends.+ViewModel.+$/gm;
        let match = regex.exec(js);
        if (match) {
            vm.className = match[1];
        }
        if (vm.className) {
            vms.push(vm);
        }
    }
    return vms;
})();

const inputOptions = {
    input: {
        include: [
            path.join(templatePath, '**', '*.js'),
            //SASS files
            path.join(scriptPath, '..', 'app', 'rendered', 'assets', 'scss', 'main.scss'),
            path.join(templatePath, '**', '*.scss')
        ],
        exclude: [
            path.join(templatePath, '**', '*.old.js'),
            path.join(templatePath, 'preload.js')
        ]
    },
    plugins: [
        pluginMultiEntry(),
        pluginReplace({
            patterns: [
                {
                    match: /autoloader.js$/,
                    test: /\/\*{VIEWMODEL-IMPORTS}\*\//g,
                    replace: (function() {
                        let entries = [];
                        for (let vm of viewModels) {
                            entries.push(`import ${vm.className} from '${vm.path}';`);
                        }
                        return entries.join('\n');
                    })()
                },
                {
                    match: /autoloader.js$/,
                    test: /\/\*{VIEWMODEL-DICTIONARY-ENTRIES}\*\//g,
                    replace: (function() {
                        let entries = [];
                        for (let vm of viewModels) {
                            let dirPath = vm.path.substr(0, vm.path.length - path.basename(vm.path).length);
                            entries.push(`"${dirPath}": ${vm.className}`);
                        }
                        return entries.join(',\n    ');
                    })()
                }
            ]
        }),
        pluginSass({
            options: {
                //uncomment to include source maps.
                // outFile: 'main.css',
                // sourceMapEmbed: true,
                // sourceMap: true
            },
            output: function (styles, styleNodes) {
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

//check if the watch flag argument was provided
for (let x = 0; x < process.argv.length; x++) {
    if (process.argv[x].match(/-w|--watch/i)) {
        for (let i = 0; i < watchPaths.length; i++) {
            var wp = watchPaths[i];
            console.info(`Watching (Recursive=${!!wp.recursive}): ${wp.path}`)
            watch(wp.path, {
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
