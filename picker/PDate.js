/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.picker.Date
 * @extends Ext.Component
 * <p>A date picker. This class is used by the {@link Ext.form.field.Date} field to allow browsing and
 * selection of valid dates in a popup next to the field, but may also be used with other components.</p>
 * <p>Typically you will need to implement a handler function to be notified when the user chooses a color from the
 * picker; you can register the handler using the {@link #select} event, or by implementing the {@link #handler}
 * method.</p>
 * <p>By default the user will be allowed to pick any date; this can be changed by using the {@link #minDate},
 * {@link #maxDate}, {@link #disabledDays}, {@link #disabledDatesRE}, and/or {@link #disabledDates} configs.</p>
 * <p>All the string values documented below may be overridden by including an Ext locale file in your page.</p>
 * <p>Example usage:</p>
 * <pre><code>new Ext.panel.Panel({
    title: 'Choose a future date:',
    width: 200,
    bodyPadding: 10,
    renderTo: Ext.getBody(),
    items: [{
        xtype: 'datepicker',
        minDate: new Date(),
        handler: function(picker, date) {
            // do something with the selected date
        }
    }]
});</code></pre>
 * {@img Ext.picker.Date/Ext.picker.Date.png Ext.picker.Date component}
 *
 */
Ext.define('Ext.picker.PDate', {
    extend: 'Ext.picker.Date',
    alias: 'widget.pdatepicker',
    alternateClassName: 'Ext.PDatePicker',
renderTpl: [
        '<div class="{cls}" id="{id}" role="grid" title="{ariaTitle} {value:this.longDay}">',
            '<div role="presentation" class="{baseCls}-header">',
                '<div class="{baseCls}-prev"><a id="{id}-prevEl" href="#" role="button" title="{prevText}"></a></div>',
                '<div class="{baseCls}-month" id="{id}-middleBtnEl"></div>',
                '<div class="{baseCls}-next"><a id="{id}-nextEl" href="#" role="button" title="{nextText}"></a></div>',
            '</div>',
            '<table id="{id}-eventEl" class="{baseCls}-inner" cellspacing="0" role="presentation">',
                '<thead role="presentation"><tr role="presentation">',
                    '<tpl for="dayNames">',
                        '<th role="columnheader" title="{.}"><span>{.:this.firstInitial}</span></th>',
                    '</tpl>',
                '</tr></thead>',
                '<tbody role="presentation"><tr role="presentation">',
                    '<tpl for="days">',
                        '{#:this.isEndOfWeek}',
                        '<td role="gridcell" id="{[Ext.id()]}">',
                            '<a role="presentation" href="#" hidefocus="on" class="{parent.baseCls}-date" tabIndex="1">',
                                '<em role="presentation"><span role="presentation"></span></em>',
                            '</a>',
                        '</td>',
                    '</tpl>',
                '</tr></tbody>',
            '</table>',
            '<tpl if="showToday">',
                '<div id="{id}-footerEl" role="presentation" class="{baseCls}-footer"></div>',
            '</tpl>',
        '</div>',
        {
            firstInitial: function(value) {
                return value.substr(0,1);
            },
            isEndOfWeek: function(value) {
                // convert from 1 based index to 0 based
                // by decrementing value once.
                value--;
                var end = value % 7 === 0 && value !== 0;
                return end ? '</tr><tr role="row">' : '';
            },
            longDay: function(value){
                return Ext.PDate.format(value, this.longDayFormat);
            }
        }
    ],

    /**
     * @cfg {Number} startDay
     * Day index at which the week should begin, 0-based (defaults to 6, which is Sunday)
     */
    startDay : 6,
    


    // private, inherit docs
    initEvents: function(){
        var me = this,
            eDate = Ext.PDate,
            day = eDate.DAY;

        Ext.picker.Date.superclass.initEvents.call(this);

        me.prevRepeater = Ext.create('Ext.util.ClickRepeater', me.prevEl, {
            handler: me.showPrevMonth,
            scope: me,
            preventDefault: true,
            stopDefault: true
        });

        me.nextRepeater = Ext.create('Ext.util.ClickRepeater', me.nextEl, {
            handler: me.showNextMonth,
            scope: me,
            preventDefault:true,
            stopDefault:true
        });

        me.keyNav = Ext.create('Ext.util.KeyNav', me.eventEl, Ext.apply({
            scope: me,
            'left' : function(e){
                if(e.ctrlKey){
                    me.showPrevMonth();
                }else{
                    me.update(eDate.add(me.activeDate, day, -1));
                }
            },

            'right' : function(e){
                if(e.ctrlKey){
                    me.showNextMonth();
                }else{
                    me.update(eDate.add(me.activeDate, day, 1));
                }
            },

            'up' : function(e){
                if(e.ctrlKey){
                    me.showNextYear();
                }else{
                    me.update(eDate.add(me.activeDate, day, -7));
                }
            },

            'down' : function(e){
                if(e.ctrlKey){
                    me.showPrevYear();
                }else{
                    me.update(eDate.add(me.activeDate, day, 7));
                }
            },
            'pageUp' : me.showNextMonth,
            'pageDown' : me.showPrevMonth,
            'enter' : function(e){
                e.stopPropagation();
                return true;
            }
        }, me.keyNavConfig));

        if(me.showToday){
            me.todayKeyListener = me.eventEl.addKeyListener(Ext.EventObject.SPACE, me.selectToday,  me);
        }
        me.mon(me.eventEl, 'mousewheel', me.handleMouseWheel, me);
        me.mon(me.eventEl, 'click', me.handleDateClick,  me, {delegate: 'a.' + me.baseCls + '-date'});
        me.mon(me.monthBtn, 'click', me.showMonthPicker, me);
        me.mon(me.monthBtn, 'arrowclick', me.showMonthPicker, me);
        me.update(me.value);
    },

    /**
     * Setup the disabled dates regex based on config options
     * @private
     */
    initDisabledDays : function(){
        var me = this,
            dd = me.disabledDates,
            re = '(?:',
            len;

        if(!me.disabledDatesRE && dd){
                len = dd.length - 1;

            Ext.each(dd, function(d, i){
                re += Ext.isDate(d) ? '^' + Ext.String.escapeRegex(Ext.PDate.dateFormat(d, me.format)) + '$' : dd[i];
                if(i != len){
                    re += '|';
                }
            }, me);
            me.disabledDatesRE = new RegExp(re + ')');
        }
    },
    
    /**
     * Create the month picker instance
     * @private
     * @return {Ext.picker.Month} picker
     */
    createMonthPicker: function(){
        var me = this,
            picker = me.monthPicker;

        if (!picker) {
            me.monthPicker = picker = Ext.create('Ext.picker.PMonth', {
                renderTo: me.el,
                floating: true,
                shadow: false,
                small: me.showToday === false,
                listeners: {
                    scope: me,
                    cancelclick: me.onCancelClick,
                    okclick: me.onOkClick,
                    yeardblclick: me.onOkClick,
                    monthdblclick: me.onOkClick
                }
            });
            if (!me.disableAnim) {
                // hide the element if we're animating to prevent an initial flicker
                picker.el.setStyle('display', 'none');
            }
            me.on('beforehide', Ext.Function.bind(me.hideMonthPicker, me, [false]));
        }
        return picker;
    },

    /**
     * Respond to an ok click on the month picker
     * @private
     */
    onOkClick: function(picker, value){
        var me = this,
            month = value[0],
            year = value[1],
            gd=Ext.PDate.PersianToGregorian(year,month,Ext.PDate.getDate(me.getActive())),
            date = new Date(gd[0], gd[1], gd[2]);
            console.log(gd);
            console.log(value);
		/*
        if (date.getMonth() !== month) {
            // 'fix' the JS rolling date conversion if needed
            date = new Date(year, month, 1).getLastDateOfMonth();
        }
        */
        me.update(date);
        me.hideMonthPicker();
    },

    /**
     * Show the previous month.
     * @return {Ext.picker.Date} this
     */
    showPrevMonth : function(e){
        return this.update(Ext.PDate.add(this.activeDate, Ext.Date.MONTH, -1));
    },

    /**
     * Show the next month.
     * @return {Ext.picker.Date} this
     */
    showNextMonth : function(e){
        return this.update(Ext.PDate.add(this.activeDate, Ext.Date.MONTH, 1));
    },

    /**
     * Show the previous year.
     * @return {Ext.picker.Date} this
     */
    showPrevYear : function(){
        this.update(Ext.PDate.add(this.activeDate, Ext.Date.YEAR, -1));
    },

    /**
     * Show the next year.
     * @return {Ext.picker.Date} this
     */
    showNextYear : function(){
        this.update(Ext.PDate.add(this.activeDate, Ext.Date.YEAR, 1));
    },

	 /**
     * Update the contents of the picker
     * @private
     * @param {Date} date The new date
     * @param {Boolean} forceRefresh True to force a full refresh
     */
    update : function(date, forceRefresh){
        var me = this,
            active = me.activeDate;

        if (me.rendered) {
            me.activeDate = date;
            if(!forceRefresh && active && me.el && Ext.PDate.getMonth(active) == Ext.PDate.getMonth(date) && Ext.PDate.getFullYear(active) == Ext.PDate.getFullYear(date)){
                me.selectedUpdate(date, active);
            } else {
                me.fullUpdate(date, active);
            }
        }
        return me;
    },
    
    /**
     * Update the contents of the picker for a new month
     * @private
     * @param {Date} date The new date
     * @param {Date} active The active date
     */
    fullUpdate: function(date, active){
    	
        var me = this,
            cells = me.cells.elements,
            textNodes = me.textNodes,
            disabledCls = me.disabledCellCls,
            eDate = Ext.PDate,
            i = 0,
            extraDays = 0,
            visible = me.isVisible(),
            sel = +eDate.clearTime(date, true),
            today = +eDate.clearTime(new Date()),
            min = me.minDate ? eDate.clearTime(me.minDate, true) : Number.NEGATIVE_INFINITY,
            max = me.maxDate ? eDate.clearTime(me.maxDate, true) : Number.POSITIVE_INFINITY,
            ddMatch = me.disabledDatesRE,
            ddText = me.disabledDatesText,
            ddays = me.disabledDays ? me.disabledDays.join('') : false,
            ddaysText = me.disabledDaysText,
            format = me.format,
            days = eDate.getDaysInMonth(date),
            firstOfMonth = eDate.getFirstDateOfMonth(date),
            startingPos = firstOfMonth.getDay() - me.startDay,
            previousMonth = eDate.add(date, eDate.MONTH, -1),
            longDayFormat = me.longDayFormat,
            prevStart,
            current,
            disableToday,
            tempDate,
            setCellClass,
            html,
            cls,
            formatValue,
            value,
            gm;

        if (startingPos < 0) {
            startingPos += 7;
        }

        days += startingPos;
        prevStart = eDate.getDaysInMonth(previousMonth) - startingPos;
        //current = new Date(previousMonth.getFullYear(), previousMonth.getMonth(), prevStart, me.initHour);
        current= eDate.clone(previousMonth);
        current=eDate.clearTime(current);
        eDate.setDate(current,prevStart);
        current.setHours(me.initHour);
        console.log(Ext.PDate.format(current,"Y-m-d"));

        if (me.showToday) {
            tempDate = eDate.clearTime(new Date());
            disableToday = (tempDate < min || tempDate > max ||
                (ddMatch && format && ddMatch.test(eDate.dateFormat(tempDate, format))) ||
                (ddays && ddays.indexOf(tempDate.getDay()) != -1));

            if (!me.disabled) {
                me.todayBtn.setDisabled(disableToday);
                me.todayKeyListener.setDisabled(disableToday);
            }
        }

        setCellClass = function(cell){
            value = +eDate.clearTime(current, true);
            cell.title = eDate.format(current, longDayFormat);
            // store dateValue number as an expando
            cell.firstChild.dateValue = value;
            if(value == today){
                cell.className += ' ' + me.todayCls;
                cell.title = me.todayText;
            }
            if(value == sel){
                cell.className += ' ' + me.selectedCls;
                me.el.dom.setAttribute('aria-activedescendant', cell.id);
                if (visible && me.floating) {
                    Ext.fly(cell.firstChild).focus(50);
                }
            }
            // disabling
            if(value < min) {
                cell.className = disabledCls;
                cell.title = me.minText;
                return;
            }
            if(value > max) {
                cell.className = disabledCls;
                cell.title = me.maxText;
                return;
            }
            if(ddays){
                if(ddays.indexOf(current.getDay()) != -1){
                    cell.title = ddaysText;
                    cell.className = disabledCls;
                }
            }
            if(ddMatch && format){
                formatValue = eDate.dateFormat(current, format);
                if(ddMatch.test(formatValue)){
                    cell.title = ddText.replace('%0', formatValue);
                    cell.className = disabledCls;
                }
            }
        };

        for(; i < me.numDays; ++i) {
            if (i < startingPos) {
                html = (++prevStart);
                cls = me.prevCls;
            } else if (i >= days) {
                html = (++extraDays);
                cls = me.nextCls;
            } else {
                html = i - startingPos + 1;
                cls = me.activeCls;
            }
            textNodes[i].innerHTML = html;
            cells[i].className = cls;
            current.setDate(current.getDate() + 1);
            setCellClass(cells[i]);
        }

        me.monthBtn.setText(me.monthNames[eDate.getMonth(date)] + ' ' + eDate.getFullYear(date));
    },

},

// After dependencies have loaded:
function() {
    var proto = this.prototype;

    proto.monthNames = Ext.PDate.monthNames;

    proto.dayNames = Ext.PDate.dayNames;

    proto.format = Ext.PDate.defaultFormat;
});



Ext.data.Types.PDATE={
            convert: function(v) {
                var df = this.dateFormat;
                if (!v) {
                    return null;
                }
                if (Ext.isDate(v)) {
                    return v;
                }
                if (df) {
                    if (df == 'timestamp') {
                        return new Date(v*1000);
                    }
                    if (df == 'time') {
                        return new Date(parseInt(v, 10));
                    }
                    return Ext.PDate.parse(v, df);
                }
                
                var parsed = Date.parse(v);
                return parsed ? new Date(parsed) : null;
            },
            sortType: Ext.data.SortTypes.asDate,
            type: 'pdate'
}
Ext.util.Format.pdate= function(v, format) {
            if (!v) {
                return "";
            }
            if (!Ext.isDate(v)) {
                v = new Date(Date.parse(v));
            }
            return Ext.PDate.dateFormat(v, format || Ext.PDate.defaultFormat);
       };
Ext.util.Format.pdateRenderer=function(format) {
            return function(v) {
                return UtilFormat.date(v, format);
            }
}




/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.menu.DatePicker
 * @extends Ext.menu.Menu
 * <p>A menu containing an {@link Ext.picker.Date} Component.</p>
 * <p>Notes:</p><div class="mdetail-params"><ul>
 * <li>Although not listed here, the <b>constructor</b> for this class
 * accepts all of the configuration options of <b>{@link Ext.picker.Date}</b>.</li>
 * <li>If subclassing DateMenu, any configuration options for the DatePicker must be
 * applied to the <tt><b>initialConfig</b></tt> property of the DateMenu.
 * Applying {@link Ext.picker.Date DatePicker} configuration settings to
 * <b><tt>this</tt></b> will <b>not</b> affect the DatePicker's configuration.</li>
 * </ul></div>
 *
 * {@img Ext.menu.DatePicker/Ext.menu.DatePicker.png Ext.menu.DatePicker component}
 *
 * __Example Usage__
 *
 *     var dateMenu = Ext.create('Ext.menu.DatePicker', {
 *         handler: function(dp, date){
 *             Ext.Msg.alert('Date Selected', 'You choose {0}.', Ext.Date.format(date, 'M j, Y'));
 *         }
 *     });
 *  
 *     Ext.create('Ext.menu.Menu', {
 *         width: 100,
 *         height: 90,
 *         floating: false,  // usually you want this set to True (default)
 *         renderTo: Ext.getBody(),  // usually rendered by it's containing component
 *         items: [{
 *             text: 'choose a date',
 *             menu: dateMenu
 *         },{
 *             iconCls: 'add16',
 *             text: 'icon item'
 *         },{
 *             text: 'regular item'
 *         }]
 *     });
 *
 * @author Nicolas Ferrero
 */
 Ext.define('Ext.menu.PDatePicker', {
     extend: 'Ext.menu.Menu',

     alias: 'widget.pdatemenu',

     requires: [
        'Ext.picker.PDate'
     ],

    /**
     * @cfg {Boolean} hideOnClick
     * False to continue showing the menu after a date is selected, defaults to true.
     */
    hideOnClick : true,

    /**
     * @cfg {String} pickerId
     * An id to assign to the underlying date picker. Defaults to <tt>null</tt>.
     */
    pickerId : null,

    /**
     * @cfg {Number} maxHeight
     * @hide
     */

    /**
     * The {@link Ext.picker.Date} instance for this DateMenu
     * @property picker
     * @type Ext.picker.Date
     */

    /**
     * @event click
     * @hide
     */

    /**
     * @event itemclick
     * @hide
     */

    initComponent : function(){
        var me = this;

        Ext.apply(me, {
            showSeparator: false,
            plain: true,
            border: false,
            bodyPadding: 0, // remove the body padding from the datepicker menu item so it looks like 3.3
            items: Ext.applyIf({
                cls: Ext.baseCSSPrefix + 'menu-date-item',
                id: me.pickerId,
                xtype: 'pdatepicker'
            }, me.initialConfig)
        });

        me.callParent(arguments);

        me.picker = me.down('pdatepicker');
        /**
         * @event select
         * Fires when a date is selected from the {@link #picker Ext.picker.Date}
         * @param {Ext.picker.Date} picker The {@link #picker Ext.picker.Date}
         * @param {Date} date The selected date
         */
        me.relayEvents(me.picker, ['select']);

        if (me.hideOnClick) {
            me.on('select', me.hidePickerOnSelect, me);
        }
    },

    hidePickerOnSelect: function() {
        Ext.menu.Manager.hideAll();
    }
 });