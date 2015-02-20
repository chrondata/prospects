$(document).ready(function() {
	$('#filter_state').find('option:selected').attr('selected', false);
	$('#filter_category').find('option:selected').attr('selected', false);
	var table = {
		container: $('#interactive_table_wrapper'),
		sort: 'Rank_2013',
		sortOrder: 'asc',
		noun: 'phil400_2014',
		limit: 50,
		start: 0,
		fields: ['Rank_2013','org_name', '2013_private_support_confirmed', 'percent_change', '2013_tot_income', '2013_total_expenses', '2013_fundraising', 'category', 'state', 'website', '2012_private_support_confirmed', 'footnotes_percent', 'unique_id', 'footnotes_affiliate','footnotes_capcampaign', 'footnotes_2012', 'rank_2012', 'footnotes_independentsource', '2013_prog_expenses', 'footnotes_non_cash_pct','footnotes_other']
	},
		data = {
			datalite: 'd2',
			version: 'a2',
			count: 0,
			openName: '',
			detailMax: 0,
			details: [],
			narrowbuild: false,
			detailSets: {},
			filterString: '',
			filterVal: '',
			isSearch: false,
			params: {
				'category': 'all',
				'state': 'all'
			},
			getCount: function() {
				return this.count;
			},
			fetch: function(filterIt) {
				$('.table_fail').hide();
				var that = this,
					getFilterString = function() {
						var filterArray = [];
						$('.clear_search').hide();
						if (that.filterVal !== '' && that.params.state === "all"&& that.params.category === "all") {
							filterArray.push('unique_id:' + that.filterVal + ':eq');
							$('.clear_search').show();
						} else {
							if (that.params.state !== 'all') {
								filterArray.push('state:' + that.params.state + ':eq');
								$('.clear_search').show();
							}
							if (that.params.category !== 'all') {
								filterArray.push('category:' + that.params.category + ':eq');
								$('.clear_search').show();
							}
						}
						if (filterArray.length > 0) {
							return  '/find/' + filterArray.join('|');	
						} else {
							return '';
						}
						
					},
					params = {
						'name': table.noun + 'cb' + data.version,
						'table': table.noun,
						'domain': data.datalite,
						'fields': table.fields,
						'limit': table.start + '|' + table.limit,
						'url': '',
						'sort': table.sort + ':' + table.sortOrder,
						'success': this.record,
						'noResults': data.failState
					},
					countParams = {
						name: table.noun + 'count' + data.version,
						'domain': data.datalite,
						table: table.noun + 'COUNT',
						url: '',
						'success': that.processCount
					};

				if (filterIt) {
					countParams.url = params.url = getFilterString();
				}

				table.container.removeClass('loaded');

				cheg.getData(params);
				cheg.getData(countParams);

			},
			get: function() {
					return this.raw;
			},
			record: function(json) {
				var d = data;
				d.raw = json;
				view.generate();
			},
			processCount: function(json) {
				$('.table_results').show();
				$('tbody').show();
				var d = data,
					count = json[0];
				d.count = Number(count.dracula);
				if (d.count === 0) {
					data.failState();
				}
				data.setNavPosition();
			},
			failState: function() {
				table.container.addClass('loaded');
				$('.table_fail').show();
				$('.table_results').hide();
				$('tbody').hide();
			},
			setNavPosition: function() {
				var count = this.count;
				var $wrapper = $('#interactive_table_wrapper'),
					outerBound = Math.min((table.start + (table.limit)), count),
					displayFilterString = '';
				$wrapper.find('.table_results_start').html(table.start + 1);
				$wrapper.find('.table_results_finish').html(outerBound);
				$wrapper.find('.results_num').html(String(count).addCommas());
				$wrapper.find('#filter_string').html(displayFilterString);
				$('#article-body').find('.clear_search').unbind('click').click(function(e) {
					e.preventDefault();
					data.filterString = '';
					data.filterVal = '';
					data.params.state = 'all';
					data.params.category = 'all';
					table.start = 0;
					$('#filter_state').find('option:selected').attr('selected', false);
					$('#filter_category').find('option:selected').attr('selected', false);
					data.fetch(true);
				});
				if ((table.start + table.limit) >= count) {
					$wrapper.addClass('last_page');
				} else {
					$wrapper.removeClass('last_page');
				}
				if (table.start === 0) {
					$wrapper.addClass('first_page');
				} else {
					$wrapper.removeClass('first_page');
				}
			},
			colNames: function() {
				return Object.keys(this.raw[0]);
			},
			colCount: function() {
				return Object.keys(this.raw[0]).length;
			},
			rowCount: function() {
				return this.raw.length;
			},
			raw: [],
			filters: {
				init: function() {
					var $filters = $('#table_filters').find('select');
					$filters.unbind('change').change(this.changeHandler);
				},
				changeHandler: function() {
					var $this = $(this),
						thisFilter = $this.attr('id').substr(7),
						selectedOption = $this.find('option:selected').val(),
						newValue = selectedOption;
					data.filterVal = '';
					data.filterString = '';
					data.params[thisFilter] = newValue;
					table.start = 0;
					data.fetch(true);
					ga('send', 'event', 'filter change', thisFilter);
				}
			}
		},
		view = {
			structureHtml: '',
			contentHtml: '',
			tab: 'state',
			generate: function() {
				var that = this,
					headerHtml = this.getHeader(),
					navHtml = '',
					updateRows = function() {
						that.contentHtml = that.getRows();
						that.drawRows();
					};
				navHtml = this.getNavHtml();
				this.structureHtml = navHtml + '<table class="interactive_table">' + headerHtml +
				 	'<tbody></tbody></table>';
				this.drawStructure();
				data.setNavPosition();
				updateRows();
				data.filters.init();
				menu.init();
				this.generate = updateRows;
			},
			positioner: function(val, type, id, narrow) {
				var theReturn = val,
					overWidth = $('#chartover_' + id).width(),
					overHeight = $('#chartover_' + id).height(),
					thePadding = 30;
				if (type === "y") {
					theReturn = val < (overHeight + thePadding) ? val + thePadding : val - (overHeight + thePadding);
				} else {
					if (narrow) {
						theReturn = 50;
					} else {
						if (val < overWidth + thePadding) {
							theReturn = val + thePadding;
						} else {
							theReturn = val - (overWidth + thePadding);
						}
					}
				}
				return theReturn;
			},
			getHeader: function() {
				var thead = '<thead class="headers"><tr>',
					d = data, colPosition,
					colNames = d.colNames(),
					i = 0,
					colNamesArray = ['Rank', 'Organization<span>State | Category | Website</span>', 'Total private support<span>in fiscal year 2013</span>', 'Percent change<span>from fiscal year 2012</span>', 'Total income<span>in fiscal year 2013</span>'];
					for (i; i < colNamesArray.length; i++) {
						if (i === 0) {
							colPosition = 'col_first';
						}
						thead += '<th id="col_' + colNames[i] + '" class="' + colPosition + '">' + colNamesArray[i] + '</th>';

						colPosition = '';
					}

					thead += '</tr></thead>';
				return thead;
			},
			getNavHtml: function() {
				var navHtml = '<div class="table_nav bunch"><div class="table_count"><span class="loading_indicator"><img class="loader" src="http://www.chronicle.com/img/photos/biz/icon_loader_black.gif" alt="Loading indicator" width="16" height="16" /> Loading...</span><span class="table_fail">Your selection returned no results</span><span class="table_results">Showing <span class="table_results_start">1</span>&ndash;<span class="table_results_finish">20</span> of <span class="results_num">&nbsp;</span>&nbsp;organizations</span><a class="clear_search" href="#">Clear search / filter</a></div><div class="table_btns"><a class="prev table_btn">Previous</a> <a class="next table_btn">Next</a></div></div>';
				return navHtml;
			},
			getRows: function() {
				var rowsHtml = '',
					row = 0,
					d = data,
					tableData = d.get(),
					rows = d.rowCount(),
					cols = 5,
					//d.colCount(),
					colNames = d.colNames(),
					transformData = function(d, i, rowData) {
						var displayFunction, displayValue, transformCols = {
							0: function(d) { // rank
								return d;
							},
							1: function(d) { // name (state|category)
								var fnotes1 = rowData.footnotes_affiliate ? '<sup><a href="#notes">*</a></sup>' : '',
								fnotes2 = rowData.footnotes_independentsource ? '<sup><a href="#notes">a</a></sup>' : '',
								fnotes3 = rowData.footnotes_other ? '<sup><a href="#notes">'+ rowData.footnotes_other + '</a></sup>' : '';
								return d + fnotes1 + fnotes2 + fnotes3 + "<span class='state'>" + rowData.state + " | " + rowData.category + " | <a href='" + rowData.website + "' target='_blank' class='website'>" + rowData.website + "</a></span>"; //noparans[0];
							},
							2: function(d) { // program name
								var fnote1 = rowData.footnotes_non_cash_pct ? '<sup><a href="#notes">b</a></sup>' : '',
									fnote2 = rowData.footnotes_2012 ? '<sup><a href="#notes">c</a></sup>' : '',
									fnote3 = rowData.footnotes_capcampaign ? '<sup><a href="#notes">d</a></sup>' : '',
									temp = d ? "$"+ d.addCommas(): "<span>--</span>";
								return temp + fnote1 + fnote2 + fnote3;
							},
							3: function(d) {
								var dDisplay = isNaN(parseFloat(d)) ? "<span>--</span>" : parseFloat(d) > 0 ? "+" + (parseFloat(d) * 100).toFixed(1) + "%" : (parseFloat(d) * 100).toFixed(1) + "%";
								return dDisplay;
							},
							4: function(d) { // program name
								var temp = d ? "$"+ d.addCommas(): "<span>--</span>";
								return temp;
							},
						};

						displayFunction = transformCols[i];
						displayValue = displayFunction(d);

						return displayValue;
					},
					getRowContentHtml = function(rowData) {
						var contentHtml = '',
							colName = '',
							colPosition = '';

						for (var i = 0; i < 5; i++) {
							colPosition = '';
							colName = colNames[i];

							if (i === 0) {
								colPosition = ' col_first';
							} else if (i === cols - 1) {
								colPosition = ' col_last';
							}
							contentHtml += '<td class="col_' + colName + colPosition + '">';
							contentHtml += transformData(rowData[colName], i, rowData);
							contentHtml += '</td>';
						}

						return contentHtml;
					},
					getRowHtml = function(rowData, rowNumber) {
						var rowHtml = '',
							evenOdd = 'odd',
							id = rowData.unique_id;
						if ((rowNumber + 1) % 2 === 0) {
							evenOdd = 'even';
						}

						rowHtml += '<tr id="' + id + '" class="result ' + evenOdd + '">';
						rowHtml += getRowContentHtml(rowData);
						rowHtml += '</tr><tr id="overtime' + id + '" class="overtime"><td colspan=9 class="details">' + view.getDeets(rowData) + '</td></tr>';

						return rowHtml;

					};

				for (row = 0; row < rows; row++) {
					rowsHtml += getRowHtml(tableData[row], row);
				}

				return rowsHtml;
			},
			getDeets: function(d) {
				var otherNotes = {
						'1': '<p><b>1</b>: Receiving $500-million in settlement money over five years from the 2010 Gulf of Mexico oil spill. All of the money was recorded in 2013.</p>',
						'2': '<p><b>2</b>: Previously known as Campus Crusade for Christ International</p>',
						'3':'<p><b>3</b>: Previously known as United Negro College Fund</p>',
						'4': '<p><b>4</b>: Previously known as Kids in Distressed Situations</p>',
						'5': '<p><b>5</b>: Previously known as Christian Foundation for Children and Aging</p>'
					},
					fund = d['2013_fundraising'] ? '$' + d['2013_fundraising'].addCommas() : 'N/A',
					expend = d['2013_total_expenses'] ? '$' + d['2013_total_expenses'].addCommas() : 'N/A',
					psex = d['2013_prog_expenses'] ? '$' + d['2013_prog_expenses'].addCommas() : 'N/A',
					lyprivate = d['2012_private_support_confirmed'] ? '$' + d['2012_private_support_confirmed'].addCommas() : 'N/A',
					lyrank = d.rank_2012 ? d.rank_2012 : 'Not on last year\'s list';
					note6 = d.footnotes_other ? otherNotes[d.footnotes_other] : '';
				return "<p class='deetnum'><b>Total fundraising:</b> " + fund + "</p><p class='deetnum'><b>Program service expenses:</b> " + psex + "</p><p class='deetnum'><b>Total expenses:</b> " + expend + "</p><p class='deetnum deetbreak'><b>Previous year's rank:</b> " + lyrank + "</p><p class='deetnum deetwider'><b>Previous year total private support:</b> " + lyprivate + "</p>" + note6;	
			},
			drawStructure: function() {
				table.container.html(this.structureHtml).removeClass().addClass('loaded').find('table').css({
					'width': '100%'
				}).find('thead').find('th#col_' + table.sort).addClass('sorting ' +table.sortOrder);
				nav.sort.init();
				nav.paginate.init();
			},
			drawRows: function() {
				table.container.addClass('loaded').find('tbody').html(this.contentHtml).find('tr.result').click(function() {
					var rowID = $(this).attr('id');
					if ($(this).hasClass('opened')) {
						$('tr.overtime').slideUp('fast');
						$(this).removeClass('opened');
					} else {
						$(this).addClass('opened');
						$('#overtime' + rowID).slideDown('fast');
						ga('send', 'event', 'opened_drawer', 'opened_drawer');
					} 
				});
				if (data.isSearch) {
					table.container.find('tr.result').addClass('opened');
					table.container.find('tr.overtime').show();
					data.isSearch = false;
				}
			}
		},
		nav = {
			sort: {
				init: function() {
					table.container.find('thead').find('th').unbind('click').click(this.sortHandler);
				},
				sortHandler: function() {
					var $this = $(this);
					if (!$this.hasClass('inactive')) {
						if ($this.hasClass('sorting')) {
							nav.sort.reverseOrder($this);
						} else {
							nav.sort.sortBy($this);
						}
					}
					ga('send', 'event', 'column_sort', 'sorted');
				},
				reverseOrder: function($header) {
					var newOrder = 'asc';

					if (table.sortOrder === 'asc') {
						newOrder = 'desc';
					}

					table.sortOrder = newOrder;
					table.start = 0;
					$header.removeClass('asc desc').addClass(newOrder);

					data.fetch(true);
				},
				sortBy: function($header) {
					var $headers = table.container.find('thead').find('th'),
						order = 'desc',
						id = $header.attr('id');
					if (id === 'col_org_name' || id === 'col_Rank_2013') {
						order = 'asc';
					}

					$headers.removeClass('sorting asc desc');
					$header.addClass('sorting ' + order);

					table.sort = $header.attr('id').substr(4);
					table.sortOrder = order;
					table.start = 0;

					data.fetch(true);
				}
			},
			paginate: {
				init: function() {
					var $navbar = table.container.find('.table_nav');
					$navbar.find('.table_btns').find('.table_btn').unbind('click').click(this.changePage);
				},
				changePage: function(e) {
					var $this = $(this),
						startPos = table.start;
					e.preventDefault();
					if ($this.hasClass('next')) {
						startPos += table.limit;
					} else {
						startPos -= table.limit;
					}
					if ((startPos < 0) || ($this.hasClass('next') && table.container.hasClass('last_page'))) {
						return false;
					}
					table.start = startPos;
					data.fetch(true);
					ga('send', 'event', 'page-changed', 'changed');
				}
			}
		},

			tableSearch = {
				init: function() {
					var that = this,
						getSearchData = cheg.getData({
							name: table.noun + 'search' + data.version,
							'domain': data.datalite,
							table: table.noun,
							fields: ['org_name', 'unique_id'],
							sort: 'org_name:asc',
							url: '',
							success: that.processData
						});
				},
				processData: function(json) {
					var results = tableSearch.data;

					$.each(json, function(i, result) {
						var resultObject = {
							name: result.org_name,
							value: result.unique_id
						};
						results.push(resultObject);
					});

					tableSearch.loadSearch(results);
				},
				loadSearch: function(results) {
					var $searchField = $('#search_text');

					$searchField.unbind('focus blur').fadeTo(100, 1).autoSuggest(results, {
						selectedItemProp: "name",
						searchObjProps: "name",
						minChars: 3,
						startText: "Example: united way",
						retrieveLimit: 6,
						neverSubmit: true,
						resultClick: function(theData) {
							$searchField.blur();
							$('#filter_state').find('option:selected').attr('selected', false);
							$('#filter_category').find('option:selected').attr('selected', false);
							data.params.category = "all";
							data.params.state = "all";
							tableSearch.go(theData.attributes.name, theData.attributes.value);
							ga('send', 'event', 'searched', 'searched');
						}
					}).bind('focus', function() {
						$(this).addClass('focused');
					}).bind('blur', function() {
						$(this).removeClass('focused');
					});
				},
				go: function(name, value) {
					data.filterString = name;
					data.filterVal = value;
					data.isSearch = true;
					data.fetch(true);
				},
				data: []
			},
			menu = {
				menuOffset: 0,
				init: function() {
					$(document).scroll(menu.affix);
				},
				affix: function() {
					var $statsMain = $('#interactive_table_wrapper'),
						scrollY = $(window).scrollTop(),
						maxScrollY = $statsMain.offset().top + $statsMain.height(),
						delta = scrollY - menu.menuOffset,
						$container = $('.article-body'),
						bottomOffset = 250;
					if (scrollY + bottomOffset > maxScrollY) {
						$container.removeClass('floating').addClass('overscrolled');
					} else if (delta > 0) {
						$container.removeClass('overscrolled').addClass('floating');
					} else {
						$container.removeClass('floating');
					}

				}
			};
			data.fetch(true);
			tableSearch.init();
		});