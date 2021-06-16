//UMD - Universal Module Definition
(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		root.XForm = factory();
	}
} (this, function () {
	// Constants
	// Constants: Config - Form
	const XFORM_FORM_SELECTOR = '[data-xform]';
	const XFORM_FORM_SUBMIT = '[data-xform-submit]';
	const XFORM_FORM_RESET = '[data-xform-reset]';
	const XFORM_FORM_URL = window.location.href;
	const XFORM_FORM_METHOD = 'post';
	const XFORM_FORM_JSON = true;
	const XFORM_FORM_JSON_ONLY = true;
	// Constants: Config - Classes
	const XFORM_CLASSES_ENABLE = true;
	const XFORM_CLASSES_VALID = 'is-valid';
	const XFORM_CLASSES_INVALID = 'is-invalid';
	// Constants: Config - Item
	const XFORM_ITEM_SELECTALL = true;
	const XFORM_ITEM_DEFAULT = null;
	const XFORM_ITEM_KEY = 'name';
	const XFORM_ITEM_SELECTOR = '[data-xform-item]';
	const XFORM_ITEM_IGNORE = '[data-xform-ignore]';
	const XFORM_ITEM_SELECT_ALL = 'input, select, textarea';
	// Constants: Functions
	const XFORM_LOOKUP = {
		'file': 'files',
		'checkbox': 'checked',
		'default': 'value'
	};
	// Constructor
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
			json: XFORM_FORM_JSON,
			jsonOnly: XFORM_FORM_JSON_ONLY,
			item: {
				selectAll: XFORM_ITEM_SELECTALL,
				selector: XFORM_ITEM_SELECTOR,
				ignore: XFORM_ITEM_IGNORE,
				key: XFORM_ITEM_KEY,
				default: XFORM_ITEM_DEFAULT,
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
		// Form selectors
		this.form = null;
		this.ready = false;
		this.submit = null;
		this.reset = null;
		// Data
		this.data = {};
		this.dataJSON = {};
		this.formData = new FormData();
		// Items
		this.items = {
			array: [],
			object: {}
		};
		this.length = 0;
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
		var itemSelector = this.config.item.selectAll ? XFORM_ITEM_SELECT_ALL : this.config.item.selector;
		var items = Array.from(form.querySelectorAll(itemSelector));
		var submit = form.querySelector(this.config.submit);
		var reset = form.querySelector(this.config.reset);
		// Create data object
		items.forEach(item => {
			// If item has attribute or class from config.item.ignore
			// we skip it
			// It's done like this because you can pass a "list"
			// in the item selector config so we can't use :not()
			// with querySelectorAll as easily as this
			if(item.hasAttribute(this.config.item.ignore.slice(1,-1)) || item.classList.contains(this.config.item.ignore)) {
				return;
			}
			// Get key
			var key = item.getAttribute(this.config.item.key);
			// No key no item
			if(!key) {
				throw new Error("[XForm] Item key missing");
			}
			// Check if there are items with the same key
			var itemArray = Array.from(form.querySelectorAll(`[${this.config.item.key}="${key}"]`));
			// Set default value for item
			this.data[key] = this.config.item.default;
			// Push to Array
			this.items.array.push(item);
			this.items.object[key] = (itemArray.length === 1) ? item : itemArray;
		});
		// Update
		this.form = form;
		this.submit = submit ? submit : null;
		this.reset = reset ? reset : null;
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
			// Get key
			var key = item.getAttribute(this.config.item.key);
			// Throw error if no key
			if(!key) {
				throw new Error("[XForm] Item does not have a key");
			}
			// Get type and value
			var type = item.getAttribute('type') || 'default';
			var value = values(this, item, type);
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
			}
			// Add values to XForm Data
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
					if(!this.config.jsonOnly) this.formData.append(key, null);
				}
			} else {
				if(!this.config.jsonOnly) this.formData.append(key, value);
			}
		});
		// Appneding it as an encoded JSON
		var dataJSON = JSON.stringify(this.data);
		this.dataJSON = dataJSON;
		this.formData.append('dataJSON', dataJSON);
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

	//#region 🧰 Utilities
	// Merge
	// This function merges like Object.assign() but works
	// for nested objects
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
		// Radio can be multiple items with the same name
		// so we have to select all of them and find the
		// checked one and get its value from it
		if(type === 'radio') {
			var array = Array.from($this.form.querySelectorAll(`[name="${item.name}"]`));
			item = array.find(radio => radio.checked);
		}
		// Get value from item or set it to item defualt value
		var value = item[XFORM_LOOKUP[type]] || item[XFORM_LOOKUP['default']];
		value = value ? value : $this.config.item.default;
		// For checkbox is it's check it's the checkbox value
		// otherwise it's false
		if(type === 'checkbox') {
			value = item.checked ? item.value : false;
		}
		// Return value
		return value;
	}
	//#endregion

	// ✅ Constructor
	function constructor(selector, args) {
		return new XForm(selector, args);
	}
	
	// ✅ Exports functions
	return constructor;
}));