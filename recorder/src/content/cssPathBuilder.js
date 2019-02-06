(function () {
    var attrsConfig,
        attrs,
        attrBuilderMap = {
            'id': buildIdPath,
            'tagName': buildTagPath,
            'classList': buildClassPath
        };

    function updateAttrsConfig(newConfig, newAttrs) {
        attrsConfig = newConfig;
        attrs = newAttrs;
    }

    function build(target) {
        var currentTarget = target,
            currentCssPath = buildCssPath(currentTarget),
            cssPath,
            els,
            nth,
            parent,
            uniqueParent,
            isUnique;

        if (isUniqueSelector(currentCssPath)) {
            return currentCssPath;
        }

        parent = currentTarget.parentNode;      
        uniqueParent = getUniqueParent(parent);
        while (!isUnique && parent !== null) {
            els = parent.querySelectorAll(currentCssPath);
            if (els.length > 1) {
                nth = Array.prototype.indexOf.call(parent.children, currentTarget);
                if (nth > -1) {
                    currentCssPath += ':nth-child(' + (nth + 1) + ')';
                }
            }
            
            if (currentCssPath !== cssPath) {
                cssPath = cssPath ? currentCssPath + ' ' + cssPath : currentCssPath;
            }
            currentTarget = parent;            
            currentCssPath = buildCssPath(currentTarget);
            isUnique = isUniqueSelector(cssPath, uniqueParent.node);
            parent = currentTarget.parentNode;
        }

        css = uniqueParent ? uniqueParent.cssPath + ' ' + cssPath : cssPath;

        return !isUniqueSelector(css) ? false : css;
    }
    
    function getUniqueParent(node) {
        var parent = node.parentNode,
            cssPath = buildCssPath(node),
            isUnique = isUniqueSelector(cssPath);
        
        while(!isUnique && parent !== null) {
            cssPath = buildCssPath(parent);
            isUnique = isUniqueSelector(cssPath);
            node = parent;
            parent = parent.parentNode;
        }

        return {
            node: node,
            cssPath: cssPath
        };
    }

    function buildCssPath(target, parent) {
        var cssPath = '',
            pathBuilder,
            attr,
            i,
            len = attrs.length;

        if (target === document) {
            return '#document';
        }

        for (i = 0; i < len; i += 1) {
            attr = attrs[i];
            if (!target[attr]) {
                continue;
            }
            
            pathBuilder = attrBuilderMap[attr] || buildAttrPath;
            cssPath = pathBuilder(target, attr, cssPath, parent);

            if (isUniqueSelector(cssPath, parent)) {
                return cssPath;
            }
        }

        return cssPath;
    }

    function buildIdPath(target, attr, cssPath, parent) {
        var id = target.id,            
            attrConfig = attrsConfig[attr],
            matchValues = matches(attrConfig, [id]);
        if (!matchValues.length) {
            return cssPath;
        }

        return cssPath + '#' + matchValues[0];
    }

    function buildTagPath(target, attr, cssPath, parent) {
        var tagName = target.tagName,
            attrConfig = attrsConfig[attr],
            matchValues = matches(attrConfig, [tagName]);
        if (!matchValues.length) {
            return cssPath;
        }

        return matchValues[0] + cssPath;
    }
    
    function buildClassPath (target, attr, cssPath, parent) {
        var attrConfig = attrsConfig[attr],
            matchValues = matches(attrConfig, Array.prototype.slice.call(target.classList));
        if (!matchValues.length) {
            return cssPath;            
        }

        matchValues.forEach((css) => {
            cssPath += '.' + css;
            if (isUniqueSelector(cssPath, parent)) {
                return cssPath;
            }
        });

        return cssPath;
    }
    
    function buildAttrPath(target, attr, cssPath, parent) {
        var attrValue = target[attr],
            attrConfig = attrsConfig[attr],
            matchValues = matches(attrConfig, [attrValue]);

        if (matchValues.length) {
            cssPath += '[' + attr + '="' + matchValues[0] +'"]';
        }

        return cssPath;
    }

    function isUniqueSelector(cssPath, parent) {
        if (cssPath === '#document') {
            return true;
        }

        if (!cssPath) {
            return false;
        }

        parent = parent || window.document;
        return parent.querySelectorAll(cssPath).length === 1;
    }

    function matches(config, values) {
        var resultMap = {},
            includeRegex,
            excludeRegex;

        if (!config) {
            return [];
        }

        if (!config.include && !config.exclude) {
            return values;
        }

        includeRegex = config.include ? new RegExp(config.include) : null;
        excludeRegex = config.exclude ? new RegExp(config.exclude) : null;
        values.forEach(function(value) {
            if (value && (!includeRegex || includeRegex.test(value)) && (!excludeRegex || !excludeRegex.test(value))) {
                resultMap[value] = 1;
            }
        });

        return Object.keys(resultMap);
    }

    var cssPathBuilder = {
        updateAttrsConfig: updateAttrsConfig,
        build: build
    };

    window.automEvents = window.automEvents || {};
    window.automEvents.cssPathBuilder = cssPathBuilder;
})();