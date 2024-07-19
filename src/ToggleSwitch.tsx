import React from 'react';
import './ToggleSwitch.css';

export default (props) => {
    return <label className='toggle-switch'>
        <div className='toggle-switch-label'>
            {props.title}
        </div>
        <input type='checkbox' checked={props.checked} onChange={props.onChange} />
        <div className='toggle-switch-slider-container'>
            <div className='toggle-switch-slider' />
        </div>
    </label>;
}
