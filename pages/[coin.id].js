import React, { useState } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { Line } from 'react-chartjs-2';
import { CategoryScale, Chart } from 'chart.js/auto';

Chart.register(CategoryScale);

const fetcher = async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

const CoinDashboard = () => {
    const [coinData, setCoinData] = useState(null);
    const router = useRouter();
    const coin = router.query['coin.id'];

    const { data, error } = useSWR(
        `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=1`,
        fetcher
    );

    if (error) console.error(error);

    if (!data) {
        return <div>Loading</div>;
    }

    if (!coinData) {
        setCoinData(data.prices);
    }
    const handleADD = () => {
        setCoinData([...coinData,[new Date(2023,4,15,1,50,50),30333]]);
    }
    return (
        <div>
            <h1>{coin} Price Chart</h1>
            {coinData && (
                <Line
                    key={new Date().getTime()}
                    data={{
                        labels: coinData.map((coin) => {
                            let date = new Date(coin[0]);
                            let time = `${date.getHours()}:${date.getMinutes()} hrs`;
                            return time;
                        }),
                        datasets: [{ data: coinData.map((coin) => coin[1]) }],
                    }}
                    options={{
                        animation: false
                    }}

                />
            )}
            <button onClick={handleADD}>Add</button>
        </div>
    );
};

export default CoinDashboard;