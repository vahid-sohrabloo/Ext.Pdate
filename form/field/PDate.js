/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.form.field.Date
 * @extends Ext.form.field.Picker

Provides a date input field with a {@link Ext.picker.Date date picker} dropdown and automatic date
validation.

This field recognizes and uses the JavaScript Date object as its main {@link #value} type. In addition,
it recognizes string values which are parsed according to the {@link #format} and/or {@link #altFormats}
configs. These may be reconfigured to use date formats appropriate for the user's locale.

The field may be limited to a certain range of dates by using the {@link #minValue}, {@link #maxValue},
{@link #disabledDays}, and {@link #disabledDates} config parameters. These configurations will be used both
in the field's validation, and in the date picker dropdown by preventing invalid dates from being selected.
{@img Ext.form.Date/Ext.form.Date.png Ext.form.Date component}
#Example usage:#

    Ext.create('Ext.form.Panel', {
        width: 300,
        bodyPadding: 10,
        title: 'Dates',
        items: [{
            xtype: 'datefield',
            anchor: '100%',
            fieldLabel: 'From',
            name: 'from_date',
            maxValue: new Date()  // limited to the current date or prior
        }, {
            xtype: 'datefield',
            anchor: '100%',
            fieldLabel: 'To',
            name: 'to_date',
            value: new Date()  // defaults to today
        }],
            renderTo: Ext.getBody()
    });

#Date Formats Examples#

This example shows a couple of different date format parsing scenarios. Both use custom date format
configurations; the first one matches the configured `format` while the second matches the `altFormats`.

    Ext.create('Ext.form.Panel', {
        renderTo: Ext.getBody(),
        width: 300,
        bodyPadding: 10,
        title: 'Dates',
        items: [{
            xtype: 'datefield',
            anchor: '100%',
            fieldLabel: 'Date',
            name: 'date',
            // The value matches the format; will be parsed and displayed using that format.
            format: 'm d Y',
            value: '2 4 1978'
        }, {
            xtype: 'datefield',
            anchor: '100%',
            fieldLabel: 'Date',
            name: 'date',
            // The value does not match the format, but does match an altFormat; will be parsed
            // using the altFormat and displayed using the format.
            format: 'm d Y',
            altFormats: 'm,d,Y|m.d.Y',
            value: '2.4.1978'
        }]
    });

 * 
 * @markdown
 * @docauthor Jason Johnston <jason@sencha.com>
 */
Ext.define('Ext.form.field.PDate', {
    extend:'Ext.form.field.Date',
    alias: 'widget.pdatefield',
    requires: ['Ext.picker.PDate'],
    alternateClassName: ['Ext.form.PDateField', 'Ext.form.PDate'],

    format : "Y/m/d",
    startDay: 6,
    
    /**
     * Sets the value of the date field.  You can pass a date object or any string that can be
     * parsed into a valid date, using <tt>{@link #format}</tt> as the date format, according
     * to the same rules as {@link Ext.Date#parse} (the default format used is <tt>"m/d/Y"</tt>).
     * <br />Usage:
     * <pre><code>
//All of these calls set the same date value (May 4, 2006)

//Pass a date object:
var dt = new Date('5/4/2006');
dateField.setValue(dt);

//Pass a date string (default format):
dateField.setValue('05/04/2006');

//Pass a date string (custom format):
dateField.format = 'Y-m-d';
dateField.setValue('2006-05-04');
</code></pre>
     * @param {String/Date} date The date or valid date string
     * @return {Ext.form.field.Date} this
     * @method setValue
     */

    /**
     * Attempts to parse a given string value using a given {@link Ext.Date#parse date format}.
     * @param {String} value The value to attempt to parse
     * @param {String} format A valid date format (see {@link Ext.Date#parse})
     * @return {Date} The parsed Date object, or null if the value could not be successfully parsed.
     */
    safeParse : function(value, format)  {
        var me = this,
            utilDate = Ext.PDate,
            parsedDate,
            result = null;
            
        if (utilDate.formatContainsHourInfo(format)) {
            // if parse format contains hour information, no DST adjustment is necessary
            result = utilDate.parse(value, format);
        } else {
            // set time to 12 noon, then clear the time
            parsedDate = utilDate.parse(value + ' ' + me.initTime, format + ' ' + me.initTimeFormat);
            if (parsedDate) {
                result = utilDate.clearTime(parsedDate);
            }
        }
        return result;
    },
    
    // @private
    getSubmitValue: function() {
        var me = this,
            format = me.submitFormat || me.format,
            value = me.getValue();
            
        return value ? Ext.PDate.format(value, format) : '';
    },

  

    // private
    formatDate : function(date)	{
        return Ext.isDate(date) ? Ext.PDate.dateFormat(date, this.format) : date;
    },

    createPicker: function() {
        var me = this,
            format = Ext.String.format;

        return Ext.create('Ext.picker.PDate', {
        	pickerField: me,
            ownerCt: me.ownerCt,
            renderTo: document.body,
            floating: true,
            hidden: true,
            focusOnShow: true,
            minDate: me.minValue,
            maxDate: me.maxValue,
            disabledDatesRE: me.disabledDatesRE,
            disabledDatesText: me.disabledDatesText,
            disabledDays: me.disabledDays,
            disabledDaysText: me.disabledDaysText,
            format: me.format,
            showToday: me.showToday,
            startDay: me.startDay,
            minText: format(me.minText, me.formatDate(me.minValue)),
            maxText: format(me.maxText, me.formatDate(me.maxValue)),
            listeners: {
                scope: me,
                select: me.onSelect
            },
            keyNavConfig: {
                esc: function() {
                    me.collapse();
                }
            }
        });
    }
});

