/*
---
name: Scoreboard.js
description: Easy Scoreboards with notifications.

license: MIT-style

authors:
  - Tobias Bleckert

requires:
  - Core/1.4.5

provides: [Scoreboard]
...
*/

(function (global) {

	'use strict';
	
	global.Timer = new Class({
	
		Implements: [Options, Events],
		
		options: {
			element:         'timer',
			autoStart:       false,           // Auto start time or not
			secondLength:    1000,            // second length in ms
			timeDirection:   'up',            // countdown or normal
			time:            '00:00',         // used when sport is ice hockey or soccer
			animationSpeed:  300,
			duration:        3000
		},
		
		initialize: function (options) {
			// Set options
			this.setOptions(options);
			
			// Set main element
			this.element = document.id(this.options.element);
			
			// Is running?
			this.isRunning = (this.options.autoStart) ? true : false;
			
			this.build().attach();
		},
		
		attach: function () {
			this.addEvent('change', function (what, value) {
				this.getTimerElement(what).set('html', value);
			});
		
			return this;
		},
		
		detach: function () {
			return this;
		},
		
		build: function () {
			var self = this;
			
			Object.each(this.options, function (value, key) {
				self.getTimerElement(key).set('html', value);
			});
			
			if (this.options.autoStart) {
				this.startTime();
			}
			
			return this;
		},
		
		get: function (what) {
			return this.options[what];
		},
		
		set: function (what, value) {
			this.options[what] = value;
			
			this.fireEvent('change', [what, value]);
			return this;
		},
		
		startTime: function () {
			var self = this;
			
			clearInterval(this.timer);
		
			this.timer = setInterval(function () {
				if (self.options.timeDirection === 'up') {
					self.increaseTime();
				} else {
					self.decreaseTime();
				}
			}, 1 * this.options.secondLength);
			
			this.fireEvent('onStartTime');
			
			this.isRunning = true;
			
			return this;
		},
		
		stopTime: function () {
			clearInterval(this.timer);
		
			this.fireEvent('onStopTime');
			
			this.isRunning = false;
			
			return this;
		},
		
		increaseTime: function () {
			var time = this.options.time,
					seconds = Number.from(time.split(':')[1]),
					minutes = Number.from(time.split(':')[0]);
					
			seconds += 1;
			
			if (seconds >= 60) {
				seconds = 0;
				minutes += 1;
			}
			
			seconds = (seconds < 10) ? '0' + String.from(seconds) : String.from(seconds);
			minutes = (minutes < 10) ? '0' + String.from(minutes) : String.from(minutes);
			
			time = minutes + ':' + seconds;
			
			this.set('time', time);
		
			this.fireEvent('onTimeIncreased', {seconds: seconds, minutes: minutes});
			return this;
		},
		
		decreaseTime: function () {
			var time = this.options.time,
					seconds = Number.from(time.split(':')[1]),
					minutes = Number.from(time.split(':')[0]);
					
			if (seconds > 0 || minutes > 0) {
				seconds -= 1;
			}
			
			if (seconds < 0 && minutes > 0) {
				seconds = 59;
				minutes -= 1;
			}
			
			seconds = (seconds < 10) ? '0' + String.from(seconds) : String.from(seconds);
			minutes = (minutes < 10) ? '0' + String.from(minutes) : String.from(minutes);
			
			time = minutes + ':' + seconds;
			
			this.set('time', time);
			
			this.fireEvent('onTimeDecreased', {seconds: seconds, minutes: minutes});
			return this;
		},
		
		resetTime: function () {
			this.set('time', '00:00');
			this.fireEvent('onTimeReset');
			
			return this;
		},
		
		getTimerElement: function (what) {
			return this.element.getElements('[data-timer-bind="' + what + '"]');
		}
	
	});
	
}(window));