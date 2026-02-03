import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from 'recharts';

const PolarAngleAxisAny = PolarAngleAxis as any;

interface CohortHealthRadarProps {
    data: {
        subject: string;
        A: number;
        fullMark: number;
    }[];
}

const CohortHealthRadar: React.FC<CohortHealthRadarProps> = ({ data }) => {
    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxisAny
                        dataKey="subject"
                        tick={{ fill: '#475569', fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                    />
                    <Radar
                        name="Cohort Health"
                        dataKey="A"
                        stroke="#00A1DE"
                        strokeWidth={2}
                        fill="#00A1DE"
                        fillOpacity={0.4}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            borderColor: '#e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CohortHealthRadar;
