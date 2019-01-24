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

    function builderCssPath(target) {
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
                nth = Array.prototype.indexOf.call(els, currentTarget);
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

        return uniqueParent ? uniqueParent.cssPath + ' ' + cssPath : cssPath;
    }
    
    function getUniqueParent(node) {
        var parent = node.parentNode,
            cssPath = buildCssPath(node),
            isUnique = isUniqueSelector(cssPath);
        
        while(!isUnique && parent !== null) {
            cssPath = buildCssPath(parent);
            isUnique = isUniqueSelector(cssPath);
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
            attrConfig,
            attrValue,
            matchValues,
            i,
            len = attrs.length;

        for (i = 0; i < len; i += 1) {
            attr = attrs[i];
            attrValue = target[attr];
            if (!attrValue) {
                continue;
            }
            
            attrConfig = attrsConfig[attr];
            pathBuilder = attrBuilderMap[attr];
            if (pathBuilder) {
                cssPath = pathBuilder(target, cssPath, attrConfig, parent);    
            } else {
                matchValues = matches(attrConfig, [attrValue]);
                if (matchValues.length) {
                    cssPath += '[' + attr + '="' + matchValues[0] +'"]';
                }
            }

            if (isUniqueSelector(cssPath, parent)) {
                return cssPath;
            }
        }

        return cssPath;
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

    function buildIdPath(target, cssPath, attrConfig, parent) {
        var id = target.id,
            matchValues = matches(attrConfig, [id]);
        if (!matchValues.length) {
            return cssPath;
        }

        return cssPath + '#' + matchValues[0];
    }

    function buildTagPath(target, cssPath, attrConfig, parent) {
        var tagName = target.tagName,
            matchValues = matches(attrConfig, [tagName]);
        if (!matchValues.length) {
            return cssPath;
        }

        return matchValues[0] + cssPath;
    }
    
    function buildClassPath (target, cssPath, attrConfig, parent) {
        var matchValues = matches(attrConfig, Array.prototype.slice.call(target.classList));
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

    function isUniqueSelector(cssPath, parent) {
        if (!cssPath) {
            return false;
        }

        parent = parent || window.document;
        return parent.querySelectorAll(cssPath).length === 1;
    }

    var cssPathBuilder = {
        updateAttrsConfig: updateAttrsConfig,
        builderCssPath: builderCssPath
    };

    window.automEvents = window.automEvents || {};
    window.automEvents.cssPathBuilder = cssPathBuilder;
})();