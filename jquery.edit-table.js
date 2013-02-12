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
keyCodeList.SPACE = 32;

var setting = {};
setting.thColor = 'palegreen';

var typeName = {};
typeName.STRING = 'String';
typeName.DATE = 'Date';
typeName.NUMBER = 'Number';
typeName.SELECT = 'Select';
typeName.CHECKBOX = 'Checkbox';


var headTh;
var sideTh;
$.fn.extend({
	editTable:function(options) {
		var defaults = {
			datepicker:true,
			cannma:true,
			cellWidth:100,
			cellHeight:20
		};
		var opts = $.extend({}, defaults, options);
		setTimeout(ini, 1, this);

		function ini(obj) {
			$.each($(obj).find('td'), function(event) {
				if($(this).hasClass(typeName.STRING)) {
					setTdClickEvent(this, event, typeName.STRING);
				} else if($(this).hasClass(typeName.DATE)) {
					setTdClickEvent(this, event, typeName.DATE);
				} else if($(this).hasClass(typeName.NUMBER)) {
					setTdClickEvent(this, event, typeName.NUMBER);
				} 
			});
			$('body').click(function(event) {
				var $target = $(event.target);
				if (jQuery(':focus').val() == undefined) {
					offInput(false);
				}
			}).keydown(function() {
				return typeKey();
			});

			$('table#editTable td, table#editTable tr:nth-child(1) th').css('width', opts.cellWidth);
			$('table#editTable td').css('height', opts.cellHeight);
			$('table#editTable td.Display input:checkbox, table#editTable td.Display select').attr('disabled', 'disabled');
		};
		function setTdClickEvent(obj, event, objType) {
			$(obj).click(function(event) {
				var $target = $(event.target);
				if(!$target.is('input')) {
					offInput(true);
					$(this).addClass('onfocusCell');
					createInput($(this));
				}
				setTimeout(setOnCellTh, 1);
			});
		}
		function setOnCellTh() {
			if (!jQuery.isEmptyObject(headTh)) headTh.css('background-color', '');
			if (!jQuery.isEmptyObject(sideTh)) sideTh.css('background-color', '');
			$($('.onfocusCell').prevAll().get().reverse()).each(function() {
				$(this).css('background-color', setting.thColor);
				headTh = $(this);
				return false;
			});
			var leftNum = $('.onfocusCell').prevAll().length;
			th = $('table#editTable').find('tr:nth-child(1) th').eq(leftNum);
			th.css('background-color', setting.thColor);
			sideTh = th;
		}

		function createInput(obj) {
			var val = $(obj).text();
			jQuery('<input type="text"/>')
				.attr('id', 'inputNow')
				.appendTo($(obj).html(''));
			setInputEvent(val);
			$('#inputNow').focus();
			var len = $('#inputNow').val().length;
			document.getElementById('inputNow').setSelectionRange(len, len);
		}

		function setInputEvent(val) {
			$('#inputNow').val(val);
			if ($('.onfocusCell').hasClass(typeName.STRING)) {
				
			} else if ($('.onfocusCell').hasClass(typeName.DATE)) {
				if (opts.datepicker) {
					$('#inputNow').datepicker({dateFormat: 'yy/mm/dd'});
				}
			} else if ($('.onfocusCell').hasClass(typeName.NUMBER)) {
				$('#inputNow').val(removeComma(val));
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
		function typeKey(){
			var key = window.event.keyCode;
			if (jQuery(':focus').val() == undefined) {
				switch(key) {
					case keyCodeList.TAB:
						moveRight();
						break;
					case keyCodeList.LEFT:
						moveLeft();
						break;
					case keyCodeList.UP:
						moveUp();
						break;
					case keyCodeList.RIGHT:
						moveRight();
						break;
					case keyCodeList.DOWN:
						moveDown();
						break;
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
						break;
					default:
						break;
				}
			}

			// type data in input
			if (jQuery(':focus').val() != undefined) {
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
			}
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
			var moveFlg = false;
			if($(obj).hasClass(typeName.STRING)) {
				moveFlg = true;
			} else if($(obj).hasClass(typeName.DATE)) {
				moveFlg = true;
			} else if($(obj).hasClass(typeName.NUMBER)) {
				moveFlg = true;
			} else if($(obj).hasClass(typeName.SELECT)) {
				moveFlg = true;
			} else if($(obj).hasClass(typeName.CHECKBOX)) {
				moveFlg = true;
			}
			if (moveFlg) {
				offInput(true);
				$(obj).addClass('onfocusCell');
				setTimeout(setOnCellTh, 1);
			} 
			return moveFlg;
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
