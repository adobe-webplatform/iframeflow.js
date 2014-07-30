iframeflow.js
===========

iframeflow.js lets you use CSS Regions content written for WebKit browsers in 
Internet Explorer 10 or later.

## Why
IE supports an earlier version of the [CSS Regions][css-regions] specification, with a quirk: the flow-into property only applies to iframe elements.

iframeflow.js allows you to use the same regions content you built for Safari 7+ and use it as-is in IE10+.

## Using iframeflow.js

To use iframeflow, simply include the script in your page.
   
    <script src='/iframeflow.js'></script>

You then have two options to invoke iframeflow. 

### window.iframeflow.doc()

The `window.iframeflow.doc()` method is the simplest way to use iframeflow. It will scan your document's CSS and generate an iframe populated with the relevant content for each named flow it finds.

### window.iframeflow.selector(query, flowName)

The `window.iframeflow.selector()` method allows you to select content using an arbitrary selector and give it the specified flow name. Under the covers, iframeflow.js will copy the selected elements to a new iframe and set the `-ms-flow-into` of this iframe to the specified name.


### Handling document updates

iframeflow.js does not automatically detect updates to named flow content. It is up to the author to call `window.iframeflow.doc()` or `window.iframeflow.selector()` whenever necessary. iframeflow.js will ensure existing iframes are re-created with the new content.

### -webkit-flow* vs. -ms-flow*

If no -ms-flow* properties are defined, iframeflow.js will automatically convert any specified -webkit-flow-into or -webkit-flow-from properties to their -ms prefixed equivalents. This ensures existing content written for WebKit requires no CSS editing.

## Building iframeflow.js

To edit and build your own version of the polyfill, you will need [node][node], [npm][npm], and [grunt][grunt]. To build:

1. Clone the source code
2. Enter the source directory
3. Run `npm install`
4. Run `grunt build`

If you are successful, you should see a `iframeflow.js` and `iframeflow.min.js` in your source directory.


## Known Limitations & Issues

* Flow names with non-ASCII or escape characters are currently ignored.
* iframeflow.js does not currently scan style attributes for flow-into/flow-from properties.
* iframeflow.doc() cannot scan cross-domain stylesheets for named flows. 
* Since the elements in a named flow are copied to a separate iframe document, any styling applied to them based on their ancestor(s) will be lost. 
* This version of iframeflow.js lets IE's engine handle all the layout work and limits itself to DOM node creation and cloning. It must be noted that iframeflow.js copies your named flows' content to new iframe documents. A future update may allow the content to be moved to the iframe instead.
* Named flows definitions are gathered across all media queries, whether they match or not. If different breakpoints assign different content to the same flow name, iframeflow.js will populate a single iframe with all the different flows. A future update may fix this issue.

## Browser Support

This library targets Internet Explorer 10 and later. It has not effect in other browsers.

## Feedback

Please let us know if you have any feedback. If you run into any problems, you can file a [new issue][new-issue]. You can also reach us [@adobeweb][twitter].

[css-regions]: http://www.w3.org/TR/css3-regions/
[node]: http://nodejs.org
[npm]: http://www.npmjs.org
[grunt]: http://gruntjs.com
[new-issue]: https://github.com/adobe-webplatform/css-shapes-polyfill/issues/new
[twitter]: http://twitter.com/adobeweb

