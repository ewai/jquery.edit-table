/*
 * jQuery edit-table
 * Version Beta
 * https://github.com/ewai/jquery.edit-table
 * Copyright (c) 2013 Atsushi Iwai
 * Dual licensed under the MIT and GPL licenses.
*/
(function($) {
	var kc = {};
	kc.ESC = 27;
	kc.TAB = 9;
	kc.LEFT = 37;
	kc.RIGHT = 39;
	kc.UP = 38;
	kc.DOWN = 40;
	kc.F2 = 113;
	kc.BACKSPASE = 8;
	kc.DEL = 46;
	kc.ENTER = 13;
	kc.SLASH = 191;
	kc.CODE_0 = 48;
	kc.CODE_9 = 57;
	kc.CODE_T0 = 96;
	kc.CODE_T9 = 105;
	kc.CODE_C = 67;
	kc.CODE_V = 86;
	kc.SPACE = 32;
	kc.CTRL = 17;

	var setting = {};
	setting.thBackgroundColor = 'darkolivegreen';
	setting.thColor = 'lavender';
	var tn = {};
	tn.STRING = 'String';
	tn.DATE = 'Date';
	tn.NUMBER = 'Number';
	tn.SELECT = 'Select';
	tn.CHECKBOX = 'Checkbox';
	tn.DISPLAY = 'Display';

	var isMaybeIE = (!jQuery.support.opacity) || (!jQuery.support.noCloneEvent && jQuery.support.opacity);
	var headTh;
	var sideTh;
	var beforeKey = 0;
	var cpCell;
	var cpType;
	var header = [];

	$.fn.extend({
		editTable:function(options) {
			var defaults = {
				datepicker:true,
				comma:true,
				cellWidth:0,
				cellHeight:0,
				sideHead:false,
				headerIds:[],
				headerNames:[],
				types:[],
				datas:{},
				selects:{},
				autoRowNum:false
			};
			var opts = $.extend({}, defaults, options);
			setTimeout(ini, 1);
			function ini() {
				setDom();
				setClass();
				setData();
				setEvent();
				setStyle();
			};
			function setDom() {
				// append tbody tr
				if (!jQuery.isEmptyObject(opts.selects) && !($('table#editTable tbody').length>0)) {
					var html = '<tbody><tr>';
					$(opts.headerNames).each(function() { html += '<td></td>'; });
					html += '</tr></tbody>';
					$('table#editTable').prepend(html)
				}
				// append tbody tr
				if (!jQuery.isEmptyObject(opts.headerNames) && !($('table#editTable thead').length>0)) {
					var html = '<thead><tr>';
					$(opts.headerNames).each(function() { html += '<th></th>'; });
					html += '</tr></thead>';
					$('table#editTable').prepend(html)
				}
				// add checkbox
				$('table#editTable tbody').find('tr').each(function() {
					col = 0;
					$(this).find('td').each(function() {
						if (opts.types[col] == tn.CHECKBOX) {
							$(this).html('<input type="checkbox"/>');
						} if (opts.types[col] == tn.SELECT) {
							html = '<select>';
							html += '<option value=""></option>'; 
							$(opts.selects[col]).each(function() { 
								html += '<option value="' + this +'">' + this + '</option>'; 
							});
							html += '</select';
							$(this).html(html);
						}
						col++;
					});
				});
				// append tr
				if (!jQuery.isEmptyObject(opts.datas)) {
					var tbody = $('table#editTable tbody');
					var trs = tbody.find('tr');
					len = opts.datas.length - trs.length;
					if (len > 0) {
						clonTr = trs.eq(0).clone(false);
						for (i = 0; i < len; i++) {
							$(tbody).append('<tr>' + clonTr.html() + '</tr>');
						}
					}
				}
			}
			function setClass() {
				// add class tbody > td
				if (!jQuery.isEmptyObject(opts.types)) {
					$('table#editTable tbody tr').each(function(e) {
						col = 0;
						$(this).find('td').each(function(e) {
							$(this).addClass(opts.types[col++]);
						});
					});
				}
			}
			function setData() {
				// set thead > th
				if (!jQuery.isEmptyObject(opts.headerNames)) {
					row = 0;
					$('table#editTable thead').find('th').each(function() {
						$(this).text(opts.headerNames[row++]);
					});
				}
				// set tbody > td
				if (!jQuery.isEmptyObject(opts.datas)) {
					row = 0;
					$('table#editTable tbody').find('tr').each(function() {
						col = 0;
						$(this).find('td').each(function() {
							val = opts.datas[row][opts.headerIds[col]];
							if (opts.types[col] == tn.CHECKBOX) {
								if (val) $(this).find('input').attr('checked', true);
							} else if (opts.types[col] == tn.SELECT) {
								$(this).find('Select').val(val).find('option').each(function() {
									if ($(this).val() == val) $(this).attr('selected', 'selected')
								});
							} else if (opts.types[col] == tn.NUMBER) {
								if (opts.comma) $(this).text(addComma(val));
							} else {
								$(this).text(val);
							}
							col++;
						});
						row++;
					});
				}
			}
			function setEvent() {
				$.each($('table#editTable').find('td'), function(event) {
					if($(this).hasClass(tn.STRING)
							|| $(this).hasClass(tn.DATE)
							|| $(this).hasClass(tn.NUMBER)) {
						setTdClickEvent(this, event, true);
					} else if($(this).hasClass(tn.SELECT)
							|| $(this).hasClass(tn.CHECKBOX)) {
						setTdClickEvent(this, event, false);
					} 
				});
				$('body').click(function(e) {
					if (!isInInput(e)) {
						offInput(false);
					}
				}).keydown(function(e) {
					return typeKey(e);
				}).keyup(function(e) {
					beforeKey = 0;
					return true;
				});
				$(window).resize(function(){
					if($('.onfocusCell').length > 0) setTimeout(onFocusBorder, 1);
					if($('.onfocusCell').length > 0) setTimeout(onCopyBorder, 1);
				});
			}
			function setStyle() {
				if (opts.autoRowNum) {
					var row = 1;
					$('table#editTable tr').each(function() {
						th = $(this).find('th:first');
						if (th.length) th.before('<th class="NoHead"></td>');
						td = $(this).find('td:first');
						if (td.length) td.before('<th class="No">' + row++ + '</th>');
					});
				}
				if (opts.cellWidth != 0) {
					$('table#editTable td').css('width', opts.cellWidth);
				}
				if (opts.cellHeight != 0) {
					$('table#editTable td, table#editTable th').css('height', opts.cellHeight);
				}
				$('table#editTable td.Display input:checkbox, table#editTable td.Display select').attr('disabled', 'disabled');
				if(opts.sideHead) {
					$('table#editTable tr td:nth-child(1)').addClass('sideHead');
				}
				jQuery('<div id="focusBorder-left" class="focusBorder" />').appendTo('body').hide();
				jQuery('<div id="focusBorder-right" class="focusBorder"/>').appendTo('body').hide();
				jQuery('<div id="focusBorder-top" class="focusBorder"/>').appendTo('body').hide();
				jQuery('<div id="focusBorder-bottom" class="focusBorder"/>').appendTo('body').hide();
				jQuery('<div id="copyBorder-left" class="copyBorder"/>').appendTo('body').hide();
				jQuery('<div id="copyBorder-right" class="copyBorder"/>').appendTo('body').hide();
				jQuery('<div id="copyBorder-top" class="copyBorder"/>').appendTo('body').hide();
				jQuery('<div id="copyBorder-bottom" class="copyBorder"/>').appendTo('body').hide();
				header = opts.headerIds;
			}
			function isInInput(e) {
				td = $(e.target).parent().find('td');
				if(td.hasClass(tn.STRING)
						|| td.hasClass(tn.DATE)
						|| td.hasClass(tn.NUMBER)) {
					return false;
				}
				return true;
			}
			function setTdClickEvent(obj, e, createInputFlg) {
				if (createInputFlg) {
					$(obj).mousedown(function(e) {
						if (!isInInput(e)) {
							onFocussCell(this);
						}
					});
				} else {
					$('table#editTable Select, table#editTable input:checkbox').mousedown(function(e) {
						onFocussCell($(this).parent());
					});
				}
				$(obj).dblclick(function(e) {
					if (createInputFlg) createInput($(this));
				});
			}
			function setOnCellTh() {
				if (!jQuery.isEmptyObject(headTh)) headTh.css('background-color', '');
				if (!jQuery.isEmptyObject(sideTh)) sideTh.css('background-color', '');
				if (!jQuery.isEmptyObject(headTh)) headTh.css('color', '');
				if (!jQuery.isEmptyObject(sideTh)) sideTh.css('color', '');
				tds = $('.onfocusCell').prevAll();
				if (opts.autoRowNum) {
					td = tds.eq(tds.length-1);
					td.css('color', setting.thColor);
					td.css('background-color', setting.thBackgroundColor);
					sideTh= td;
				}
				var leftNum = tds.length;
				th = $('table#editTable').find('tr:nth-child(1) th').eq(leftNum);
				th.css('color', setting.thColor);
				th.css('background-color', setting.thBackgroundColor);
				headTh = th;
			}
			function createInput(obj) {
				var val = $(obj).text();
				jQuery('<input type="text"/>').attr('id', 'inputNow').val(val).appendTo($(obj).html(''));
				setInputEvent($('.onfocusCell'), $('#inputNow'));
				$('#inputNow').focus();
				var len = val.length;
				if(isMaybeIE){
					var range = document.selection.createRange();
					range.moveEnd('character' , len);
					range.moveStart('character', len);
					range.select();
				} else {
					document.getElementById('inputNow').setSelectionRange(len, len);
				}
			}
			function setInputEvent(tdObj, inputObj) {
				if (tdObj.hasClass(tn.STRING)) {
				} else if (tdObj.hasClass(tn.DATE)) {
					if (opts.datepicker) {
						inputObj.datepicker({dateFormat: 'yy/mm/dd'});
					}
				} else if (tdObj.hasClass(tn.NUMBER)) {
					inputObj.val(removeComma(inputObj.val()));
				}
			}
			function offInput(borderOffFlg) {
				var val = $('#inputNow').val();
				td = $('#inputNow').parent();
				if(td.hasClass(tn.NUMBER)) {
					if (opts.comma) {
						val = addComma(val);
					}
				}
				td.text(val);
				if (borderOffFlg) { 
					$('.onfocusCell').removeClass('onfocusCell');
				}
			}
			function onFocusBorder() {
				var width = $('.onfocusCell').width();
				var height = $('.onfocusCell').height();
				var ost = $('.onfocusCell').offset();
				var top = ost.top;
				var left = ost.left;
				var ost = $('.onfocusCell').offset();
				$('#focusBorder-left')
					.css('width', 0)
					.css('height', height+2)
					.css('top', top)
					.css('left', left-1)
					.show();
				$('#focusBorder-right')
					.css('width', 0)
					.css('height', height+2)
					.css('top', top)
					.css('left', left+width+4)
					.show();
				$('#focusBorder-top')
					.css('width', width+4)
					.css('height', 0)
					.css('top', top)
					.css('left', left-1)
					.show();
				$('#focusBorder-bottom')
					.css('width', width+4)
					.css('height', 0)
					.css('top', top+height+3)
					.css('left', left-1)
					.show();
			}
			function onCopyBorder() {
				var width = $('.onCopyCell').width();
				var height = $('.onCopyCell').height();
				var ost = $('.onCopyCell').offset();
				var top = ost.top;
				var left = ost.left;
				var ost = $('.onCopyCell').offset();
				$('#copyBorder-left')
					.css('width', 0)
					.css('height', height+2)
					.css('top', top)
					.css('left', left-1)
					.show();
				$('#copyBorder-right')
					.css('width', 0)
					.css('height', height+2)
					.css('top', top)
					.css('left', left+width+4)
					.show();
				$('#copyBorder-top')
					.css('width', width+4)
					.css('height', 0)
					.css('top', top)
					.css('left', left-1)
					.show();
				$('#copyBorder-bottom')
					.css('width', width+4)
					.css('height', 0)
					.css('top', top+height+3)
					.css('left', left-1)
					.show();
			}
			function onFocussCell(obj) {
				offInput(true);
				$(obj).addClass('onfocusCell');
				setTimeout(onFocusBorder, 1);
				setTimeout(setOnCellTh, 1);
			}
			function offCopyBorder() {
				$('.onCopyCell').removeClass('onCopyCell');
			}
			function typeKey(e){
				var key = e.keyCode;
				if (isInInput(e)) {
					switch(key) {
						case kc.LEFT:
						case kc.RIGHT:
						case kc.UP:
						case kc.DOWN:
						case kc.BACKSPASE:
						case kc.DEL:
							break;
						case kc.ESC:
						case kc.ENTER:
							if($('.onfocusCell').hasClass(tn.SELECT)) {
								$('.onfocusCell select').blur();
							} else {
								offInput(false);
							}
							break;
						case kc.TAB:
							moveRight();
							break;
						default:
							// check input
							var nowTd = $('#inputNow').parent();
							if(nowTd.hasClass(tn.STRING)) {
							} else if(nowTd.hasClass(tn.DATE)) {
								return isDate(key);
							} else if(nowTd.hasClass(tn.NUMBER)) {
								return isNumeric(key);
							} else if(nowTd.hasClass(tn.SELECT)) {
							} else if(nowTd.hasClass(tn.CHECKBOX)) {
							}
							break;
					}
				} else {
					switch(key) {
						case kc.ESC:
							offCopyBorder();
							$('.copyBorder').hide();
							return false;
						case kc.TAB:
							moveRight();
							return false;
						case kc.LEFT:
							moveLeft();
							return false;
						case kc.UP:
							moveUp();
							return false;
						case kc.RIGHT:
							moveRight();
							return false;
						case kc.DOWN:
							moveDown();
							return false;
						case kc.F2:
							if(!$('.onfocusCell').hasClass(tn.CHECKBOX)
								&& !$('.onfocusCell').hasClass(tn.SELECT)) {
								createInput($('.onfocusCell'));
							}
							if($('.onfocusCell').hasClass(tn.SELECT)) {
								$('.onfocusCell select').focus();
							}
							break;
						case kc.SPACE:
						case kc.ENTER:
							if($('.onfocusCell').hasClass(tn.CHECKBOX)) {
								$('.onfocusCell input').click();
							}
							if($('.onfocusCell').hasClass(tn.SELECT)) {
								$('.onfocusCell select').focus();
							}
							if($('.onfocusCell').hasClass(tn.DATE)) {
								return false;
							}
							break;
						case kc.CODE_C:
							if (beforeKey == kc.CTRL) {
								if ($('.onfocusCell').hasClass(tn.STRING)) {
									cpCell = $('.onfocusCell').html();
									cpType = tn.STRING;
								} else if ($('.onfocusCell').hasClass(tn.DATE)) {
									cpCell = $('.onfocusCell').html();
									cpType = tn.DATE;
								} else if ($('.onfocusCell').hasClass(tn.NUMBER)) {
									cpCell = $('.onfocusCell').html();
									cpType = tn.NUMBER;
								} else if ($('.onfocusCell').hasClass(tn.SELECT)) {
									cpCell = $('.onfocusCell').html();
									cpType = tn.SELECT;
								} else if ($('.onfocusCell').hasClass(tn.CHECKBOX)) {
									cpCell = $('.onfocusCell').html();
									cpType = tn.CHECKBOX;
								}
								offCopyBorder();
								$('.onfocusCell').addClass('onCopyCell');
								onCopyBorder();
							}
							break;
						case kc.CODE_V:
							if (beforeKey == kc.CTRL && $('.onfocusCell').length > 0) {
								if (($('.onfocusCell').hasClass(tn.STRING) && cpType == tn.STRING)
										|| ($('.onfocusCell').hasClass(tn.DATE) && cpType == tn.DATE)
										|| ($('.onfocusCell').hasClass(tn.NUMBER) && cpType == tn.NUMBER)
										|| ($('.onfocusCell').hasClass(tn.SELECT) && cpType == tn.SELECT)
										|| ($('.onfocusCell').hasClass(tn.CHECKBOX) && cpType == tn.CHECKBOX)) {
									$('.onfocusCell').html(cpCell);
								}
							}
							break;
						default:
							break;
					}
				}
				beforeKey = key;
				return true;
			}
			function moveRight() {
				$('.onfocusCell').nextAll().each(function() {
					if(move(this)) return false;
				});
			}
			function moveLeft() {
				$('.onfocusCell').prevAll().each(function() {
					if(move(this)) return false;
				});
			}
			function moveUp() {
				var leftNum = $('.onfocusCell').prevAll().length;
				$('.onfocusCell').parent().prevAll().each(function() {
					upTd = $(this).find('td, th').eq(leftNum);
					if(move(upTd)) return false;
				});
			}
			function moveDown() {
				var leftNum = $('.onfocusCell').prevAll().length;
				$('.onfocusCell').parent().nextAll().each(function() {
					downTd = $(this).find('td, th').eq(leftNum);
					if(move(downTd)) return false;
				});
			}
			function move(obj){
				if($(obj).hasClass(tn.STRING)
						|| $(obj).hasClass(tn.DATE)
						|| $(obj).hasClass(tn.NUMBER)
						|| $(obj).hasClass(tn.SELECT)
						|| $(obj).hasClass(tn.CHECKBOX)) {
					onFocussCell(obj);
					return true;
				} 
				return false;
			}
		},
		getJsonData:function(options) {
			var json = "[";
			var val = "";
			var row = 0;
			var col = 0;
			$('table#editTable tbody').find('tr').each(function() {
				json += '{';
				col = 0;
				$(this).find('td').each(function() {
					if($(this).hasClass(tn.STRING) 
						|| $(this).hasClass(tn.DATE)) {
						json += '"' + header[col++] + '":"' + $(this).text() + '",';
					} else if($(this).hasClass(tn.NUMBER)) {
						json += '"' + header[col++] + '":' + removeComma($(this).text()) + ',';
					} else if($(this).hasClass(tn.SELECT)) {
						json += '"' + header[col++] + '":"' + $(this).find('select').val() + '",';
					} else if($(this).hasClass(tn.CHECKBOX)) {
						if ($(this).find('input').attr('checked')) {
							json += '"' + header[col++] + '":true,';
						} else {
							json += '"' + header[col++] + '":false,';
						}
					} else if ($(this).hasClass(tn.DISPLAY)) {
						if ($(this).find('select').length > 0) {
							json += '"' + header[col++] + '":"' + $(this).find('select').val() + '",';
						} else if ($(this).find('input:checkbox').length > 0) {
							if ($(this).find('input').attr('checked')) {
								json += '"' + header[col++] + '":true,';
							} else {
								json += '"' + header[col++] + '":false,';
							}
						} else {
							json += '"' + header[col++] + '":"' + $(this).text() + '",';
						}
					}
				});
				json = json.substring(0, json.length - 1) + '},';
			});
			json = json.substring(0, json.length - 1) + "]";
			return json;
		},
		getJson:function(options) {
			return jQuery.parseJSON(this.getJsonData());
		}
	});
	function addComma(str) {
		var num = (new String(str)).replace(/,/g, '');
		while(num != (num = num.replace(/^(-?\d+)(\d{3})/, '$1,$2')));
		return num;
	}
	function removeComma(str) {
		var num = new String(str).replace(/,/g, '');
		if (num != '') {
			return new Number(num);
		} else {
			return 0;
		}
	}
	function isNumeric(keycode) {
		if ((keycode >= kc.CODE_0 && keycode <= kc.CODE_9) 
				|| (keycode >= kc.CODE_T0 && keycode <= kc.CODE_T9)) {
			return true;
		} else {
			return false;
		}
	}
	function isDate(keycode) {
		var val = $('#inputNow').val();
		if (keycode >= kc.CODE_0 && keycode <= kc.CODE_9) {
			if (val.replace(/\//g, '').length >= 8) return false;
			return true;
		}
		if (keycode == kc.SLASH) {
			if (val.replace(/[0-9]/g, '').length >= 2) return false;
			return true;
		}
		return false;
	}
})(jQuery);
