/**
 * $.imageModalBox
 * using jQuery JavaScript Framework
 *
 * @author     Naoki Sekiguchi (http://likealunatic.jp)
 * @copyright  Naoki Sekiguchi (http://likealunatic.jp)
 * @license    http://www.opensource.org/licenses/mit-license.html  MIT License
 * @version    Release: 1.0
 * @update     2011-07-19 00:20:15
 */

(function($) {

$.fn.imageModalBox = function (options) {
	this.each(function (i, element) {
		var $element = $(element);
		options.element = $element;
		options.dataSrc = $element.data('images');
		$element.data('imageModalBox', new ImageModalBox(options));
	});
};

function ImageModalBox() {
	// extend default options
	$.extend(this, this.defaultOptions, arguments[0]);
	// initialize
	this._create();
}

ImageModalBox.prototype = {
	defaultOptions: {
		dataSrc: '',
		element: {},
		containerClassName: 'modal_container',
		overlayClassName: 'modal_overlay',
		sectionClassName: 'modal_section',
		headerClassName: 'modal_header',
		contentClassName: 'modal_content',
		prevNavClassName: 'modal_prev',
		nextNavClassName: 'modal_next'
	},

	_create: function () {
		this.imageIndex = 0;
		this.container = $('div.' + this.containerClassName);
		this.overlay = $('div.' + this.overlayClassName);
		$.ajax(this.dataSrc, {
			cache: false,
			context: this,
			success: function (dataArray) {
				this.dataArray = dataArray;
				if (!this.container[0] || !this.overlay[0]) {
					this._init(dataArray);
				}
				this._buildHTML(dataArray);
			}
		});

		this.isIE7 = ($.browser.msie && $.browser.version < 8);
//        var url = this.element.attr('href');

		this.element.click($.proxy(function (e) {
			this._openModal(0);
			$(document).bind('keydown', $.proxy(this._keyEventHandler, this));
			e.preventDefault();
		}, this));
		this.overlay.click($.proxy(function (e) {
			this._closeModal();
			$(document).unbind('keydown', $.proxy(this._keyEventHandler, this));
			e.preventDefault();
		},this));
	},

	_init: function (dataArray) {
		this.container = $('<div/>', {
				'class': this.containerClassName
			}).hide()
			.append(this.header)
			.append(this.content)
			.appendTo(document.body);
		this.overlay = $('<div/>', {
				'class': this.overlayClassName
			}).hide().appendTo(document.body);
		this.prevNav = $('<div/>', {
				'class': this.prevNavClassName
			}).click($.proxy(function (e) {
				this._switchImage('prev');
			},this)).hide().appendTo(document.body);
		this.nextNav = $('<div/>', {
				'class': this.nextNavClassName
			}).click($.proxy(function (e) {
				this._switchImage('next');
			},this)).hide().appendTo(document.body);
	},

	_buildHTML: function (dataArray) {
		var section, header, content;
		this.sections = [];

		$.each(dataArray, $.proxy(function (i, data) {
			section = $('<div/>', {
				'class': this.sectionClassName
			});
			this.sections[i] = section;
			this._buildImageSection(section, data);
		}, this));
		
	},
	
	_buildImageSection: function (section, data) {
		var winWidth = $(window).width(),
			winHeight = $(window).height(),
			src = data.src,
			minWidth = data.minWidth || winWidth,
			minHeight = data.minHeight || winHeight,
			title = data.title || '',
			description = data.description || '',
			header = $('<div/>', {
					'class': this.headerClassName
			}),
			content = $('<div/>', {
					'class': this.contentClassName
			});
		if (!src) { return false; }

		// build header
		var titleWrap = $('<div/>', {
			text: title
		}),
		descriptionWrap = $('<div/>', {
			text: description
		});
		header.append(titleWrap).append(descriptionWrap);

		// done
		$(section).append(header).append(content);
	},
	
	_loadImage: function (data, wrapper) {
		// build content
		var img = $('<img/>', {
			'src': src
		}).css({
			'visibility': 'hidden'
		}).appendTo(content);
		img.load(function (e) {
console.log($(this).width());
		});
	},
	
	// close modal with Esc key
	_keyEventHandler: function (e) {
		var key = e.keyCode || e.charCode;
		if (key == 27) {
			this._closeModal();
			$(document).unbind('keydown');
		}
	},

	_openModal: function () {
		var winWidth = $(window).width(),
			winHeight = $(window).height(),
			$container = this.container;

		$container.append(this.sections[0]);
		$container.show();
		this._updateNav();
		if (this.isIE7) {
			this.overlay.width(winWidth).height(winHeight).show();
		} else {
			this.overlay.width(winWidth).height(winHeight).fadeIn();
		}
	},

	_closeModal: function () {//{{{
		this.container.empty().hide();
		this.prevNav.hide();
		this.nextNav.hide();
		if (this.isIE7) {
			this.overlay.hide();
		} else {
			this.overlay.fadeOut();
		}
	},//}}}

	_switchImage: function (direction) {//{{{
		if (direction == 'prev') {
			// prev
			this.imageIndex --;
			this.container.empty()
				.append(this.sections[this.imageIndex]);
			this._updateNav();
		} else {
			// next
			this.imageIndex ++;
			this.container.empty()
				.append(this.sections[this.imageIndex]);
			this._updateNav();
		}
	},//}}}

	_updateNav: function () {//{{{
		var lastIndex = this.dataArray.length - 1;
		if (this.imageIndex <= 0) {
			this.prevNav.hide();
		} else {
			this.prevNav.show();
		}
		if (this.imageIndex >= lastIndex) {
			this.nextNav.hide();
		} else {
			this.nextNav.show();
		}
	}//}}}
};

})(jQuery);
