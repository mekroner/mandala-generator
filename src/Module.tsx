import React, { useState } from 'react';
import './Module.css'

export function Module(props) {
    const title = (props.title != null) ?
        <div className='module-name' >
            {props.title.toUpperCase()} \\
        </div>
        : null;
    return <div className={`module ${props.className}`}>
        <div className="corner-circle top-left"></div>
        <div className="corner-circle top-right"></div>
        <div className="corner-circle bottom-left"></div>
        <div className="corner-circle bottom-right"></div>
        {props.children}
        {title}
    </div>
}

export function ModuleTabSelector(props) {
    const [current, setCurrent] = useState(0);
    const tabCount = React.Children.count(props.children);
    const currentTab = props.children[current];
    const title = currentTab.props.title;
    let buttons = [];
    for (let i = 0; i < tabCount; i++) {
        let className = 'module-tab-button';
        if (current == i) {
            className = className + ' module-tab-button-active';
        } else { 
            className = className + ' module-tab-button-inactive';
        }
        buttons.push(<button
            className={className}
            key={i}
            onClick={() => setCurrent(i)}
        > {props.children[i].props.tabShort}</button>)
    }
    return <Module className = {props.className} title={title}>
        <div className='module-tab-button-panel'>
            {
                buttons
            }
        </div>
        {currentTab}
    </Module>;
}

export function ModuleTab(props) {
    return <>
        {props.children}
    </>;
}
