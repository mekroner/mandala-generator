import React from 'react';
import './Mandala.css'

class LargeDiskLayer {
    radius: number;
    color: Color;

    constructor(radius: number, color: Color) {
        this.radius = radius;
        this.color = color;
    }
};

class SmallTrianglesLayer {
    radius: number;
    count: number;
    width: number;
    height: number;
    color: Color;

    constructor(
        radius: number,
        count: number,
        width: number,
        height: number,
        color: Color,
    ) {
        this.radius = radius;
        this.count = count;
        this.width = width;
        this.height = height;
        this.color = color;
    }
};

class SmallDisksLayer {
    radius: number;
    count: number;
    diskRadius: number;
    color: Color;

    constructor(radius: number, count: number, diskRadius: number, color: Color) {
        this.radius = radius;
        this.count = count;
        this.diskRadius = diskRadius;
        this.color = color;
    }
};

type MandalaLayer = LargeDiskLayer | SmallDisksLayer | SmallTrianglesLayer;
type Mandala = Array<MandalaLayer>;
type Color = { name: string, rgb: [number, number, number] };

const Colors: Array<Color> = [
    {
        name: "red",
        rgb: [255, 0, 0],
    }, {
        name: "green",
        rgb: [0, 255, 0],
    }, {
        name: "blue",
        rgb: [0, 0, 255],
    }, {
        name: "yellow",
        rgb: [255, 255, 0],
    }, {
        name: "cyan",
        rgb: [0, 255, 255],
    }, {
        name: "violet",
        rgb: [255, 0, 255],
    },
]

export default function MandalaRenderer(props) {
    let svg = mandalaToSVG(props.mandala, props.useColor);
    return (
        <div className="MandalaRenderer">
            {svg}
        </div>
    );
}

export function generateMandala(): Mandala {
    let mandala: Mandala = [];
    const total_radius = 100;
    const layer_count = generateInt(7, 10);
    const count_base = generateInt(3, 4);
    // start with a base layer
    mandala.push(new LargeDiskLayer(total_radius, randomFromArray(Colors)));
    for (let layer = 0; layer < layer_count; layer++) {
        let radius = total_radius - layer * total_radius / layer_count - generateInt(-10, 10);
        let count = count_base * generateInt(2, 4);
        let color = randomFromArray(Colors);
        let selection = generateInt(0, 2);
        // let selection = 2;
        if (selection == 0) {
            mandala.push(new LargeDiskLayer(radius, color));
        } else if (selection == 1) {
            let diskRadius = getDiskRadius(radius, count);
            mandala.push(new SmallDisksLayer(radius, count, diskRadius, color));
        } else if (selection == 2) {
            let height = getTriangleHeight(radius);
            let width = getTriangleWidthFromHeight(radius, count, height);
            mandala.push(new SmallTrianglesLayer(radius, count, width, height, color));
        }
    }
    return mandala;
}

export function mandalaToSVG(mandala: Mandala, useColor: boolean = false) {
    let elements = [];
    mandala.forEach((layer, layerIndex) => {
        if (layer instanceof LargeDiskLayer) {
            let color = useColor ? layer.color : undefined;
            elements.push(<LayerDisk key={`${layerIndex}`} radius={layer.radius} x={0} y={0} color={color} />);
        } else if (layer instanceof SmallDisksLayer) {
            for (let i = 0; i < layer.count; i++) {
                let [x, y] = rotate(i, layer.count, layer.radius);
                let color = useColor ? layer.color : undefined;
                elements.push(
                    <LayerDisk
                        key={`${layerIndex}-${i}`}
                        radius={layer.diskRadius}
                        x={x}
                        y={y}
                        color={color}
                    />
                );
            }
        } else if (layer instanceof SmallTrianglesLayer) {
            for (let i = 0; i < layer.count; i++) {
                let [x, y] = rotate(i, layer.count, layer.radius);
                let angle = getAngle(i, layer.count);
                let color = useColor ? layer.color : undefined;
                elements.push(
                    <LayerTriangle
                        key={`${layerIndex}-${i}`}
                        width={layer.width}
                        height={layer.height}
                        x={x}
                        y={y}
                        rotation={angle}
                        color={color}
                    />
                );
            }
        }
    });
    return <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="-125 -125 250 250"
    >
        {elements}
    </svg>;
}

type DiskLayerProps = { radius: number, x: number, y: number, color?: Color, };
type ShapeLayerProps = { width: number, height: number, x: number, y: number, rotation: number, color?: Color, };

function generateInt(min: number = 0, max: number): number {
    return Math.round(Math.random() * max + min);
}

function getDiskRadius(radius: number, count: number, scale: number = 1): number {
    let angle = 2 * Math.PI / count;
    let dist = radius * Math.sqrt(2 * (1 - Math.cos(angle)));
    return scale * dist / 2;
}

function getTriangleWidth(radius: number, count: number, scale: number = 1): number {
    let angle = 2 * Math.PI / count;
    let c = Math.sqrt(2 * (1 - Math.cos(angle)));
    let dist = 2 * c * radius / (2 + c);
    return scale * dist / 2;
}

function getTriangleWidthFromHeight(radius: number, count: number, height: number,): number {
    let angle = 2 * Math.PI / count;
    let c = Math.sqrt(2 * (1 - Math.cos(angle)));
    let dist = (radius - height / 2) * c;
    return dist / 2;
}

function getTriangleHeight(radius: number): number {
    let min = radius * 0.05;
    let max = radius * 0.3;
    return generateInt(min, max);
}

function colorToStr(color: Color | undefined) {
    if (color === undefined) {
        return 'white';
    } else {
        return `rgb(${color.rgb[0]}, ${color.rgb[1]}, ${color.rgb[2]})`;
    }
}

function LayerDisk({ radius, x, y, color }: DiskLayerProps) {
    return <circle
        stroke="black"
        strokeWidth="0.5px"
        fill={colorToStr(color)}
        r={radius}
        cx={x}
        cy={y}
    />;
}


function LayerTriangle({ width, height, x, y, rotation, color }: ShapeLayerProps) {
    let points = `-${height},-${width} ${height},0 -${height},${width}`;
    let transform = `rotate(${rotation} ${x} ${y}) translate(${x}, ${y})`;
    return <polygon
        points={points}
        stroke='black'
        strokeWidth="0.5px"
        transform={transform}
        fill={colorToStr(color)}
    />;
}
function rotate(
    n: number,
    count: number,
    radius: number,
): [number, number] {
    let alpha = n * 2 * Math.PI / count;
    let x = radius * Math.cos(alpha);
    let y = radius * Math.sin(alpha);
    return [x, y]
}

function getAngle(
    n: number,
    count: number,
): number {
    return n * 360 / count;
}

function randomFromArray<Type>(array: Array<Type>): Type {
    let index = generateInt(0, array.length - 1);
    return array[index];
}

