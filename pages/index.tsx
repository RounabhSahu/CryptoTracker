import useSWR from "swr";
import {useState} from "react";
import Link from 'next/link';

function CryptoData({ initialData, page }) {
    const { data, error } = useSWR(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=${page}&sparkline=false`,
        (url) =>
            fetch(url)
                .then((response) => response.json())
                .catch((error) => console.error(error)),
        {
            initialData,
            refreshInterval: 1000 * 60 * 1, // Refresh data every 1 minute
        }
    );

    if (error) return <div>Error fetching data</div>;
    if (!data) return <div>Loading data...</div>;

    return (
        <div>
            {data.map((coin) => (
                <div
                    key={coin.id}
                    className="flex flex-row border border-lime-300 rounded-xl mt-2 items-center"
                >
                    <img src={coin.image} alt={coin.name} className="w-8 h-8" />
                    <div className="text-2xl mx-2">
                        <Link href={`/${coin.id}`}>
                            <div>{coin.name}</div>
                        </Link>
                    </div>
                    <div className="text-2xl mx-2">{`$${coin.current_price}`}</div>
                    <div
                        className={`text-2xl text-bold mx-2 ${
                            coin.price_change_percentage_24h >= 0
                                ? 'text-lime-400'
                                : 'text-orange-600'
                        }`}
                    >
                        {`${coin.price_change_percentage_24h.toFixed(2)}%`}
                    </div>
                </div>
            ))}
        </div>
    );
}

export async function getServerSideProps() {
  const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false`);
  const data = await response.json();
  return {
    props: {
      initialData: data,
    },
  };
}

const Home = () => {

  const [page, setPage] = useState(1);

  return (
      <div>
        <h1 className={'text-3xl'}>Crypto Tracker</h1>
        <CryptoData initialData={[]} page={page}/>
        <div>
          <button className={`border border-2 rounded-lg text-center text-xl px-8 py-2 ${page===1?'border-gray-300':'border-blue-300'}`}  onClick={()=>setPage((page)=>page-1)} disabled={page===1}>-</button>
          <span className={'border border-2 rounded-lg border-blue-300 text-center text-xl px-8 py-2'}>{page}</span>
          <button className={'border border-2 rounded-lg border-blue-300 text-center text-xl px-8 py-2'}  onClick={()=>setPage((page)=>page+1)}>+</button>
        </div>
      </div>

  )
};

export default Home;