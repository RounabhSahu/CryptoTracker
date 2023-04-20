import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { Line } from 'react-chartjs-2';
import { CategoryScale, Chart } from 'chart.js/auto';
import 'chartjs-adapter-moment';

Chart.register(CategoryScale);

const fetcher = async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

const CoinDashboard = () => {
    const [coinData, setCoinData] = useState([]);
    const router = useRouter();
    const coin = router.query['coin.id'];

    const { data, error } = useSWR(
        `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=1`,
        fetcher
    );

    useEffect(() => {
        if (data) {
            setCoinData(data.prices.map((item) => [item[0], item[1]]));
        }
    }, [data]);

    if (error) {
        console.error(error);
    }

    if (!data) {
        return <div>Loading</div>;
    }

    const gradient = (ctx) => {
        const chart = ctx.chart;
        const { top, bottom } = chart.chartArea || {};
        const canvas = chart.canvas;
        const gradient = canvas.getContext('2d').createLinearGradient(0, top || 0, 0, bottom || 0);
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        return gradient;
    };

    const handleAdd = () => {
        setCoinData([
            ...coinData,
            [new Date(2023, 4, 15, 1, 50, 50).getTime(), 30333],
        ]);
    };

    return (
        <div>
            <h1>{coin} Price Chart</h1>
            <Line
                key={new Date().getTime()}
                data={{
                    datasets: [
                        {
                            label: `${coin} price`,
                            data: coinData,
                            borderColor: 'red',
                            backgroundColor: gradient,
                            fill: 'origin',
                            pointRadius: 0 // set point radius to 0 to remove points
                        },
                    ],
                }}
                options={{
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'hour', // display timestamps with minute-level granularity
                                stepSize: 5, // display a timestamp every 5 minutes
                                displayFormats: {
                                    hour: 'DD h:mm a', // customize timestamp format
                                },
                                distribution: 'linear', // display timestamps in a linear distribution
                            },
                            title: {
                                display: true,
                                text: 'Time',
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Price (USD)',
                            },
                        },
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index',
                    },
                    plugins: {
                        tooltip: {
                            enabled: true,
                            intersect: false,
                            mode: 'index',
                        },
                    },
                    animation: false,
                }}
            />
            <button onClick={handleAdd}>Add</button>
        </div>
    );
};

export default CoinDashboard;
