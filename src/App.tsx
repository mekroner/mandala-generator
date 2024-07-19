import React, { useState } from 'react';
import { renderToString } from 'react-dom/server';

import MandalaRenderer, { generateMandala, mandalaToSVG } from './Mandala';
import MandalaGallery from './MandalaGallery';
import { Module, ModuleTab, ModuleTabSelector } from './Module';
import ToggleSwitch from './ToggleSwitch';

import './App.css';

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { resolve } from 'path';

function downloadPDF(arrayBuffer: Uint8Array) {
    var blob = new Blob([arrayBuffer], { type: "pdf" });
    var url = URL.createObjectURL(blob);
    window.open(url);
}

const convertSvgToPng = async (svgData, width, height) => {
    //
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.src = url;
    // 
    let promise = new Promise<string>((resolve, reject) => {
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 2000, 2000);

            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    resolve(url);
                } else {
                    reject(new Error("Something went wrong!"));
                }
            }, 'image/png');
        }
    });
    return promise;
}

async function createPdf(mandala) {
    const pdfDoc = await PDFDocument.create()
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)

    const page = pdfDoc.addPage()
    const { width, height } = page.getSize()
    const fontSize = 30
    page.drawText('Mandala Generator', {
        x: 50,
        y: height - 4 * fontSize,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0),
    })

    const svg = mandalaToSVG(mandala);
    const url = await convertSvgToPng(renderToString(svg), 2000, 2000);
    const imageBytes = await fetch(url).then(res => res.arrayBuffer());
    let image = await pdfDoc.embedPng(imageBytes);
    page.drawImage(image, {
        x: 25,
        y: 150,
        width: width - 50,
        height: width - 50,
    });

    const pdfBytes = await pdfDoc.save()
    downloadPDF(pdfBytes);
}

function removeNthElement(array, n) {
    let result = []
    array.forEach((element, index) => {
        if (index !== n) result.push(element);
    });
    return result;
}

function App() {
    const [mandala, setMandala] = useState(generateMandala);
    const [savedMadalas, setSavedMandalas] = useState([]);
    const [useColor, setUseColor] = useState(false);
    const showPngHandler = async () => {
        const svg = mandalaToSVG(mandala);
        convertSvgToPng(renderToString(svg), 2000, 2000)
            .then(url => window.open(url));
    };
    const showPdfHandler = () => { createPdf(mandala); }
    const saveToGalleryHandler = () => {
        if (undefined === savedMadalas.find((el) => el === mandala))
            setSavedMandalas([...savedMadalas, mandala]);
    };
    const loadFromGallaryHandler = (index: number) => {
        setMandala(savedMadalas[index]);
        setSavedMandalas(removeNthElement(savedMadalas, index));
    };
    return (
        <div className="App">
            <Module className="app-header" title="website title">
                <h1>MANDALA GENERATOR</h1>
            </Module>
            <Module className="app-mandala" title="mandala">
                <MandalaRenderer mandala={mandala} useColor={useColor} />
            </Module>
            <ModuleTabSelector className="app-controls">
                <ModuleTab title="Controls" tabShort="G">
                    <Button title="GENERATE NEW MANDALA" onClick={() => setMandala(generateMandala())} />
                    <Button title="REGENERATE COLORS" onClick={()=>alert("NOT IMPLEMENTED!")} />
                    <ToggleSwitch title="SHOW COLOR" onChange={() => setUseColor(!useColor)} checked={useColor} />
                    <Button title="STORE IN GALLERY" onClick={saveToGalleryHandler} />
                    <Button title="SHOW AS PNG" onClick={showPngHandler} />
                    <Button title="SHOW AS PDF" onClick={showPdfHandler} />
                </ModuleTab>
                <ModuleTab title="color" tabShort='C'>
                </ModuleTab>
            </ModuleTabSelector>
            <ModuleTabSelector className="app-footer">
                <ModuleTab title="Gallery" tabShort="G">
                    <MandalaGallery mandalas={savedMadalas} mandalaCallback={loadFromGallaryHandler} />
                </ModuleTab>
                <ModuleTab title="info" tabShort="I">
                    <p>
                        This website enables the user to generate randomized Mandalas.
                    </p>
                    <p>
                        Good Luck. Have Fun.
                    </p>
                </ModuleTab>
                <ModuleTab title="Math Stuff" tabShort="M">
                </ModuleTab>
            </ModuleTabSelector>
        </div>
    );
}

function Button(props) {
    return <button className='control-button' onClick={props?.onClick}> {props.title} </button>
}


export default App;
