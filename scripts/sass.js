const fs = require('fs');
const path = require('path');
const sass = require('node-sass');
const watch = require('node-watch');

//theme paths (relative to this script file).
let themes = [
    {
        sass: '../app/assets/scss/dark/main.scss',
        css: '../app/assets/css/theme-dark.css'
    },
    {
        sass: '../app/assets/scss/light/main.scss',
        css: '../app/assets/css/theme-light.css'
    }
];
//paths to watch for *.css or *.scss changes.
let watchPaths = [
    { path: '../app/assets/scss', recursive: true },
    { path: '../app/mvvm', recursive: true }
]
let scriptPath = path.dirname(require.main.filename);

function compile(theme) {
    let outputFilePath = path.resolve(path.join(scriptPath, theme.css));
    sass.render({
        file: path.resolve(path.join(scriptPath, theme.sass)),
        outFile: outputFilePath,
        omitSourceMapUrl: true,
        outputStyle: 'expanded'
    }, function (err, result) {
        if (err) {
            console.error(err);
        } else {
            fs.writeFile(outputFilePath, result.css, function (err) {
                if (err) {
                    console.error(err);
                }
                console.info(`SASS compiled ${result.stats.entry} OK.`);
            });
        }
    });
};

function compileThemes() {
    for (let x = 0; x < themes.length; x++) {
        compile(themes[x]);
    }
};

compileThemes();

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
                if (name.match(/(?:\.css|\.scss|\.sass)$/i)) {
                    console.info('Change detected. Re-compiling SASS...');
                    compileThemes();
                }
            });
        }
    }
};
