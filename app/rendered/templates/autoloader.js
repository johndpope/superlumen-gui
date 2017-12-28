/*{VIEWMODEL-IMPORTS}*/

const ApplicationViewModels = {
    /* The following tag is automatically replaced by rollup with key/values of each view-model 
       detected in the "templates" directory. */
    /*{VIEWMODEL-DICTIONARY-ENTRIES}*/
};

//Perform automatic load based on URL location.
if (window.location) {
    let href = window.location.href;
    let tmpPath = 'templates/';
    let tmpIndex = href.indexOf(tmpPath);
    if (tmpIndex >= 0) {
        href = './' + href.substring(tmpIndex + tmpPath.length);
        //remove the last path segment
        href = href.substring(0, href.lastIndexOf('/') + 1);
        if (ApplicationViewModels[href] && ApplicationViewModels[href].init) {
            ApplicationViewModels[href].init();
        } else {
            console.info('No view-model found for path "' + href + '".')
        }
    }
}