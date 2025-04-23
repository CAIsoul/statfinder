import React from "react";

export interface DistributionItem {
    name: string;
    value: number;
    color: string;
}

interface DistributionBarProps {
    items: DistributionItem[];
    height?: number;
    width?: number;
}

const DistributionBar: React.FC<DistributionBarProps> = ({ items, height = 20, width = 100 }) => {

    const sum = items.reduce((acc, curr) => acc + curr.value, 0);

    function renderPiece({ name, value, color }: DistributionItem) {
        const percentage = 100 * value / sum;
        return <div title={`${name}: ${(value / 60 / 60).toFixed(1)} hrs.  (${percentage.toFixed(1)}%)`} style={
            {
                backgroundColor: color,
                width: `${percentage}%`,
            }}></div>
    }

    return (
        <div style={{ width: width, height: height, display: 'flex' }}>
            {
                sum > 0 && items.map((item) => renderPiece(item))
            }
        </div>
    );
};

export default DistributionBar;