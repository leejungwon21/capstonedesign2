import Monitor from '../../monitor';
import {STOCKS} from '../../data';
import {notFound} from 'next/navigation';
export function generateStaticParams(){return Object.values(STOCKS).map(s=>({ticker:s.ticker}));}
export default async function Page({params}){const {ticker}=await params;if(!Object.values(STOCKS).some(s=>s.ticker===ticker))notFound();return <Monitor key={ticker} ticker={ticker}/>;}
