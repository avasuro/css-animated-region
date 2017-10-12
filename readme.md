# Animated region for Backbone.Marionette, based on native css transitions

## How to install:

``` npm install marionette-css-animated-region ```

### Browser:
```html
<script src="backbone.js" type="text/javascript"></script>
<script src="backbone.marionette.js" type="text/javascript"></script>
<script src="marionette-css-animated-region.js" type="text/javascript"></script>
```

### Common JS:
```javascript
var CSSAnimatedRegion = require('marionette-css-animated-region');
```
### ES6:
```javascript
import CSSAnimatedRegion from 'marionette-css-animated-region';
```

## How to use
```javascript
var SomeViewConstructor = Marionette.View.Extend({
    regions: {
        animated: {
            el: '.region-selector',
            regionClass: CSSAnimatedRegion,
            state: {
                shown: {
                    opacity: 1
                },
                hidden: {
                    opacity: 0
                },
                animationDuration: 200,
                animationFunction: 'ease'
            }
        }
    }
})
```

For more information see examples in this repo.