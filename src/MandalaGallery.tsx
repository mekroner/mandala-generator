import React, { useState } from 'react';
import MandalaRenderer from './Mandala';

import './MandalaGallery.css'

export default function MandalaGallery(props) {
    const [current, setCurrent] = useState(0);
    const mandalaCount = props.mandalas.length;
    const currentDownHandle = () => { if (current > 0) setCurrent(current - 1); };
    const currentUpHandle = () => { if (current < mandalaCount) setCurrent(current + 1); };
    let renderers = [];
    for (let i = current; i < mandalaCount; i++) {
        const mandala = props.mandalas[i];
        renderers.push(
            <div
                className='mandala-gallery-card'
                key={`card-${i}`}
                onClick={() => props.mandalaCallback(i)}
            >
                <MandalaRenderer key={`renderer-${i}`} mandala={mandala} />
            </div>
        );
    }
    return <div className='mandala-gallery'>
        {renderers}
        <div className='mandala-gallery-controls'>
            <div className='mandala-gallery-controls-text'> {current}/{mandalaCount} </div>
            <button className='mandala-gallery-button' onClick={currentDownHandle}> B </button>
            <button className='mandala-gallery-button' onClick={currentUpHandle}> F </button>
        </div>
    </div>;
}
