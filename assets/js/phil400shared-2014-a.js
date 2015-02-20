// Search (autosuggest.js) //
(function($){	
	$.fn.autoSuggest = function(data, options) {
		var defaults = { 
			asHtmlID: 'search_text',
			startText: "Example: university of iowa",
			emptyText: '<strong>No results found.</strong><br /><div class="label">Try rewording your search.</div>',
			preFill: {},
			limitText: "No More Selections Are Allowed",
			selectedItemProp: "value", //name of object property
			selectedValuesProp: "value", //name of object property
			searchObjProps: "value", //comma separated list of object property names
			queryParam: "q",
			retrieveLimit: false, //number for 'limit' param on ajax request
			extraParams: "",
			matchCase: false,
			minChars: 1,
			keyDelay: 400,
			resultsHighlight: true,
			neverSubmit: true,
			selectionLimit: false,
			showResultList: true,
			start: function(){},
			selectionClick: function(elem){},
			selectionAdded: function(elem){},
			selectionRemoved: function(elem){ elem.remove(); },
			formatList: function(data, elem){
				var new_elem = elem.html(data.name);//+"<span style='font: 10px arial'> | "+identifier+"</span>");
				return new_elem;
			},
			beforeRetrieve: function(string){ return string; },
			retrieveComplete: function(data){ return data; },
			resultClick: function(data){ },
			resultsComplete: function(){}
		};  
	 	var opts = $.extend(defaults, options);	 	
		var d_type = "object";
		var d_count = 0;
		if (typeof data == "string") {
			d_type = "string";
			var req_string = data;
		} else {
			var org_data = data;
			for (k in data) if (data.hasOwnProperty(k)) d_count++;
		}
		if ((d_type == "object" && d_count > 0) || d_type == "string"){
			return this.each(function(x){
			if (!opts.asHtmlID){
				x = x+""+Math.floor(Math.random()*100); //this ensures there will be unique IDs on the page if autoSuggest() is called multiple times
				var x_id = "as-input-"+x;
			} else {
				x = opts.asHtmlID;
				var x_id = x;
			}
			opts.start.call(this);
			var input = $(this);
			input.attr("autocomplete","off").addClass("as-input").attr("id",x_id).val(opts.startText);
			var input_focus = false;
			input.wrap('<ul class="as-selections" id="as-selections-'+x+'"></ul>').wrap('<li class="as-original" id="as-original-'+x+'"></li>');
			var selections_holder = $("#as-selections-"+x);
			var org_li = $("#as-original-"+x);				
			var results_holder = $('<div class="as-results" id="as-results-'+x+'"></div>').hide();
			var results_ul =  $('<ul class="as-list"></ul>');
			var values_input = $('<input type="hidden" class="as-values" name="as_values_'+x+'" id="as-values-'+x+'" />');
			var prefill_value = "";
			if (typeof opts.preFill == "string"){
				var vals = opts.preFill.split(",");					
				for (var i=0; i < vals.length; i++){
					var v_data = {};
					v_data[opts.selectedValuesProp] = vals[i];
					if (vals[i] != ""){
						add_selected_item(v_data, "000"+i);	
					}		
				}
				prefill_value = opts.preFill;
			} else {
				prefill_value = "";
				var prefill_count = 0;
				for (k in opts.preFill) if (opts.preFill.hasOwnProperty(k)) prefill_count++;
					if (prefill_count > 0){
						for (var i=0; i < prefill_count; i++){
							var new_v = opts.preFill[i][opts.selectedValuesProp];
							if (new_v == undefined){ new_v = ""; }
								prefill_value = prefill_value+new_v+",";
								if (new_v != ""){
									add_selected_item(opts.preFill[i], "000"+i);	
								}		
							}
						}
					}
					if (prefill_value != ""){
						input.val("");
						var lastChar = prefill_value.substring(prefill_value.length-1);
						if (lastChar != ","){ prefill_value = prefill_value+","; }
						values_input.val(","+prefill_value);
						$("li.as-selection-item", selections_holder).addClass("blur").removeClass("selected");
					}
					input.after(values_input);
					selections_holder.click(function(){
					input_focus = true;
					input.focus();
				}).mousedown(function(){ input_focus = false; }).after(results_holder);	
				var timeout = null;
				var prev = "";
				var totalSelections = 0;
				var tab_press = false;
				input.focus(function(){			
					if ($(this).val() == opts.startText && values_input.val() == ""){
						$(this).val("");
					} else if(input_focus){
						$("li.as-selection-item", selections_holder).removeClass("blur");
						if ($(this).val() != ""){
							results_ul.css("width",selections_holder.outerWidth());
							results_holder.show();
						}
					}
					input_focus = true;
					return true;
				}).blur(function(){
					if ($(this).val() == "" && values_input.val() == "" && prefill_value == ""){
						$(this).val(opts.startText);
					} else if (input_focus){
						$("li.as-selection-item", selections_holder).addClass("blur").removeClass("selected");
						results_holder.hide();
					}				
				}).keydown(function(e) {
					lastKeyPressCode = e.keyCode;
					first_focus = false;
					switch(e.keyCode) {
						case 38: // up
							e.preventDefault();
							moveSelection("up");
							break;
						case 40: // down
							e.preventDefault();
							moveSelection("down");
							break;
						case 8:  // delete
							if(input.val() == ""){							
								var last = values_input.val().split(",");
								last = last[last.length - 2];
								selections_holder.children().not(org_li.prev()).removeClass("selected");
								if(org_li.prev().hasClass("selected")){
									values_input.val(values_input.val().replace(","+last+",",","));
									opts.selectionRemoved.call(this, org_li.prev());
								} else {
									opts.selectionClick.call(this, org_li.prev());
									org_li.prev().addClass("selected");		
								}
							}
							if(input.val().length == 1){
								results_holder.hide();
								 prev = "";
							}
							if($(":visible",results_holder).length > 0){
								if (timeout){ clearTimeout(timeout); }
								timeout = setTimeout(function(){ keyChange(); }, opts.keyDelay);
							}
							break;
						case 13: // return
							tab_press = false;
							var active = $("li.active:first", results_holder);
							if(active.length > 0){
								active.click();
								results_holder.hide();
							}
							if(opts.neverSubmit || active.length > 0){
								e.preventDefault();
							}
							break;
						default:
							if(opts.showResultList){
								if(opts.selectionLimit && $("li.as-selection-item", selections_holder).length >= opts.selectionLimit){
									results_ul.html('<li class="as-message">'+opts.limitText+'</li>');
									results_holder.show();
								} else {
									if (timeout){ clearTimeout(timeout); }
									timeout = setTimeout(function(){ keyChange(); }, opts.keyDelay);
								}
							}
							break;
					}
				});
		
				function keyChange() {
					// ignore if the following keys are pressed: [del] [shift] [capslock]
					if( lastKeyPressCode == 46 || (lastKeyPressCode > 8 && lastKeyPressCode < 32) ){ return results_holder.hide(); }
					var string = input.val().replace(/[\\]+|[\/]+/g,"");
					if (string == prev) return;
					prev = string;
					if (string.length >= opts.minChars) {
						selections_holder.addClass("loading");
						if(d_type == "string"){
							var limit = "";
							if(opts.retrieveLimit){
								limit = "&limit="+encodeURIComponent(opts.retrieveLimit);
							}
							if(opts.beforeRetrieve){
								string = opts.beforeRetrieve.call(this, string);
							}
							$.getJSON(req_string+"?"+opts.queryParam+"="+encodeURIComponent(string)+limit+opts.extraParams, function(data){ 
								d_count = 0;
								var new_data = opts.retrieveComplete.call(this, data);
								for (k in new_data) if (new_data.hasOwnProperty(k)) d_count++;
								processData(new_data, string); 
							});
						} else {
							if(opts.beforeRetrieve){
								string = opts.beforeRetrieve.call(this, string);
							}
							processData(org_data, string);
						}
					} else {
						selections_holder.removeClass("loading");
						results_holder.hide();
					}
				}
				var num_count = 0;
				function processData(data, query){
					if (!opts.matchCase){ query = query.toLowerCase(); }
					var matchCount = 0;
					results_holder.html(results_ul.html("")).hide();
					for(var i=0;i<d_count;i++){				
						var num = i;
						num_count++;
						var forward = false;
						if(opts.searchObjProps == "value") {
							var str = data[num].value;
						} else {	
							var str = "";
							var names = opts.searchObjProps.split(",");
							for(var y=0;y<names.length;y++){
								var name = $.trim(names[y]);
								str = str+data[num][name]+" ";
							}
						}
						if(str){
							if (!opts.matchCase){ str = str.toLowerCase(); }				
							if(str.search(query) != -1 && values_input.val().search(","+data[num][opts.selectedValuesProp]+",") == -1){
								forward = true;
							}	
						}
						if(forward){
							var formatted = $('<li class="as-result-item" id="as-result-item-'+num+'"></li>').click(function(){
									var raw_data = $(this).data("data");
									var number = raw_data.num;
									if($("#as-selection-"+number, selections_holder).length <= 0 && !tab_press){
										var data = raw_data.attributes;
										input.val("").focus();
										prev = "";
										add_selected_item(data, number);
										opts.resultClick.call(this, raw_data);
										results_holder.hide();
									}
									tab_press = false;
								}).mousedown(function(){ input_focus = false; }).mouseover(function(){
									$("li", results_ul).removeClass("active");
									$(this).addClass("active");
								}).data("data",{attributes: data[num], num: num_count});
							var this_data = $.extend({},data[num]);
							if (!opts.matchCase){ 
								var regx = new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + query + ")(?![^<>]*>)(?![^&;]+;)", "gi");
							} else {
								var regx = new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + query + ")(?![^<>]*>)(?![^&;]+;)", "g");
							}
							
							if(opts.resultsHighlight){
								this_data[opts.selectedItemProp] = this_data[opts.selectedItemProp].replace(regx,"<em>$1</em>");
							}
							if(!opts.formatList){
								formatted = formatted.html(this_data[opts.selectedItemProp]);
							} else {
								formatted = opts.formatList.call(this, this_data, formatted);	
							}
							results_ul.append(formatted);
							delete this_data;
							matchCount++;
							if(opts.retrieveLimit && opts.retrieveLimit == matchCount ){ break; }
						}
					}
					selections_holder.removeClass("loading");
					if(matchCount <= 0){
						results_ul.html('<li class="as-message">'+opts.emptyText+'</li>');
					}
					results_ul.css("width", selections_holder.outerWidth());
					results_holder.show();
					opts.resultsComplete.call(this);
					moveSelection("down");
				}
				function add_selected_item(data, num){
				}
				function moveSelection(direction){
					if($(":visible",results_holder).length > 0){
						var lis = $("li", results_holder);
						if(direction == "down"){
							var start = lis.eq(0);
						} else {
							var start = lis.filter(":last");
						}					
						var active = $("li.active:first", results_holder);
						if(active.length > 0){
							if(direction == "down"){
							start = active.next();
							} else {
								start = active.prev();
							}	
						}
						lis.removeClass("active");
						start.addClass("active");
					}
				}							
			});
		}

	}
})(jQuery);

/* Utilities */

var cheg = cheg || { };

cheg.getData = function(request){
		var domain,
			instance = "q",
			countString = "",
			fieldText = "",
			limitText = "",
			sortText = "",
			keyText = "",
			getFieldString = function(fields) { // field strings can either be in an array or values in a simple object
				var fieldString = '/fields/',
					fieldValues = '',
					j;

				if (jQuery.isArray(fields)) { // if array, read the array values into the string
					fieldValues = fields.join('|');
					fieldString += fieldValues;
				} else if (fields instanceof Object) { // if object, read the object values into the string
					for (var field in request.fields) {
						if (request.fields.hasOwnProperty(field)) {
							var val = request.fields[field];

							if (val !== '') {
								fieldString += val + '|'
							}
						}
					}
					fieldString = fieldString.substr(0, fieldText.length - 1); // remove trailing '|'
				} else {
					return '';
				}

				return fieldString;
			};
			
		// required paramaters
		if (!request.name) {
			log('Missing data request name (name parameter). Cancelling data request.');
			return false;
		}
		
		if (!request.table) {
			log('Please specify a Datalite table (table parameter). Cancelling data request.');
			return false;
		}

		// optional parameters 
		request.success = request.success || log;
		request.noResults = request.noResults || log;
		request.tooManyResults = request.tooManyResults || log;
		request.url = request.url || "";
		request.jsonCallback = request.name + 'CB';
		request.isCount = request.isCount || false;
		request.successParam = request.successParam || undefined;
		request.cache = request.cache || true;
		
		if (request.fields) {			
			fieldText = getFieldString(request.fields);
		}

		if (request.limit) {
			limitText = 'limit/' + request.limit + '';
		}
		
		if (request.sort) {
			sortText = '/order/' + request.sort;
		}
		
		if (request.domain === 'd1') {
			domain = "//d0.chronicle.com";
			keyText = '/k/CDA786FC8DA1FB138AF5CBE74EA75/';
		 } else {
		 			domain = "/transport/?url=datalite";
		 		}
		
		if (request.isCount) {
			request.table += 'COUNT';
		}

		var loadJsonReq = $.ajax({
			type: "GET",
			url: domain + "/" + instance + "/bo/public/" + keyText + "format/jsonp/name/" + request.table + "/" + limitText + sortText + fieldText + request.url + "/callback/" + request.jsonCallback,
			dataType: "jsonp",
			cache: request.cache,
			jsonpCallback: request.jsonCallback,
			success: function(json){
				if (json.error) {
					switch (json.error) {
						case 'No Results!':
							request.noResults(json);
							break;
						case 'Too Many Results!':
							request.tooManyResults(json);
							break;
						default: 
							log('Unknown Datalite error. Log of returned data follows.', json);
							break;
					}
					return false;
				}

				if (request.successParam) {
					request.success(json, request.successParam);
				} else {
					request.success(json);
				}
			},
			error: function(a,b,c){
				var theStatus = a.status;
				log('Data error: ' + request.name, a, b, theStatus);
			}
		});
	};

cheg.states = {
	full: {
		'ak': 'Alaska',
		'al': 'Alabama',
		'ar': 'Arkansas',
		'az': 'Arizona',
		'ca': 'California',
		'co': 'Colorado',
		'ct': 'Connecticut',
		'de': 'Delaware',
		'dc': 'District of Columbia',
		'fl': 'Florida',
		'ga': 'Georgia',
		'hi': 'Hawaii',
		'id': 'Idaho',
		'ia': 'Iowa',
		'in': 'Indiana',
		'il': 'Illinois',
		'ks': 'Kansas',
		'ky': 'Kentucky',
		'la': 'Louisiana',
		'ma': 'Massachusetts',
		'md': 'Maryland',
		'me': 'Maine',
		'mi': 'Michigan',
		'mn': 'Minnesota',
		'mp': 'Northern Mariana Islands',
		'ms': 'Mississippi',
		'mo': 'Missouri',
		'mt': 'Montana',
		'nc': 'North Carolina',
		'nd': 'North Dakota',
		'ne': 'Nebraska',
		'nh': 'New Hampshire',
		'nj': 'New Jersey',
		'nm': 'New Mexico',
		'nv': 'Nevada',
		'ny': 'New York',
		'oh': 'Ohio',
		'ok': 'Oklahoma',
		'or': 'Oregon',
		'pa': 'Pennsylvania',
		'pr': 'Puerto Rico',
		'ri': 'Rhode Island',
		'sc': 'South Carolina',
		'sd': 'South Dakota',
		'tn': 'Tennessee',
		'tx': 'Texas',
		'ut': 'Utah',
		'va': 'Virginia',
		'vi':'Virgin Islands',
		'vt': 'Vermont',
		'wa': 'Washington',
		'wi': 'Wisconsin',
		'wv': 'West Virginia',
		'wy': 'Wyoming'
	},
	code: {
		'alaska':'ak',
		'alabama':'al',
		'arkansas':'ar',
		'arizona':'az',
		'california':'ca',
		'colorado':'co',
		'connecticut':'ct',
		'delaware':'de',
		'districtofcolumbia':'dc',
		'florida':'fl',
		'georgia':'ga',
		'hawaii':'hi',
		'idaho':'id',
		'iowa':'ia',
		'indiana':'in',
		'illinois':'il',
		'kansas':'ks',
		'kentucky':'ky',
		'louisiana':'la',
		'massachusetts':'ma',
		'maryland':'md',
		'maine':'me',
		'michigan':'mi',
		'minnesota':'mn',
		'mississippi':'ms',
		'missouri':'mo',
		'montana':'mt',
		'northcarolina':'nc',
		'northdakota':'nd',
		'nebraska':'ne',
		'newhampshire':'nh',
		'newjersey':'nj',
		'newmexico':'nm',
		'nevada':'nv',
		'newyork':'ny',
		'ohio':'oh',
		'oklahoma':'ok',
		'oregon':'or',
		'pennsylvania':'pa',
		'puertorico': 'pr',
		'rhodeisland':'ri',
		'southcarolina':'sc',
		'southdakota':'sd',
		'tennessee':'tn',
		'texas':'tx',
		'utah':'ut',
		'virginia':'va',
		'vermont':'vt',
		'washington':'wa',
		'wisconsin':'wi',
		'westvirginia':'wv',
		'wyoming':'wy'
	}
}

/////LOG
// usage: log('inside coolFunc',this,arguments);
// http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log=function(){log.history=log.history||[];log.history.push(arguments);if(this.console){console.log(Array.prototype.slice.call(arguments))}};



/* 
 * To Title Case 2.0.1 Ð http://individed.com/code/to-title-case/
 * Copyright © 2008Ð2012 David Gouch. Licensed under the MIT License. 
 */

String.prototype.toTitleCase = function () {
  var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|of|on|or|the|to|vs?\.?|via)$/i;

  return this.replace(/([^\W_]+[^\s-]*) */g, function (match, p1, index, title) {
    if (index > 0 && index + p1.length !== title.length &&
      p1.search(smallWords) > -1 && title.charAt(index - 2) !== ":" && 
      title.charAt(index - 1).search(/[^\s-]/) < 0) {
      return match.toLowerCase();
    }

    if (p1.substr(1).search(/[A-Z]|\../) > -1) {
      return match;
    }

    return match.charAt(0).toUpperCase() + match.substr(1);
  });
};

String.prototype.addCommas = function()
{
	
	var nStr = this;
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	
	return x1 + x2;
};

String.prototype.addRank = function() { // rewrite to optimize if/switch statements
	var str = this;
	var lastChar = str.charAt(str.length - 1);
	
	if (str == '11' || str == '12' || str == '13') {
		return str + 'th';
	} else if (lastChar == '1') {
		return str + 'st';
	} else if (lastChar == '2') {
		return str + 'nd';
	} else if (lastChar == '3') {
		return str + 'rd';
	} else {	
		return str + 'th';
	}
};

// add object keys support for Non EMCA5 browsers (IE8, FF3.6, etc)
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys

if (!Object.keys) {
  Object.keys = (function () {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length

    return function (obj) {
      if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) throw new TypeError('Object.keys called on non-object')

      var result = []

      for (var prop in obj) {
        if (hasOwnProperty.call(obj, prop)) result.push(prop)
      }

      if (hasDontEnumBug) {
        for (var i=0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i])
        }
      }
      return result
    }
  })()
};