var keyCodeList = {};
keyCodeList.ESC = 27;
keyCodeList.TAB = 9;
keyCodeList.LEFT = 37;
keyCodeList.RIGHT = 39;
keyCodeList.UP = 38;
keyCodeList.DOWN = 40;
keyCodeList.F2 = 113;
keyCodeList.BACKSPASE = 8;
keyCodeList.DEL = 46;
keyCodeList.ENTER = 13;
keyCodeList.SLASH = 191;
keyCodeList.CODE_0 = 48;
keyCodeList.CODE_9 = 57;
keyCodeList.CODE_C = 67;
keyCodeList.CODE_V = 86;
keyCodeList.SPACE = 32;
keyCodeList.CTRL = 17;

var setting = {};
setting.thColor = 'palegreen';

var typeName = {};
typeName.STRING = 'String';
typeName.DATE = 'Date';
typeName.NUMBER = 'Number';
typeName.SELECT = 'Select';
typeName.CHECKBOX = 'Checkbox';

var isMaybeIE = (!jQuery.support.opacity) || (!jQuery.support.noCloneEvent && jQuery.support.opacity);
var headTh;
var sideTh;
var beforeKey = 0;
var cpCell;
var cpType;

$.fn.extend({
	editTable:function(options) {
		var defaults = {
			datepicker:true,
			cannma:true,
			cellWidth:0,
			cellHeight:0,
			sideHead:false
		};
		var opts = $.extend({}, defaults, options);
		setTimeout(ini, 1);

		function ini() {
			$.each($('table#editTable').find('td'), function(event) {
				if($(this).hasClass(typeName.STRING)
						|| $(this).hasClass(typeName.DATE)
						|| $(this).hasClass(typeName.NUMBER)) {
					setTdClickEvent(this, event, true);
				} else if($(this).hasClass(typeName.SELECT)
						|| $(this).hasClass(typeName.CHECKBOX)) {
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
			setStyle();
		};
		function setStyle() {
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
		}
		function isInInput(e) {
			td = $(e.target).parent().find('td');
			if(td.hasClass(typeName.STRING)
					|| td.hasClass(typeName.DATE)
					|| td.hasClass(typeName.NUMBER)) {
				return false;
			}
			return true;
		}
		function setTdClickEvent(obj, e, createInputFlg) {
			$(obj).click(function(e) {
				offInput(true);
				$(this).addClass('onfocusCell');
				setTimeout(setOnCellTh, 1);
			});
			$(obj).dblclick(function(e) {
				if (createInputFlg) createInput($(this));
			});
		}
		function setOnCellTh() {
			if (!jQuery.isEmptyObject(headTh)) headTh.css('background-color', '');
			if (!jQuery.isEmptyObject(sideTh)) sideTh.css('background-color', '');
			tds = $('.onfocusCell').prevAll();
			td = tds.eq(tds.length-1);
			td.css('background-color', setting.thColor);
			sideTh= td;

			var leftNum = tds.length;
			th = $('table#editTable').find('tr:nth-child(1) th').eq(leftNum);
			th.css('background-color', setting.thColor);
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
			if (tdObj.hasClass(typeName.STRING)) {
			} else if (tdObj.hasClass(typeName.DATE)) {
				if (opts.datepicker) {
					inputObj.datepicker({dateFormat: 'yy/mm/dd'});
				}
			} else if (tdObj.hasClass(typeName.NUMBER)) {
				inputObj.val(removeComma(inputObj.val()));
			}
		}

		function offInput(borderOffFlg) {
			var val = $('#inputNow').val();
			td = $('#inputNow').parent();
			if(td.hasClass(typeName.NUMBER)) {
				val = addComma(val);
			}
			td.text(val);
			if (borderOffFlg) { 
				$('.onfocusCell').removeClass('onfocusCell');
			}
		}
		function typeKey(e){
			var key = e.keyCode;
			if (isInInput(e)) {
				switch(key) {
					case keyCodeList.LEFT:
					case keyCodeList.RIGHT:
					case keyCodeList.UP:
					case keyCodeList.DOWN:
					case keyCodeList.BACKSPASE:
					case keyCodeList.DEL:
						break;
					case keyCodeList.ESC:
					case keyCodeList.ENTER:
						if($('.onfocusCell').hasClass(typeName.SELECT)) {
							$('.onfocusCell select').blur();
						} else {
							offInput(false);
						}
						break;
					case keyCodeList.TAB:
						moveRight();
						break;
					default:
						// check input
						var nowTd = $('#inputNow').parent();
						if(nowTd.hasClass(typeName.STRING)) {
						} else if(nowTd.hasClass(typeName.DATE)) {
							return isDate(key);
						} else if(nowTd.hasClass(typeName.NUMBER)) {
							return isNumeric(key);
						} else if(nowTd.hasClass(typeName.SELECT)) {
						} else if(nowTd.hasClass(typeName.CHECKBOX)) {
						}
						break;
				}
			} else {
				switch(key) {
					case keyCodeList.TAB:
						moveRight();
						return false;
					case keyCodeList.LEFT:
						moveLeft();
						return false;
					case keyCodeList.UP:
						moveUp();
						return false;
					case keyCodeList.RIGHT:
						moveRight();
						return false;
					case keyCodeList.DOWN:
						moveDown();
						return false;
					case keyCodeList.F2:
						if(!$('.onfocusCell').hasClass(typeName.CHECKBOX)
							&& !$('.onfocusCell').hasClass(typeName.SELECT)) {
							createInput($('.onfocusCell'));
						}
						if($('.onfocusCell').hasClass(typeName.SELECT)) {
							$('.onfocusCell select').focus();
						}
						break;
					case keyCodeList.SPACE:
					case keyCodeList.ENTER:
						if($('.onfocusCell').hasClass(typeName.CHECKBOX)) {
							$('.onfocusCell input').click();
						}
						if($('.onfocusCell').hasClass(typeName.SELECT)) {
							$('.onfocusCell select').focus();
						}
						if($('.onfocusCell').hasClass(typeName.DATE)) {
							return false;
						}
						break;
					case keyCodeList.CODE_C:
						if (beforeKey == keyCodeList.CTRL) {
							if ($('.onfocusCell').hasClass(typeName.STRING)) {
								cpCell = $('.onfocusCell').html();
								cpType = typeName.STRING;
							} else if ($('.onfocusCell').hasClass(typeName.DATE)) {
								cpCell = $('.onfocusCell').html();
								cpType = typeName.DATE;
							} else if ($('.onfocusCell').hasClass(typeName.NUMBER)) {
								cpCell = $('.onfocusCell').html();
								cpType = typeName.NUMBER;
							}
						}
						break;
					case keyCodeList.CODE_V:
						if (beforeKey == keyCodeList.CTRL && $('.onfocusCell').length > 0) {
							if (($('.onfocusCell').hasClass(typeName.STRING) && cpType == typeName.STRING)
									|| ($('.onfocusCell').hasClass(typeName.DATE) && cpType == typeName.DATE)
									|| ($('.onfocusCell').hasClass(typeName.NUMBER) && cpType == typeName.NUMBER)) {
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
			if($(obj).hasClass(typeName.STRING)
					|| $(obj).hasClass(typeName.DATE)
					|| $(obj).hasClass(typeName.NUMBER)
					|| $(obj).hasClass(typeName.SELECT)
					|| $(obj).hasClass(typeName.CHECKBOX)) {
				offInput(true);
				$(obj).addClass('onfocusCell');
				setTimeout(setOnCellTh, 1);
				return true;
			} 
			return false;
		}

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
			if (keycode >= keyCodeList.CODE_0 && keycode <= keyCodeList.CODE_9) {
				return true;
			} else {
				return false;
			}
		}
		function isDate(keycode) {
			var val = $('#inputNow').val();
			if (keycode >= keyCodeList.CODE_0 && keycode <= keyCodeList.CODE_9) {
				if (val.replace(/\//g, '').length >= 8) return false;
				return true;
			}
			if (keycode == keyCodeList.SLASH) {
				if (val.replace(/[0-9]/g, '').length >= 2) return false;
				return true;
			}
			return false;
		}
	},
	getData:function(options) {
		return '';
	}
});
