import React, { useState, useEffect } from "react";
import { createAlchemyWeb3, Nft } from "@alch/alchemy-web3";
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from "../../store";
import { Grid, LinearProgress, Typography } from "@mui/material";
import InfiniteScroll from "react-infinite-scroll-component";
import {AutoSizer, List} from 'react-virtualized';

// Using HTTPS
const web3 = createAlchemyWeb3(
  "https://eth-rinkeby.alchemyapi.io/v2/demo",
);


const NFTTrader = () => {
    const [nfts, setNfts] = useState<Nft[]>([]);
    const wallets = useSelector((state: RootState) => state.drawer.onboard);
    const [hasMoreValue, setHasMoreValue] = useState(true);
    const [scrollData, setScrollData] = useState<Nft[]>([]);

    useEffect(() => {
        async function fetchData(address: string) {
            const resp = await web3.alchemy.getNfts({owner: address})
            if (resp) {
                console.log(resp);
                const allNfts = resp.ownedNfts;
                setNfts(allNfts.concat(allNfts).concat(allNfts));
                setScrollData(allNfts);
            }
        }
       if (wallets) {
            const wallet = wallets[0];
            fetchData(wallet.accounts[0].address);
        }
    }, [wallets]);

    const loadScrollData = async () => {
        try {
          setScrollData(nfts.slice(0, scrollData.length + 2));
        } catch (err) {
          console.log(err);
        }
      };
    

    const handleOnRowsScrollEnd = () => {
        if (scrollData.length < nfts.length) {
          setHasMoreValue(true);
          loadScrollData();
        } else {
          setHasMoreValue(false);
        }
      };
    return (
        <React.Fragment>
            <div style={{ width: '45%', height: '100%'}}>
                <div style={{ height: '20%', marginBottom: 30, boxShadow: '0 0.1px 0.3px rgb(0 0 0 / 10%), 0 1px 2px rgb(0 0 0 / 20%)', background: '#fff'}}>
                <div style={{ borderBottom: '1px solid #ebebed',}}>
                <Typography variant="h5" gutterBottom component="div" sx={{ p: 2, pb: 0 }}>
                    NFTs To Trade
                </Typography>
                    </div>
                </div>
                <div style={{ height: '70%', boxShadow: '0 0.1px 0.3px rgb(0 0 0 / 10%), 0 1px 2px rgb(0 0 0 / 20%)', background: '#fff'}}>
                    <div style={{ borderBottom: '1px solid #ebebed'}}>
                    <Typography variant="h5" gutterBottom component="div" sx={{ p: 2, pb: 0 }}>
                        NFTs Owned
                    </Typography>
                    </div>
                    <div style={{ height: '95%'}}>
                    <AutoSizer>
                    {({height, width}) => (
                    <InfiniteScroll
                        dataLength={nfts.length}
                        next={handleOnRowsScrollEnd}
                        hasMore={hasMoreValue}
                        scrollThreshold={1}
                        height={height}
                        loader={<div/>}
                        // Let's get rid of second scroll bar
                        style={{ overflow: "unset", width }}
                        scrollableTarget="thediv"
                    >
                    <Grid style={{ height: '100%', paddingLeft: '10%'}} container spacing={2}>    
                        {nfts && nfts.map(nft => {
                            if (!nft.metadata!.image!) {
                                return;
                            }
                            return (
                                <Grid item xs={12} sm={6} md={5}>
                                    <div className="card__body">
                                        <div className="card__image" style={{ backgroundImage: `url(${nft.metadata!.image})`}} />
                                        <div className="card__info">
                                            <p>{nft.title}</p>
                                            <p><b>Price:</b> ETH {nft.balance}</p>
                                            <p>($3,565.48)</p>
                                        </div>
                                    </div>
                                </Grid>
                            );
                        })}
                    </Grid>
                    </InfiniteScroll>
                    )}
                    </AutoSizer>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}

export default NFTTrader;