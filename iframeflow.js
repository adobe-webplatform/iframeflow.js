/*!
Copyright 2014 Adobe Systems Inc.;
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/*

To use iframeflow.js, simply include the script in your page:

    <script src="/iframeflow.js"></script>

Then invoke iframeflow:

    <script>
        window.iframeflow.doc();
    </script>

You may also target iframeflow to a specific content selector.
See README for more details.

*/

(function() {
"use strict";

// If we're not running on IE, no-op	
if (navigator.userAgent.indexOf('Trident') == -1) {
	window.iframeflow = {
		doc: function() {},
		selector: function() {}
	};
	return;
}

window.iframeflow = {
	_cache: [],

	doc: function() {
		var selectorsByFlow = {};
		/*
			As we scan the document's stylesheets, three things need to happen for each rule:
			1. If -ms-flow-into isn't defined but -webkit-flow-into is, set the former to the latter
			2. Same as #1 but for -ms-flow-from
			3. Gather all the selectors for each flow name
		*/
		_forEachCSSRule(document, _onRule);

		function _onRule(r) {
			var flowInto = _getFlowInto(r);
			if (flowInto && flowInto != "none") {
				if (!selectorsByFlow[flowInto]) {
					selectorsByFlow[flowInto] = [];
				}
				selectorsByFlow[flowInto].push(r.selectorText);
			}
			_fixupFlowFrom(r);
		}

		// For each of the flow name we found, 
		// group all the selectors that flow into it and generate 
		// an iframe with the results
		var flows = Object.getOwnPropertyNames(selectorsByFlow);
		var max = flows.length;
		for (var i=0; i < max; i++) {
			this.selector(selectorsByFlow[flows[i]].join(), flows[i]);
		}
		
	},

	selector: function(select, flowName) {
		var elements = document.querySelectorAll(select);
		var max = elements.length;

		var flow = new _IEFlow(flowName);
		flow.open();
		for (var i=0; i < max; i++) {
			flow.writeElement(elements[i]);
		}
		flow.close();
	},

};

function _getFlowInto(cssRule) {
	/* If -ms-flow-into isn't defined, this falls back to 
	   the last specified -webkit-flow-into value, if any */
	var n = cssRule.style.msFlowInto;
	if (!n) {
		n = _getLastPropertyValue(cssRule.cssText, "-webkit-flow-into");
	} 

	return n;
}

function _fixupFlowFrom(cssRule) {
	/* If -ms-flow-from is undefined, fallback to 
	   -webkit-flow-from, if any */
	var n = cssRule.style.msFlowFrom;
	if (!n) {
		n = _getLastPropertyValue(cssRule.cssText, "-webkit-flow-from");
		if (n) {
			cssRule.style.msFlowFrom = n;
		}
	}

}

function _getLastPropertyValue(cssText, propertyName) {
	var pattern = propertyName+"\\s*:\\s*([A-Za-z_]?[\\w-]*)\\s*(;|})";
	var re = new RegExp(pattern, "gi");
	var value = null;
	var match;
		
	while ((match=re.exec(cssText)) !== null) {
		value = match[1];
	}

	return value;
}

function _IEFlow(flowName) {
	var _flowName = flowName;
	var _iframe = null;
	var _open = false;
	var _written = false;

	this.open = function() {
		if (_open) {
			return;
		}
		_iframe = _makeIframe();
		_iframe.style.display = "none";

		iframeflow._cache[_flowName] = this;

		_open = true;
	};

	this.close = function() {
		if (_open) {
			if (_written) {
				_cloneCSS(document, _iframe.contentDocument);

				_iframe.style.msFlowInto = flowName;
				_iframe.style.display = "inline";
			}

			_open = false;
		} else {
			console.log("[iframeflow] IEFlow is not yet open");
		}
	};

	this.writeElement = function(e) {
		if (!_written) { // First write?
			document.body.appendChild(_iframe);
			_iframe.contentDocument.open();
			_iframe.contentDocument.write("<body>");
			_iframe.contentDocument.close();
			_written = true;
		}

		var copy = _iframe.contentDocument.body.appendChild(e.cloneNode(true));
		// Since we might have set display:none on a previous pass,
		// undo style.display on the copy so we don't end up with an empty flow
		// on passes 2+
		copy.style.display = ""; 
		e.style.display = "none";
	};

	this.detach = function() {
		if (_written) {
			_iframe.parentNode.removeChild(_iframe);
		}
		iframeflow._cache[_flowName] = null;
	};

	function _makeIframe() {
		// If we are called more than once for the same flow, we 
		// clean up the result of our previous pass.
		var previous = iframeflow._cache[flowName];
		if (previous) {
			previous.detach();
		} 

		return document.createElement('iframe');
	}
}

function _cloneCSS(src, dest) {
	if (dest.styleSheets.length === 0) {
		dest.head.appendChild(dest.createElement('style'));
	}
	var destSheet = dest.styleSheets[0];

	_forEachCSSRule(src, _onRule);

	function _onRule(r) {
		destSheet.insertRule(r.cssText, destSheet.cssRules.length);	
	}

}


function _forEachCSSRule(document, callback) {
	var maxSheets = document.styleSheets.length;
	for(var i=0; i < maxSheets; i++) {
		var sheet = document.styleSheets[i];
		_forEachRule(sheet, callback);
	}

	function _forEachRule(sheet, callback) {
		var maxRules;

		try {
			maxRules = sheet.cssRules.length;
		} catch(e) {
			// Accessing cross-domain stylesheets will throw 
			// If so, move on
			return;
		}

		for(var i=0; i < maxRules; i++) {
			var rule = sheet.cssRules[i];
			if (rule.type == CSSRule.IMPORT_RULE) {
				_forEachRule(rule.styleSheet, callback);
			} else if (rule.type == CSSRule.MEDIA_RULE) {
				_forEachRule(rule, callback);
			} else {
				callback(rule);
			}
		}
	}
}

})();