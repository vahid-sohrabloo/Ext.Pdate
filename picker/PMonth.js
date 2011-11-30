/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @private
 * @class Ext.picker.Month
 * @extends Ext.Component
 * <p>A month picker component. This class is used by the {@link Ext.picker.Date DatePicker} class
 * to allow browsing and selection of year/months combinations.</p>
 */
Ext.define('Ext.picker.PMonth', {
	extend: 'Ext.picker.Month',
	requires: ['Ext.PDate'],
	alias: 'widget.pmonthpicker',
	alternateClassName: 'Ext.PMonthPicker',
	// private, inherit docs
	initComponent: function() {
		var me = this;
		this.callParent();
		me.activeYear = me.getYear(Ext.PDate.getFullYear(new Date()) - 4, -4);
	},
	// private, inherit docs
	onRender: function(ct, position) {

		var me = this,
		i = 0,
		months = [],
		shortName = Ext.PDate.getShortMonthName,
		monthLen = me.monthOffset;

		for (; i < monthLen; ++i) {
			months.push(shortName(i), shortName(i + monthLen));
		}

		Ext.apply(me.renderData, {
			months: months,
			years: me.getYears(),
			showButtons: me.showButtons
		});

		me.addChildEls('bodyEl', 'prevEl', 'nextEl', 'buttonsEl');

		Ext.picker.Month.superclass.onRender.apply(this, arguments);
	},
	/**
	 * Set the value for the picker.
	 * @param {Date/Array} value The value to set. It can be a Date object, where the month/year will be extracted, or
	 * it can be an array, with the month as the first index and the year as the second.
	 * @return {Ext.picker.Month} this
	 */
	setValue: function(value) {
		var me = this,
		active = me.activeYear,
		offset = me.monthOffset,
		year,
		index;

		if (!value) {
			me.value = [null, null];
		} else if (Ext.isDate(value)) {
			me.value = [Ext.PDate.getMonth(value), Ext.PDate.getFullYear(value)];
		} else {
			me.value = [value[0], value[1]];
		}

		if (me.rendered) {
			year = me.value[1];
			if (year !== null) {
				if ((year < active || year > active + me.yearOffset)) {
					me.activeYear = year - me.yearOffset + 1;
				}
			}
			me.updateBody();
		}

		return me;
	}
});