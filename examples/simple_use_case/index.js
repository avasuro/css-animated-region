/**
 * Class of the Marionette.View to display square of the given color
 *
 * @type {Marionette.View}
 */
var SquareView = Marionette.View.extend({
    className: 'square',
    attributes: function() {
        return {style: 'background-color: '+this.options.color}
    },
    template: function() {
        return ' ';
    }
});

// Root view constructor:
var Root = Marionette.View.extend({
    el: document.getElementById('root'),
    initialize: function() {
        this._greenBox = new SquareView({color: 'green'});
        this._redBox = new SquareView({color: 'red'});
    },
    template: function() {
        return '<div id="main_region"></div><span class="label">Click on me to chage the view!</span>'
    },
    regions: {
        main: {
            el: '#main_region',
            regionClass: CSSAnimatedRegion,
            state: {
                hidden: {
                    opacity: 0
                },
                shown: {
                    opacity: 1
                },
                animationDuration: 2000,
                animationFunction: 'ease'
            }
        }
    },
    events: {
        click: 'onClick'
    },
    onRender: function() {
        this.showChildView('main', this._greenBox);
    },
    onClick: function() {
        console.log('click');
        var viewToDisplay = this.getChildView('main') === this._redBox ? this._greenBox : this._redBox;
        this.detachChildView('main');
        this.showChildView('main', viewToDisplay);
    }
});

(new Root()).render();