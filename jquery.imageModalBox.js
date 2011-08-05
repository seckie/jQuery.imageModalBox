/**
 * $.imageModalBox
 * using jQuery JavaScript Framework
 *
 * @author     Naoki Sekiguchi (http://likealunatic.jp)
 * @copyright  Naoki Sekiguchi (http://likealunatic.jp)
 * @license    http://www.opensource.org/licenses/mit-license.html  MIT License
 * @version    Release: 1.0
 * @update     2011-08-05 16:23:33
 */

(function($) {

$.fn.imageModalBox = function (argOptions) {
	// default options
	var options = {
		element: {},
		containerClassName: 'modal_container',
		overlayClassName: 'modal_overlay',
		sectionClassName: 'modal_section',
		headerClassName: 'modal_header',
		contentClassName: 'modal_content',
		prevNavClassName: 'modal_prev',
		nextNavClassName: 'modal_next',
		closeNavClassName: 'modal_close',
		loadingImgSrc: 'loading.gif',
		loadingImgClassName: 'modal_loading',
		maxHeight: 600
	};
	// extend default options
	$.extend(options, argOptions);
	options.element = this;
	// main object
	var imb = new ImageModalBox(options);
	// object to process each group
	imb.group = new ImageModalBoxGroup(options);
};

function ImageModalBox() {
	// extend this object with options
	$.extend(this, arguments[0]);
	// object to save ImageModalBoxGroup object
	this.group = {};
	// initialize
	this._create();
}

ImageModalBox.prototype = {
	_create: function () {
		this.isIE7 = ($.browser.msie && $.browser.version < 8);
		this.container = $('<div/>', {
				'class': this.containerClassName
			}).hide().appendTo(document.body);
		this.overlay = $('<div/>', {
				'class': this.overlayClassName
			}).hide().appendTo(document.body);
		this.closeNav = $('<div/>', {
				'class': this.closeNavClassName
			}).hide().appendTo(document.body);
		this.loadingImg = $('<img/>', {
			'src': this.loadingImgSrc,
			'class': this.loadingImgClassName
		}).hide().appendTo(document.body);

		this.element.each($.proxy(function (i, element) {
			$(element).click($.proxy(function (e) {
				this.group.imageIndex = i;
				this._openModal();
				$(document).bind('keydown', $.proxy(this._keyEventHandler, this));
				e.preventDefault();
			}, this));
		}, this));
		this.overlay.click($.proxy(function (e) {
			this._closeModal();
			e.preventDefault();
		},this));
		this.closeNav.click($.proxy(function (e) {
			this._closeModal();
		}, this));
	},

	// close modal with Esc key
	_keyEventHandler: function (e) {
		var key = e.keyCode || e.charCode;
		if (key == 27) {
			this._closeModal();
		}
	},

	_openModal: function () {
		var winWidth = $(window).width(),
			winHeight = $(window).height();
		/**
		 * delegate process to ImageModalBoxGroup object
		 */
		this.group.container = this.container;
		this.group.loadingImg = this.loadingImg;
		this.group.switchImage();

		this.container.show();
		this.closeNav.show();
		if (this.isIE7) {
			this.overlay.width(winWidth).height(winHeight).show();
		} else {
			this.overlay.width(winWidth).height(winHeight).fadeIn();
		}
	},

	_closeModal: function () {
		this.container.empty().hide();
		this.closeNav.hide();
		this.group.prevNav.hide();
		this.group.nextNav.hide();
		if (this.isIE7) {
			this.overlay.hide();
		} else {
			this.overlay.fadeOut();
		}
		$(document).unbind('keydown', $.proxy(this._keyEventHandler, this));
	}
};


function ImageModalBoxGroup() {
	// extend this object with options
	$.extend(this, arguments[0]);
	// initialize
	this._create();
}
ImageModalBoxGroup.prototype = {
	_create: function () {
		this.imageIndex = 0;
		this.sections = [];
		this.element.each($.proxy(function (i, element) {
			this.sections[i] = this._buildImageSection($(element));
		}, this));

		this.prevNav = $('<div/>', {
				'class': this.prevNavClassName
			}).click($.proxy(function (e) {
				this.imageIndex --;
				this.switchImage();
			},this)).hide().appendTo(document.body);
		this.nextNav = $('<div/>', {
				'class': this.nextNavClassName
			}).click($.proxy(function (e) {
				this.imageIndex ++;
				this.switchImage();
			},this)).hide().appendTo(document.body);
	},

	_buildImageSection: function (element) {//{{{
		var title = element.data('title') || '',
			description = element.data('description') || '',
			section = $('<div/>', {
				'class': this.sectionClassName
			}),
			header = $('<div/>', {
				'class': this.headerClassName
			}),
			// build header
			titleWrap = $('<div/>', {
				'class': 'title',
				'text': title
			}),
			descriptionWrap = $('<div/>', {
				'class': 'description',
				'text': description
			});
		this.content = $('<div/>', {
			'class': this.contentClassName
		});
		header.append(titleWrap).append(descriptionWrap);
		// return section jQuery object
		return section.append(header).append(this.content);
	},
//}}}
	_updateNav: function () {//{{{
		var lastIndex = this.sections.length - 1;
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
	},
//}}}
	switchImage: function () {
		var section = this.sections[this.imageIndex];
		this.loadingImg.show();
		/**
		 * load Image.
		 * delegate process to ImageModalBoxGroup.Item object
		 */
		this.item = new ImageModalBoxGroup.Item({
				src: $(this.element[this.imageIndex]).attr('href') || '',
				alt: $(this.element[this.imageIndex]).data('title') || '',
				maxHeight: this.maxHeight,
				loaded: $.proxy(function() {
					this.loadingImg.hide();
				}, this)
			});
		// rebuild HTML
		section.find('div.' + this.contentClassName)
			.empty().append(this.item.getImg());
		this.container.empty().append(section);
		this._updateNav();
	}
};

/**
 * each item constructor
 */
ImageModalBoxGroup.Item = function () {
	// extend this object with options
	$.extend(this, this.defaultOptions, arguments[0]);
	// initialize
	this._create();
};
ImageModalBoxGroup.Item.prototype = {
	defaultOptions: {
		src: '',
		alt: '',
		maxHeight: 0,
		loaded: function() { }
	},
	_create: function () {
		this.img = $('<img/>', {
			'src': this.src,
			'alt': this.alt
		}).css({
			'visibility': 'hidden'
		});
		this.img.load($.proxy(function (e) {
			this._load();
		}, this));
	},
	_load: function () {
		var imgWidth = $(this.img).width(),
			imgHeight = $(this.img).height();
			hvRatio = imgWidth / imgHeight;
		if (imgHeight > this.maxHeight) {
			imgHeight =  this.maxHeight;
		}
		this.loaded();
		this.img.css({
			'visibility': 'visible',
			'height': imgHeight
		});
	},
	getImg: function () {
		return this.img;
	}
};

})(jQuery);


/**
 * ToDo:
 * add effect(as fade) when switchImage().
 */

