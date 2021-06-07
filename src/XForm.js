// Universal Module Definition
(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		root.XForm = factory();
	}
} (this, function () {
	// XForm constants
	const XFORM_FORM_SELECTOR = '[data-xform]';
	const XFORM_FORM_SUBMIT = '[data-xform-submit]';
	const XFORM_FORM_RESET = '[data-xform-reset]';
	const XFORM_FORM_URL = window.location.href;
	const XFORM_FORM_METHOD = 'post';
	const XFORM_CLASSES_ENABLE = true;
	const XFORM_CLASSES_VALID = 'is-valid';
	const XFORM_CLASSES_INVALID = 'is-invalid';
	const XFORM_ITEM_DEFAULT = null;
	const XFORM_ITEM_KEY = 'name';
	const XFORM_ITEM_SELECTOR =  '[data-xform-item]';
	const XFORM_LOOKUP = {
		'file': 'files',
		'checkbox': 'checked',
		'default': 'value'
	};

	function XForm(selector = XFORM_FORM_SELECTOR, args = {}) {
		// If first argument is an object then
		// pass it as the config object and use that
		// the default selector otherwise add it to
		// the config object
		if(typeof selector === 'object') {
			args = selector;
		} else {
			args.selector = selector;
		}
		// Default config object
		const defaults = {
			selector: XFORM_FORM_SELECTOR,
			method: XFORM_FORM_METHOD,
			url: XFORM_FORM_URL,
			submit: XFORM_FORM_SUBMIT,
			reset: XFORM_FORM_RESET,
			item: {
				selector: XFORM_ITEM_SELECTOR,
				default: XFORM_ITEM_DEFAULT,
				key: XFORM_ITEM_KEY,
			},
			classes: {
				enable: XFORM_CLASSES_ENABLE,
				valid: XFORM_CLASSES_VALID,
				invalid: XFORM_CLASSES_INVALID
			}
		}
		// Merge args with default to create
		// the config object
		const config = merge(defaults, args);
		
		// Parameters
		this.config = config;
		this.data = {};
		this.formData = new FormData();
		this.items = {
			array: [],
			object: {}
		};
		this.length = 0;
		this.ready = false;
		this.form = null;
		this.submit = null;
		this.reset = null;

		// Functions
		this.init = init;
		this.check = check;
		this.$xhr = $xhr;
		this.$fetch = $fetch;

		// Return
		return this;
	}

	// Init
	function init() {
		var form = document.querySelector(this.config.selector);
		// We need a form!
		if(!form) {
			throw new Error("[XForm] Form selector missing")
		}
		// Variables
		var items = Array.from(form.querySelectorAll(this.config.item.selector));
		var submit = form.querySelector(this.config.submit);
		var reset = form.querySelector(this.config.reset);
		// Create data object
		items.forEach(item => {
			var key = item.getAttribute(this.config.item.key);
			if(!key) {
				throw new Error("[XForm] Item key missing");
			}
			this.data[key] = this.config.item.default;
			this.items.object[key] = item;
		});
		// Update
		this.form = form;
		this.submit = submit ? submit : null;
		this.reset = reset ? reset : null;
		this.items.array = items;
		this.length = this.items.array.length;
		// Return
		return this;
	}

	// Check
	function check() {
		var errors = 0;
		// Reset formData to avoid appending multiple times.
		this.formData = new FormData();
		// Loop through items
		this.items.array.forEach(item => {
			// Set key and type
			var key = item.getAttribute(this.config.item.key);
			var type = item.getAttribute('type') || 'default';
			// Throw error if no key
			if(!key) {
				throw new Error("[XForm] Item does not have a key");
			}
			// Validation
			if(!item.value || item.value == "") {
				if(item.hasAttribute('required')) {
					errors++;
					// Toggle classes to items if enabled
					if(this.config.classes.enable) {
						item.classList.add(this.config.classes.invalid);
						item.classList.remove(this.config.classes.valid);
					}
				}
			} else {
				// Add class valid and remove invalid
				// if needed and if they are enabled.
				if(this.config.classes.enable) {
					item.classList.add(this.config.classes.valid);
					item.classList.remove(this.config.classes.invalid);
				}
				// Add values to XForm Data
				var value = values(this, item, type);
				this.data[key] = value;
				// Add values to XForm FormData
				// If input is a file type then the
				// value is "files" not "value"
				if(type == 'file') {
					if(item.files.length > 0) {
						var fileList = Array.from(value);
						fileList.forEach(file => {
							this.formData.append(`${key}[]`, file);
						})
					} else {
						this.formData.append(key, null);
					}
				} else {
					this.formData.append(key, value);
				}
			}
		});
		// If no errors we are ready to submit.
		if(errors === 0) this.ready = true;
		// Return
		return this;
	}

	// Send
	function $xhr(callback) {
		// Setup XHR
		var xhr = new XMLHttpRequest();
		xhr.open(this.config.method, this.config.url, true);
		// Send data
		xhr.send(this.formData);
		// Ready state change
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4 && xhr.status === 200) {
				// Adding a Response as json object
				try {
					xhr.json = JSON.parse(xhr.responseText);
					xhr.error = false;
				} catch (error) {
					xhr.json = false;
					xhr.error = error;
				}
				// Do the callback and return it
				return callback(xhr);
			}
		};
		return;
	}

	// Javascript Fetch API wrapper with XForm data
	async function $fetch(args = {}) {
		// Default arguments nad config
		const config = merge({
			method: this.config.method || XFORM_FORM_METHOD,
			body: this.formData || null
		}, args);
		// Javascript Fetch API
		const res = await fetch(this.config.url, config);
		try {
			res.json = await res.json();
			res.error = false;
		} catch (error) {
			res.json = false;
			res.error = error;
		}
		return res;
	}

	// Utilities
	// Merge
	function merge(a, b) {
		if (Object(b) !== b) return b;
		if (Object(a) !== a) a = {};
		for (let key in b) {
			a[key] = merge(a[key], b[key]);
		}
		return a;
	}
	// Values
	function values($this, item, type) {
		if(!$this || !item || !type) return null;
		var value = $this.config.item.default;
		
		if(type === 'radio') {
			var array = Array.from($this.form.querySelectorAll(`[name="${item.name}"]`));
			item = array.find(radio => radio.checked);
		}

		value = item[XFORM_LOOKUP[type]] || item[XFORM_LOOKUP['default']];

		if(type === 'checkbox') {
			value = item.checked ? item.value : false;
		}

		return value;
	}

	// ✅ Constructor
	function constructor(selector, args) {
		return new XForm(selector, args);
	}
	
	// ✅ Exports functions
	return constructor;
}));