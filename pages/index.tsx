import useSWR from "swr";
import {useState} from "react";
import Link from "next/link";

function CryptoDataFetcher(currency) {
    const {data, error} = useSWR(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d%2C14d%2C30d%2C200d%2C1y&locale=en`,
        (url) =>
            fetch(url)
                .then((response) => response.json())
                .then((data) => data.slice(0, 250)) // Slice the data to 250 items
                .catch((error) => console.error(error)),
        {
            refreshInterval: 1000 * 60 * 5, // Refresh data every 5 minute
        }
    );

    return {data, error};
}

function CryptoData({data: originalData, page, error, searchString, currency, timestamp, setNumPages}) {
    if (originalData === undefined) {
        return (
            <div className="flex w-full h-full flex justify-center items-center">
                <div className="relative w-[200px] h-[200px]">

                    <div className="w-[200px] h-[200px] rounded-full absolute animate-ping
                            border-8 border-dashed border-gray-200"></div>


                    <div className="w-[200px] h-[200px] rounded-full animate-spin absolute
                            border-8 border-dashed border-purple-500 border-t-transparent"></div>
                </div>
            </div>
        );}
    const timezone = `price_change_percentage_${timestamp[1]}_in_currency`
    console.log(timezone)
    const pageSize = 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    let data = originalData;
    if (searchString) {
        data = originalData.filter(item => {
            return (item.name.toLowerCase().indexOf(searchString) !== -1 || item.symbol.toLowerCase().indexOf(searchString) !== -1)
        } );
    }
    setNumPages(Math.ceil(data.length / pageSize));
    if (error) return <div>Error fetching data</div>;
    if (!data) return <div className="flex justify-center items-center w-full h-full">
        <div className="relative mx-auto my-auto w-[200px] h-[200px]">
            <div className="w-[200px] h-[200px] rounded-full absolute animate-ping
                            border-8 scale-[0.1] border-dashed border-slate-400"></div>
            <div className="w-[200px] h-[200px] rounded-full animate-spin absolute
                            border-8 border-dashed border-purple-500 border-t-transparent"></div>
        </div>
    </div>

    const pagedData = data.slice(startIndex, endIndex);

    return (
        <div className='w-full px-2'>
            {pagedData.map((coin) => (
                <div
                    key={coin.id}
                    className="flex flex-row border border-lime-300 rounded-sm mt-2 items-center py-2"
                >
                    <div className='flex flex-row justify-start items-center text-left basis-1/2'>
                        <img src={coin.image} alt={coin.name} className="w-8 h-8 my-auto"/>
                        <div className="text-2xl mx-2 my-auto">
                            <Link href={`/${coin.id}`}>
                                <div>{coin.name}</div>
                            </Link>
                        </div>
                    </div>
                    <div className="text-2xl mx-2 basis-1/4 text-justify">{`${currency[1]} ${coin.current_price}`}</div>
                    <div
                        className={`text-2xl text-bold mx-2 basis-1/4 text-right transition-color duration-1000 ${
                            coin[timezone] &&
                            coin[timezone] >= 0
                                ? "text-lime-600"
                                : "text-orange-600"
                        }`}
                    >
                        {`${coin[timezone]>0?`+${coin[timezone].toFixed(2)} %`:`- ${(-coin[timezone]).toFixed(2)} %`}`}
                    </div>
                </div>
            ))}
        </div>
    );
}

const Pagination = ({page, setPage, maxPages}) => {
    return (
        <div>
            <button
                className={`border border-2 rounded-lg text-center text-xl px-8 py-2 transition-colors duration-[2000] ${
                    page === 1  || maxPages === 0 ? "border-gray-300 bg-gray-200" : "border-blue-300 bg-lime-200"
                }`}
                onClick={() => setPage((page) => page - 1)}
                disabled={page === 1 || maxPages === 0}
            >
                -
            </button>
            <span className={"border border-2 rounded-lg border-blue-300 text-center text-xl px-8 py-2"}>
                {page}
            </span>
            <button
                className={`border border-2 rounded-lg text-center text-xl px-8 py-2 transition-colors duration-[2000] ${
                    page === maxPages  || maxPages === 0 ? "border-gray-300 bg-gray-200" : "border-blue-300 bg-lime-200"
                }`}
                onClick={() => setPage((page) => page + 1)}
                disabled={page === maxPages || maxPages === 0}
            >
                +
            </button>
        </div>
    );
};

const Home = () => {
    const [numPages, setNumPages] = useState(25);
    const [page, setPage] = useState(1);
    const [searchText, setSearchText] = useState("");
    const [index, setIndex] = useState(0);
    const [index2, setIndex2] = useState(0);

    const currencyData=[['USD', '$'],['INR', '₹'],['EUR', '€'],['JPY', '¥']]
    const ranges =[['1 Hour','1h'],['24 Hours','24h'],['7 days','7d'],['14 days','14d'],['30 days','30d'],['200 days','200d'],['1 year','1y']]
    const {data, error} = CryptoDataFetcher(currencyData[index2][0]);
    return (
        <div>
            <h1 className={"text-3xl"}>Crypto Tracker</h1>
            <div className='flex flex-row text-center justify-around'>
                <div className='text-xl'>
                    Currency
                    <div className='flex flex-row justify-between  text-lg'>
                        {currencyData.map((item,i)=>(
                            <div
                                key={i}
                                className={`cursor-pointer px-4 py-2 rounded ${i === index2 ? 'CurrencyHighlighted' : ''}`}
                                onClick={() => setIndex2(i)}>{item[0]} {item[1]}
                            </div>
                        ))}
                    </div>
                </div>
                <div className='text-xl'>
                    Time Range
                    <div className=' flex flex-row justify-around text-lg'>
                        {ranges.map((range, i) =>(
                            <div
                                key={i}
                                className={`cursor-pointer px-4 py-2 rounded ${index === i ? 'CurrencyHighlighted' : ''}`} onClick={()=>setIndex(i)}>{range[0]}</div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="border border-blue-300 rounded p-0 flex flex-row w-[400px] mx-10 my-2">
                <div className="m-0 h-full px-8 py-2 bg-blue-200 text-xl">Search</div>
                <input
                    className="border border-blue-300 w-full px-2 text-xl text-center items-center justify-center flex"
                    type="text"
                    value={searchText}
                    onChange={(e) => {
                        setPage(1)
                        setSearchText(e.target.value)
                    }}
                />
            </div>
            <div className='mx-10 my-4 flex flex-col justify-center items-center'>
                <div className={`flex flex-row items-center justify-center w-full text-justify px-2 py-4 bg-lime-200 text-xl`}>
                    <div className={'basis-1/2'}>
                        Name
                    </div>
                    <div className={'basis-1/4'}>
                        Price in {currencyData[index2][0]} {currencyData[index2][1]}
                    </div>
                    <div className={'basis-1/4 text-right'}>
                        Price Change Percentage in {ranges[index][0]}
                    </div>
                </div>
                <CryptoData data={data} error={error} page={page} searchString={searchText.toLowerCase()} currency={currencyData[index2]} timestamp={ranges[index]} setNumPages={(x)=>setNumPages(x)}/>
            </div>

            <div className='flex justify-center items-center'>
                <Pagination page={page} setPage={setPage} maxPages={numPages}/>
            </div>
        </div>
    );
};

export async function getServerSideProps() {
    const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=USD&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=1h%2C24h&locale=en`
    );
    const data = await response.json();
    return {
        props: {
            initialData: data,
        },
    };
}

export default Home;