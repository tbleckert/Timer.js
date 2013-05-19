(function (global) {

  'use strict';
  
  global.App = new Class({
  
  	Implements: [Options, Events],
  	
  	options: {
  		timer: {},
  		keys: {
  			startStop:   'enter',
  			reset:       'r',
  			edit:        's',
  			exitEdit:    'esc',
  			modeUp:      'up',
  			modeDown:    'down',
  			toggleTheme: 't'
  		},
  		touch: {
  			startStop:   'tap',
  			edit:        'doubletap',
  			toggleMode:  'swipe',
  			toggleTheme: 'shake' // Not implemented yet
  		}
  	},
  
  	initialize: function (options) {
  		// Set options
  		this.setOptions(options);
  		
  		// Create a new timer
  		this.timer = new Timer(this.options.timer);
  		
  		// Store the main element
  		this.element = this.timer.element;
  		
  		// Setup the main view
  		this.setup();
  		
  		// Bind events
  		this.attach();
  	},
  	
  	setup: function () {
  		// Create the hidden edit element for touch devices
  		this.editElement = new Element('input', {
  			type:    'timer',
  			id:      'edit',
  			'class': 'edit',
  			value:   '00:00',
  			step:    '1'
  		});
  		
  		// Add the edit element to the main element
  		this.editElement.inject(this.element);
  		
  		// Disable text selection
  		this.element.disableSelection();
  		
  		// Enable fitText
  		this.element.fitText(0);
  		
  		// Set touch class on html
  		if (window.hasOwnProperty('ontouchstart') || navigator.msMaxTouchPoints) {
  			$$('html').addClass('touch');
  		} else {
  			$$('html').addClass('no-touch');
  		}
  		
  		// Set some useful variables
  		this.currentDirection = this.timer.get('timeDirection'); // Store for later use
  		this.currentTime      = this.timer.get('time'); // Store for later use
  		this.currentNumber    = 0; // Current number in edit
  		this.editMode         = false; // Is edit mode on?
  	},
  	
  	attach: function () {
  		var self = this;
  	
  		// Listen to keyup to manage our timer
  		document.addEvent('keyup', this.onKeyup.bind(this));
  		
  		// Handle touch tap events
  		jester(document).tap(this.onTap.bind(this));
  		
  		// Handle touch doubletap events
  		jester(document).doubletap(this.onDoubleTap.bind(this));
  		
  		// Handle touch swipe events
  		jester(document).swipe(this.onSwipe.bind(this));
  		
  		// Listen to blur and change on edit element
  		this.editElement
  			.addEvent('blur', this.stopEdit.bind(this))
  			.addEvent('change', function () {
  				self.timer.set('time', String.from(this.get('value')));
  			});
  			
  		this.timer.addEvent('change', function (what, value) {
  			if (what === 'timeDirection') {
  				this.element.set('class', 'timer ' + value);
  			}
  		}).addEvent('onTimeDecreased', function (time) {
  			var seconds = Number.from(time.seconds),
  					minutes = Number.from(time.minutes);
  			
  			if (seconds < 1 && minutes < 1) {
  				this.timer.stopTime();
  			}
  		});
  	},
  	
  	onKeyup: function (e) {
  		// Match the key against the options
  		if (e.key === this.options.keys.startStop) {
  			this.startStop();
  		} else if (e.key === this.options.keys.reset) {
  			this.timer.resetTime();
  		} else if (e.key === this.options.keys.edit) {
  			this.startEdit();
  		} else if (e.key === this.options.keys.exitEdit) {
  			this.stopEdit();
  		} else if (e.key === this.options.keys.modeUp) {
  			this.timer.set('timeDirection', 'up');
  		} else if (e.key === this.options.keys.modeDown) {
  			this.timer.set('timeDirection', 'down');
  		} else if (e.key === this.options.keys.toggleTheme) {
  			this.toggleTheme();
  		} else if (this.edit) {
  			this.editTime(e.key);
  		}
  	},
  	
  	onTap: function () {
  		var self = this;
  	
  		Object.each(this.options.touch, function (value, key) {
  			if (value === 'tap') {
  				self[key]();
  			} 
  		});
  	},
  	
  	onDoubleTap: function () {
  		var self = this;
  		
  		Object.each(this.options.touch, function (value, key) {
  			if (value === 'doubletap') {
  				self[key]();
  			} 
  		});
  	},
  	
  	onSwipe: function () {
  		var self = this;
  	
  		Object.each(this.options.touch, function (value, key) {
  			if (value === 'swipe') {
  				self[key]();
  			} 
  		});
  	},
  	
  	// Handle start and stop
  	startStop: function () {
  		if (this.editMode) {
  			return false;
  		}
  		
  		if (this.timer.isRunning) {
  			this.timer.stopTime();
  		} else {
  			this.timer.startTime();
  		}
  	},
  	
  	// Enter edit mode (key)
  	startEdit: function () {
  		this.edit = true;
  		this.timer.stopTime();
  	},
  	
  	// Exit edit mode
  	stopEdit: function () {
  		this.edit = false;
  		this.currentNumber = 0;
  	},
  	
  	// When editing
  	editTime: function (key) {
  		if (typeof(Number.from(key)) === 'number') { 
  			this.currentTime = this.timer.get('time');
  			
  			this.timer.set('time', this.currentTime.replaceAt(this.currentNumber, key));
  			
  			if (this.currentNumber === 1) {
  				this.currentNumber = 3;
  			} else if (this.currentNumber === 4) {
  				this.currentNumber = 0;
  			} else {
  				this.currentNumber += 1;
  			}
  		}
  	},
  	
  	// Edit mode (touch)
  	edit: function () {
  		if (this.edit) {
  			this.stopEdit();
  		} else {
  			this.edit = true;
  			this.currentTime = this.timer.get('time');
  			
  			this.editElement.set('value', this.currentTime).setFocus();
  		}
  	},
  	
  	// Toggle count mode (touch and click)
  	toggleMode: function () {
  		if (this.editMode) {
  			return false;
  		}
  	},
  	
  	// Toggle theme
  	toggleTheme: function () {
  		if (this.editMode) {
  			return false;
  		}
  		
  		var htmlEl = $$('html');
  		
  		if (!htmlEl.hasClass('light')[0]) {
  			htmlEl.addClass('light');
  		} else {
  			htmlEl.removeClass('light');
  		}
  	}
  
  });
	
	Element.implement({
		disableSelection: function(){
			if (this.onselectstart !== undefined) {
				this.onselectstart = function () {
					return false;
				};
			} else if (this.style.MozUserSelect !== undefined) {
				this.style.MozUserSelect = 'none';
			} else {
				this.onmousedown = function () {
					return false;
				};
			}
			
			this.style.cursor = "default";
			return this;
		}
	});
	
	Element.implement({
		setFocus: function(index) {
			this.setAttribute('tabIndex',index || 0);
			this.focus();
		}
	});
	
	String.prototype.replaceAt = function (index, char) {
		var a = this.split('');
		a[index] = char;
		
		return a.join('');
	};

})(window);