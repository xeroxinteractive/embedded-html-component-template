# Xerox Custom HTML Component Template

This repo acts as both a base template and guidance for developing HTML components for integration into the Xerox.com Drupal instance.

Throughout you will find README.md files providing guidance for specific elements.

## Gulping

This repo is a gulp project and it provides a number of helpful commands to help you along. To get started make sure you have [Node](https://nodejs.org/en/) installed, then at the root of this project execute `npm install`. Once completed you will be able to run any of the following commands:

* `gulp lint`: Checks your javascript for syntax errors
* `gulp sass`: Compiles your SASS to CSS
* `gulp server`: Starts a web server and opens Chrome displaying index.html. It also uses live reload so as you make sass/js/html changes it will automatically be updated in browser
* `gulp dist`: Pulls together and zips all the files ready for delivery to Xerox, the file to deliver will be located in `./dist/dist.zip`

### Directories

* `contrib/` - Any contrib libraries that should not be run through the gulp process such as jQuery plugins for example.
* `css/` - The sass will be compiled to css and placed in here. Do not edit in this directory as the gulp process will clean it with every build. Contib css should be placed in the contrib folder
* `dist/` - The location the dist deliverable is built
* `images/` - All your images should be placed here. Contib images should be placed in the contrib folder
* `js/` - All your javascript should be written in here. Contib javascript should be placed in the contrib folder
* `sass/` - Your sass should be written in here
* `*.html` - All your html should be at the root level

### Customisations
Feel free to customise this project as you see fit, if you prefer to use less, coffeescript, typescript, whatever we're not too concerned so long as the deliverable remains to the same standard. 

## General Guidance
* All html should be wrapped in [a unique class](https://github.com/xeroxinteractive/embedded-html-component-template/blob/master/index.html#L15) or id referencing the agency that wrote the code allowing css to be prefixed preventing it impacting the wider site design.
* All css should [make use of the above prefix](https://github.com/xeroxinteractive/embedded-html-component-template/blob/master/sass/core.scss#L1) and should ideally be written in sass or less for easy final editing and tweaks
* Source code must be supplied. We sometimes need to make final tweaks and changes when integrating, if we’re only supplied compiled & minifed CSS and Javascript this makes it near enough impossible. 
* No inline javascript, there’s just no good reason for it. The one exception is if you need to set some javascript variables, but it must have absolutely no external dependencies and even then I would prefer simply using [data attributes](https://github.com/xeroxinteractive/embedded-html-component-template/blob/master/index.html#L15)
* Browser support is:
  * Windows: Chrome, Firefox, IE11 and Edge
  * Mac: Safari and Chrome
  * Android: Chrome
  * iOS: Safari
* Javascript should be wrapped in a [Self Invoking Anonymous Function](https://github.com/xeroxinteractive/embedded-html-component-template/blob/master/js/core.js#L1) to prevent pollution of the global scope. Ideally initialization should be constrained to a [single method](https://github.com/xeroxinteractive/embedded-html-component-template/blob/master/js/core.js#L5) meaning if we need to defer Initialization during integration we can do so easily from a [single point](https://github.com/xeroxinteractive/embedded-html-component-template/blob/master/js/core.js#L9). Also javascript should be written to [strict standards](https://github.com/xeroxinteractive/embedded-html-component-template/blob/master/js/core.js#L2) to force development standards. 
* Although we are currently referencing jQuery 1.10.2 you should avoid tying yourself to the 1.* branch as we will be upgrading to jQuery 2.* sometime soon.
* Must be responsive
* Ideally should render even if javascript is disabled to provide better perceived performance. Javascript is the [last thing we execute in the page](https://github.com/xeroxinteractive/embedded-html-component-template/blob/master/index.html#L21), meaning if your component relies on it to render it will be the last thing to be displayed
* Wherever possible CSS animations should be used over javascript animations for improved device performance.
* You do not need to worry about concating or minification of CSS or Javascript, our tooling will do that on the fly. However all css and javascript must be compiled for delivery
* Ideally gulp / grunt processes should be used.
