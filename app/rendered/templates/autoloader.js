
// const path = require('path');
// const fs = require('fs');

//find the loading mvvm directory
//let mvvmDir = path.dirname(window.location.href.substring('file://'.length + __dirname.length + 1));
//look for a view-model.js file, if found, load and init it.
// let vmFilePath = path.join(__dirname, mvvmDir, 'view-model.js');
// if (fs.existsSync(vmFilePath)) {
//     require(vmFilePath).init();
// }

import AboutViewModel from './about/view-model.js';

AboutViewModel.init();