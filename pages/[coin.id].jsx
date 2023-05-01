import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import useSWR from 'swr';
import {Line} from 'react-chartjs-2';
import {CategoryScale, Chart} from 'chart.js/auto';
import 'chartjs-adapter-moment';
// import {router} from "next/client";
// import "chartjs-plugin-zoom";

Chart.register(CategoryScale);



const CoinDashboard = ({initialData ,descData}) => {
    // console.log(initialData)
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(initialData);
    // const [displayData, setDisplayData] = useState([]);
    const [coinData, setCoinData] = useState([]);
    const [market, setMarket] = useState([]);
    const [volume, setVolume] = useState([]);
    const [index, setIndex] = useState(0);
    const [index2, setIndex2] = useState(0);
    const [index3, setIndex3] = useState(1);
    const router = useRouter();
    const coin = router.query['coin.id'];
    const ranges =[['1 day','1'],['3 days','3'], ['7 days','7'],['14 days','14'],['1 month','30'],['3 months','90'],['6 months','180'],['1 year','365'],['2 years','730']]
    const currencyData=[['USD', '$'],['INR', '₹'],['EUR', '€'],['JPY', '¥']]
    const typeGraph=['Price Data', 'Market Capital Data', 'Total Volume Data']
    useSWR(
        `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=${currencyData[index2][0]}&days=${ranges[index][1]}`,
        (url) =>
            fetch(url)
                .then((response) => response.json())
                .then((data) => {
                    // console.log("running data client",index)
                    setData(data)

                    setLoading(false)
                }) // Slice the data to 250 items
                .catch((error) => {
                    console.error(error)
                    console.log("running data client")
                }),
        {
            refreshInterval: 1000 * 60 * 5, // Refresh data every 5 minute
        }
    );

    useEffect(() => {
        if (data) {
            setCoinData(data.prices.map((item) => [item[0], item[1]]));
            setMarket(data.market_caps.map((item) => [item[0], item[1]]));
            setVolume(data.total_volumes.map((item) => [item[0], item[1]]))

        }
    }, [data]);
    // console.log(coinData);
    // if (error) {
    //     console.error(error);
    // }

    if (!data) {
        return <div>Loading</div>;
    }

    const gradient = (ctx) => {
        const chart = ctx.chart;
        const { top, bottom } = chart.chartArea || {};
        const canvas = chart.canvas;
        const gradient = canvas.getContext('2d').createLinearGradient(0, top || 0, 0, bottom || 0);
        gradient.addColorStop(0, 'rgba(255,153,0,0.5)');
        gradient.addColorStop(1, 'rgba(255,89,0,0.11)');
        return gradient;
    };

    const options = {
        scales: {
            x: {
                type: 'time',
                ticks: {

                    maxRotation: 0,
                    minRotation: 0,
                    color: 'rgb(255,153,0)',
                    padding: 5,
                },
                time: {
                    unit: index<3?"hour":index<8?"day":"month", // display timestamps with minute-level granularity
                    // stepSize: 10, // display a timestamp every 5 minutes
                    displayFormats: {
                        hour: index < 2 ? 'h:mm A' : index < 4 ? 'ha DD ' : 'DD MMM', // customize timestamp format
                        day: 'DD MMM',
                        month: 'MMM YY',
                    },
                    distribution: 'linear', // display timestamps in a linear distribution
                },
                grid:{
                    tickLength:10,

                    drawTicks:true,
                    color: 'rgb(255,229,100,0.5)',
                },

                border: {
                    dash: [0,10],
                },
                title: {
                    display: true,
                    text: 'Time',
                    color:'rgb(255,251,0)',
                },
            },
            y: {
                ticks: {
                    maxRotation: 0,
                    minRotation: 0,
                    color: 'rgb(255,153,0)',
                    padding: 5,
                    callback: function (value, index, values) {
                        var units = ['K', 'M', 'B', 'T'];
                        var unitIndex = Math.floor(Math.log10(Math.abs(value)) / 3);
                        var unitName = units[unitIndex - 1];
                        var scaledValue = value / Math.pow(10, unitIndex * 3);
                        var prefix = value < 0 ? '-' : '';

                        if (unitIndex <= 0) {
                            return value.toFixed(3);
                        }

                        return prefix + scaledValue.toFixed(1) + ' ' + unitName;
                    },
                },
                grid:{
                    // tickLength:1,
                    color: 'rgb(100,255,219,0.5)',
                },
                border: {
                    dash: [3,4],
                },
                title: {
                    display: true,
                    text: `Price (${currencyData[index2][0]})`,
                    color:'rgb(255,251,0)',
                },
            },
        },
        interactions: {

            // intersect: true,
            mode: 'y',
            axis:'y'
        },
        plugins: {
            tooltip: {
                enabled: true,
                intersect: false,
                mode: 'index',
            },
        },
        legend: {
            display: false, // disable legend labels
        },

        animation: true,
    }


    return (
        <div className='flex flex-col w-full  m-0 p-0 bg-gradient-to-t from-slate-900 to-teal-900 text-white min-h-screen '>
            <div className='text-center text-4xl font-rubik-pixels overflow-hidden'>
                <h1 className=''>{coin.toString().toUpperCase() }</h1>

            </div>
            <div className='border border-md rounded lg:mx-10 border-amber-500'>
                <div className='text-md w-full lg:w-auto my-1 mx-0 lg:my-0 bg-slate-900 px-6 pt-1 pb-2 rounded  rounded-b-none text-center'>
                    <span className={'font-sans'}>CURRENCY</span>
                    <div className='flex flex-row text-md my-1 justify-center flex-wrap'>
                        {currencyData.map((item, i) => (
                            <div
                                key={i}
                                className={`flex-grow cursor-pointer px-4 py-1 ${i === index2 ? 'CurrencyHighlighted' : 'Currency'}`}
                                onClick={() => {
                                    setIndex2(i)
                                    setLoading(true)
                                }}
                            >
                                {item[0]} {item[1]}
                            </div>
                        ))}
                    </div>
                </div>
                <div className='text-md w-full lg:w-auto my-1 mx-0 lg:my-0 bg-slate-900 px-6 pt-1 pb-2 text-center'>
                    <span className={'font-sans'}>TIME RANGE</span>
                    <div className='flex flex-row justify-center lg:justify-between text-lg my-1 flex-wrap'>
                        {ranges.map((range, i) =>(
                            <div
                                key={i}
                                className={`flex-grow cursor-pointer px-4 py-1 ${index === i ? 'CurrencyHighlighted' : 'Currency'}`}
                                onClick={()=> {
                                    setLoading(true);
                                    setIndex(i)
                                }}
                            >
                                {range[0]}
                            </div>
                        ))}
                    </div>
                </div>
                <div className='text-md w-full lg:w-auto my-1 mx-0 lg:my-0 bg-slate-900 px-6 pt-1 pb-2 rounded  rounded-t-none text-center '>
                    <span className={'font-sans'}>Type Of Data</span>
                    <div className='flex flex-row justify-center lg:justify-between text-lg my-1 flex-wrap'>
                        {typeGraph.map((range, i) =>(
                            <div
                                key={i}
                                className={`flex-grow cursor-pointer px-4 py-1 ${index3 === i ? 'CurrencyHighlighted' : 'Currency'}`}
                                onClick={()=> {
                                    // setLoading(true);
                                    setIndex3(i)
                                }}
                            >
                                {range}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className='lg:px-10 h-full w-full overflow-x-auto '>
                {loading?<div className={'min-h-[600px] my-auto flex justify-center items-center'}><div className="infinityChrome">
                        <div className=''></div>
                        <div className=''></div>
                        <div className=''></div>
                    </div></div>:
                    <div className='min-w-[800px] min-h-[350px] border border-md rounded my-4 pr-4 border-amber-500'>
                        <Line
                        key={new Date().getTime()}
                        data={{
                            datasets: [
                                {
                                    label:'Price',
                                    data: index3===0?coinData:index3===1?market:volume,
                                    borderColor: 'rgb(255,184,0)',
                                    backgroundColor: gradient,
                                    fill: 'origin',
                                    pointRadius: 0 // set point radius to 0 to remove points
                                },
                            ],
                        }}
                        options={options}/>
                    </div>
                    }
            </div>
            <div className='lg:px-10 h-full w-full flex flex-col'>
                <div className='flex flex-col justify-left items-center'>
                    <div  className='mt-1 pt-2 w-full mb-4  flex flex-col justify-left items-center  overflow-hidden border border-amber-500 rounded bg-gradient-to-r from-amber-400/20 via-transparent to-amber-400/20'>
                        <img className='h-[75px] rounded' src={descData.image.large} alt={`${coin} thumbnail` }/>
                        <svg viewBox="0 0 3000 800" className='h-[100px] font-mono flex justify-left items-left !text-[300px] -mt-4 -mb-6'>
                            <symbol id="m-text">
                                <text textAnchor="middle" x="50%" y="50%">{coin.toString().toUpperCase()}</text>
                            </symbol>
                            <g className="g-ants">
                                <use xlinkHref="#m-text" className="text-copy !stroke-white"></use>
                                <use xlinkHref="#m-text" className="text-copy !stroke-lime-300"></use>
                                <use xlinkHref="#m-text" className="text-copy !stroke-amber-500"></use>
                                <use xlinkHref="#m-text" className="text-copy !stroke-lime-300"></use>
                                <use xlinkHref="#m-text" className="text-copy !stroke-amber-500"></use>
                                <use xlinkHref="#m-text" className="text-copy !stroke-white"></use>
                            </g>
                        </svg>

                    </div>
                    <div  className=' flex flex-row  justify-left items-center'>
                        <div className='border border-amber-500 rounded px-4 py-2 h-full basis-2/5 font-mono bg-gradient-to-t from-amber-400/20 to-transparent'>
                            <h1 className='text-3xl'>Description</h1>
                            <div className='description-content text-justify' dangerouslySetInnerHTML={{ __html: descData.description.en }}></div>
                        </div>
                        <div className='border border-amber-500 rounded px-4 py-2 h-full basis-3/5 font-mono bg-gradient-to-t from-amber-400/20 to-transparent'>
                            <div>
                                <h1>Stats</h1>
                                <div className='flex flex-col justify-between'>
                                    <span className='flex flex-col'>
                                        <span>Genesis Date :</span>
                                        <span>{descData.genesis_date}</span>
                                        <span>Current Price :</span>
                                        <span>{descData.market_data.current_price[currencyData[index2][0].toString().toLowerCase()]} {currencyData[index2][1]} </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>


        </div>
    );
};

export async function getServerSideProps(context) {
    const coin = context.query['coin.id'];
    // console.log(coin)
    const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=1`
    );
    const data = await response.json();
    const response2 = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coin}?market_data=true&community_data=true&developer_data=true`
    );
    const data2 = await response2.json();
    console.log("data fetched before server")
    return {
        props: {
            initialData: data,
            descData: data2
        },
    };
}

export default CoinDashboard;