import React from 'react';

const Icon = ({svg, height = 20, width = 20, text= ''}) => {
    var inlineSvg = svg.replace(/<\/svg>$/, `${text} </svg>`),
        inlineHtml = `<style> svg {height:${height}px;width:${width}px}</style> ${inlineSvg}`;
    
    return <span className='i-icon' dangerouslySetInnerHTML={{__html: inlineHtml}}/>;
};

export default Icon;