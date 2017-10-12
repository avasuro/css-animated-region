((factory) => {
    // Define as CommonJS export:
    if (typeof require === 'function' && typeof exports === 'object') {
        /* eslint-disable global-require */
        module.exports = factory(require('backbone.marionette'), require('underscore'));
        /* eslint-enable global-require */
    }
    // Define as AMD:
    else if (typeof define === 'function' && define.amd) { // eslint-disable-line no-undef
        define(['backbone.marionette', 'underscore'], factory); // eslint-disable-line no-undef
    }
    // Browser:
    else {
        window.CSSAnimatedRegion = factory(window.Marionette, window._);
    }
})((Marionette, _) => {
    /**
     * Determine the supported transition end event
     *
     * @type {string|undefined}
     */
    const transitionEnd = (() => {
        const el = document.createElement('fakeelement');

        const transitions = {
            transition: 'transitionend',
            OTransition: 'oTransitionEnd',
            MozTransition: 'transitionend',
            WebkitTransition: 'webkitTransitionEnd'
        };

        return _.find(transitions, (val, key) => (el.style[key] !== undefined ? val : undefined));
    })();

    /**
     * Is browser support transitions
     *
     * @type {boolean}
     */
    const isBrowserSupportTransitions = !!transitionEnd;


    /**
     * Class of the animated region
     *
     * @example
     * var SomeViewConstructor = Marionette.View.Extend({
     *      regions: {
     *          animated: {
     *              el: '.region-selector',
     *              regionClass: CSSAnimatedRegion,
     *              state: {
     *                  shown: {
     *                      opacity: 1
     *                  },
     *                  hidden: {
     *                      opacity: 0
     *                  },
     *                  animationDuration: 200,
     *                  animationFunction: 'ease'
     *              }
     *          }
     *      }
     * })
     */
    class CSSAnimatedRegion extends Marionette.Region {
        /**
         * Is element hidden
         *
         * @type {boolean}
         *
         * @private
         */
        _isHidden = true;

        /**
         * List of css properties that is watched by the region during transition
         *
         * @type {array}
         *
         * @private
         */
        _watchedProps = [];

        /**
         * Function to execute on animation end
         *
         * @type {null|function}
         *
         * @private
         */
        _doOnAnimationEnd = null;

        /**
         * Params for state of the region
         *
         * @type {object}
         *
         * @private
         */
        _state = {
            hidden: {},
            shown: {},
            animationDuration: 200,
            animationFunction: 'ease'
        };

        constructor(config, ...args) {
            super(config, ...args);
            const state = this._state;

            // Check is all properties of "shown" and "hidden" state is set:
            const diff = _.difference();
            if (diff.length) {
                throw new Error(`Some of the "hidden" and "shown" state props is missing: "${diff.join('", "')}"`);
            }

            // Store config:
            state.hidden = config.state.hidden || {};
            state.shown = config.state.shown || {};
            state.animationDuration = config.state.animationDuration || 200;
            state.animationFunction = config.state.animationFunction || 'ease';

            // Get list of css properties to track:
            const propertiesToTrack = _.keys(state.hidden);

            // Perform initial operations on region's root element as soon as possible:
            this.listenToOnce(this, 'before:show', () => {
                // Set initial state of the region:
                this.$el.css(this._isElHidden() ? this._state.hidden : this._state.shown);
                // Set transition property to the region:
                const transitionValue = propertiesToTrack.map(property => (
                    `${property} ${this._state.animationDuration / 1000}s ${this._state.animationFunction}`
                )).join(',');
                this.$el.css({transition: transitionValue});
            });
        }

        show(view, options) {
            this._hideEl();
            this._callWhenNoAnimation(() => {
                super.show(view, options);
            });
        }

        attachHtml(view) {
            this._hideEl();
            this._callWhenNoAnimation(() => {
                super.attachHtml(view);
                this._showEl();
            });
        }

        detachHtml() {
            this._hideEl();
            this._callWhenNoAnimation(() => {
                super.detachHtml();
            });
        }

        /**
         * Hide region root element
         *
         * @returns {CSSAnimatedRegion} this
         *
         * @private
         */
        _hideEl() {
            if (!this._isElHidden()) {
                this._isHidden = true;
                this._watchTransition(this._state.hidden);
            }
            return this;
        }

        /**
         * Show region root element
         *
         * @returns {CSSAnimatedRegion} this
         *
         * @private
         */
        _showEl() {
            if (this._isElHidden()) {
                this._isHidden = false;
                this._watchTransition(this._state.shown);
            }
            return this;
        }

        /**
         * Is region root element hidden
         *
         * @returns {Boolean} true if hidden
         *
         * @private
         */
        _isElHidden() {
            return this._isHidden;
        }

        /**
         * Invoke function when region is not in animation process
         *
         * @param {function} func - callback, that should be execute when animation end
         *                          (or immediately if element is not in animation process)
         *
         * @returns {CSSAnimatedRegion} this
         *
         * @private
         */
        _callWhenNoAnimation(func) {
            if (this._isInAnimationProcess()) {
                this._doOnAnimationEnd = func;
            }
            else {
                func();
            }
            return this;
        }

        /**
         * Check is region in animation process
         *
         * @returns {boolean}
         *
         * @private
         */
        _isInAnimationProcess() {
            return this._watchedProps.length > 0;
        }

        /**
         * Watch for transition, set animation flag to false on animation end, and call functions
         * in stack
         *
         * @param {object} cssProps
         *
         * @returns {CSSAnimatedRegion} this
         *
         * @private
         */
        _watchTransition(cssProps) {
            const onAnimationEnd = () => {
                if (this._doOnAnimationEnd) {
                    this._doOnAnimationEnd();
                    this._doOnAnimationEnd = null;
                }
            };

            // If no animation should be executed - run callback for animation end:
            if (!cssProps || !isBrowserSupportTransitions) {
                this.$el.css(cssProps);
                onAnimationEnd();
            }
            // Otherwise listen to animation end on all css props and only then run callback:
            else {
                // Remove old event listeners:
                this.$el.off(`${transitionEnd}.anim-region`);
                // Remember which css props we track for current animation:
                this._watchedProps = _.keys(cssProps);
                // Set css properties:
                this.$el.css(cssProps);
                console.log('css props changed', cssProps);
                // Add transition end event listener:
                this.$el.one(`${transitionEnd}.anim-region`, (e) => {
                    const propIndex = this._watchedProps.indexOf(e.originalEvent.propertyName);
                    if (e.target === this.el && propIndex !== -1) {
                        this._watchedProps.splice(propIndex, 1);
                        if (this._watchedProps.length === 0) {
                            onAnimationEnd();
                        }
                    }
                });
            }
        }
    }

    return CSSAnimatedRegion;
});
