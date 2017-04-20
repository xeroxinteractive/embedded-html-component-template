# Xerox Custom HTML Component Template

This repo acts as both a base template and guidance for developing HTML components for integration into the Xerox.com Drupal instance.

Throughout you will find README.md files providing guidance for specific elements.

## Gulping

This repo is a gulp project and it provides a number of helpful commands to help you along. To get started make sure you have [Node](https://nodejs.org/en/) installed, then at the root of this project execute `npm install`. Once completed you will be able to run any of the following commands:

* `gulp lint`: Checks your javascript for syntax errors
* `gulp sass`: Compiles your SASS to CSS
* `gulp serve`: Starts a web server and opens Chrome displaying index.html. It also uses live reload so as you make sass/js/html changes it will automatically be updated in browser. If you change the path to `/index-fr-fr.html` for example you will get the localised version of your component
* `gulp dist`: Pulls together and zips all the files ready for delivery to Xerox, the file to deliver will be located in `./dist/dist.zip`

### Files/Directories

* `css/` - The sass will be compiled to css and placed in here. Do not edit in this directory as the gulp process will clean it with every build. Contib css should be placed in the contrib folder
* `dist/` - The location the dist deliverable is built
* `images/` - All your images should be placed here. Contib images should be placed in the contrib folder
* `js/` - All your javascript should be written in here.
* `sass/` - Your sass should be written in here
* `mustache/partials/component.mustache` - This should be the template for your component
* `mustache/base/head.mustache` - Add your CSS references here
* `mustache/base/foot.mustache` - Add your JS references here
* `data/` - All your JSON data to feed into mustache should be here. 
* `component-dev.*` - Ignore these files, they're there to make local development easier

### Customisations
Feel free to customise this project as you see fit, if you prefer to use less, coffeescript, typescript, whatever we're not too concerned so long as the deliverable remains to the same standard. 

A normalizer and default Xerox font styling is included in this project, we recommend keeping this during development so you have a rough idea what our base styling will be so you can override as necessary. Before delivery these references will need to be stripped out, this will be done automatically by `gulp dist` if you use it.

### `gulp dist`

The `gulp dist` task creates a zip and html file ready for uploading into Drupal. This does not change your source but it will perform the following: 

* Any nodes with the `data-xrxremove` attribute will be removed
* Relative paths will be updated from `images/foo.jpg` to `~/images/foo.jpg` to make the compatible with Drupal
* As we don't require `head`, `body`, `html` or doctype they will be removed

## General Guidance
* All components should be wrapped in [a unique class or id](https://github.com/xeroxinteractive/embedded-html-component-template/blob/master/mustache/partials/component.mustache#L1) or id referencing the agency that wrote the code allowing css to be prefixed preventing it impacting the wider site design.
* All css should [make use of the above prefix](https://github.com/xeroxinteractive/embedded-html-component-template/blob/master/sass/core.scss#L1) and should ideally be written in sass or less for easy final editing and tweaks
* Source code must be supplied. We sometimes need to make final tweaks and changes when integrating, if we’re only supplied compiled & minifed CSS and Javascript this makes it near enough impossible. 
* No inline javascript, there’s just no good reason for it. The one exception is if you need to set some javascript variables, but it must have absolutely no external dependencies and even then I would prefer simply using data attributes.
* Browser support is:
  * Windows: Chrome, Firefox, IE11 and Edge
  * Mac: Safari and Chrome
  * Android: Chrome
  * iOS: Safari
* Javascript should be wrapped in a [Self Invoking Anonymous Function](https://github.com/xeroxinteractive/embedded-html-component-template/blob/master/js/core.js#L1) to prevent pollution of the global scope. Ideally initialization should be constrained to a [single method](https://github.com/xeroxinteractive/embedded-html-component-template/blob/master/js/core.js#L5) meaning if we need to defer Initialization during integration we can do so easily from a [single point](https://github.com/xeroxinteractive/embedded-html-component-template/blob/master/js/core.js#L9). Also javascript should be written to [strict standards](https://github.com/xeroxinteractive/embedded-html-component-template/blob/master/js/core.js#L2) to force development standards. 
* Although we are currently referencing jQuery 1.10.2 you should avoid tying yourself to the 1.* branch as we will be upgrading to jQuery 2.* sometime soon.
* Must be responsive
* Ideally should render even if javascript is disabled to provide better perceived performance. Javascript is the last thing we execute in the page, meaning if your component relies on it to render it will be the last thing to be displayed
* Wherever possible CSS animations should be used over javascript animations for improved device performance.
* Ideally gulp / grunt processes should be used.
* Paths to local files should be relative and they will be converted to be Drupal compatible during the `gulp dist` process
