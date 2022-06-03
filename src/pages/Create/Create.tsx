import React, { useState, useEffect } from "react";
import { createAlchemyWeb3, Nft, NftId } from "@alch/alchemy-web3";
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from "../../store";
import { Button, Grid, Input, TextField, Typography } from "@mui/material";
import { Seaport } from "@bthn/seaport-js";
import { ethers } from 'ethers';
import moment from 'moment';
import { WalletState } from "@web3-onboard/core";
import { postOrder } from '../../utils/databaseApi';
import InfiniteScroll from "react-infinite-scroll-component";
import {AutoSizer, List} from 'react-virtualized';
import { without, xorWith, union } from 'lodash';
import ConfigurableModal from "../../components/ConfigurableModal/ConfigurableModal";

// Using HTTPS
const web3 = createAlchemyWeb3(
  "https://eth-rinkeby.alchemyapi.io/v2/demo",
);

const createBasicOrderTest = async (address: string, nfts: NftIds[], amount: number, wallet: WalletState) => {
 const seaport = new Seaport( new ethers.providers.Web3Provider((window as any).ethereum) as any, {});
    const offers = nfts.map(x => ({
        itemType: 2,
        token: x.contract.address,
        identifier: x.id.tokenId.toString(),
        amount: '1',
        endAmount: '1',
    }));
    const order = await seaport.createOrder({
        //conduitKey: '0', // Default value is 0
        endTime: moment().add(7, 'days').unix().toString(), // Recommended to send a end time, start time is current unix time
        offer: offers,
        consideration: [{
            itemType: 0,
            identifier: '0',
            token: "0x0000000000000000000000000000000000000000",
            amount: (amount * 10**18).toString(),
            endAmount: (amount * 10**18).toString(),
            recipient: address
        }]
    }, address);
    console.log(order);
    const executeActions = await order.executeAllActions();
    await postOrder({actions: executeActions, nfts});
    console.log(executeActions);
};

export type NftIds = {
 id2: number;
} & Nft;

const Create = () => {
    const [open, setOpen] = React.useState(false);
    const [nfts, setNfts] = useState<NftIds[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const [ethValue, setEthValue] = useState<string>('0.01');
    const wallets = useSelector((state: RootState) => state.drawer.onboard);

    const [hasMoreValue, setHasMoreValue] = useState(true);
    const [scrollData, setScrollData] = useState<NftIds[]>([]);

    useEffect(() => {
        async function fetchData(address: string) {
            const resp = await web3.alchemy.getNfts({owner: address})
            if (resp) {
                console.log(resp);
                const allNfts: NftIds[] = resp.ownedNfts.map((x,i) => ({ ...x, id2: i})) as any;
                setNfts(allNfts);
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
    const makeOrder = async () => {
        const selectedNfts = nfts.filter(x => selected.indexOf(x.id2) > -1);
        if (wallets && wallets[0].accounts[0] && selectedNfts) {
            // create basic order with multiple
            await createBasicOrderTest(wallets[0].accounts[0].address, selectedNfts, Number(ethValue), wallets[0]);
            setOpen(true);
            setSelected([]);
        }
    };
    const onCloseModal = () => {
        setOpen(false);
    }
    return (
        <div style={{ width: '98vw', height: '90vh', display: 'flex', padding: 20}}>
            <ConfigurableModal message={"You order has been created!"} title={"Success"} open={open} handleClose={() => onCloseModal()} />
            <div style={{ width: '45%', height: '100%' }}>
                <div style={{ height: '70%', boxShadow: '0 0.1px 0.3px rgb(0 0 0 / 10%), 0 1px 2px rgb(0 0 0 / 20%)', background: '#fff'}}>
                    <div style={{ borderBottom: '1px solid #ebebed'}}>
                        <Typography variant="h5" gutterBottom component="div" sx={{ p: 2, pb: 0 }}>
                            NFTs Owned
                        </Typography>
                    </div>
                    <div style={{ height: '85%', marginTop: 20, overflow: 'scroll'}}>
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
                            >
                            <Grid style={{ height: '100%', paddingLeft: '10%'}} container spacing={2}>    
                                {nfts && nfts.map(nft => {
                                    if (!nft.metadata!.image!) {
                                        return;
                                    }
                                    return (
                                        <Grid item xs={12} sm={6} md={5}>
                                            <div className="card__body">
                                                <div className="card__image" style={{ backgroundImage: `url(${nft.metadata!.image})`}}>
                                                    {/*<img src={nft.metadata!.image} alt="" style={{ width: '100%'}} />*/}
                                                </div>
                                                <div className="card__info">
                                                    <p>{nft.title}</p>
                                                    <Button onClick={() =>  setSelected(union(selected, [nft.id2]))}>Add to Order</Button>
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
                <div style={{ height: '20%', marginTop: 30, boxShadow: '0 0.1px 0.3px rgb(0 0 0 / 10%), 0 1px 2px rgb(0 0 0 / 20%)', background: '#fff'}}>
                    <Typography variant="h5" gutterBottom component="div" sx={{ p: 2, pb: 0 }}  style={{ borderBottom: '1px solid #ebebed'}}>
                        Set Price
                    </Typography>
                    <TextField label="Price (ETH) for All" variant="outlined" defaultValue={'0.01'} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEthValue(event.target.value)}  />
                </div>
            </div>
            <div style={{ marginLeft: 100, width: '45%', height: '100%' }}>
                <div style={{ height: '70%', boxShadow: '0 0.1px 0.3px rgb(0 0 0 / 10%), 0 1px 2px rgb(0 0 0 / 20%)', background: '#fff'}}>
                    <div style={{ borderBottom: '1px solid #ebebed'}}>
                        <Typography variant="h5" gutterBottom component="div" sx={{ p: 2, pb: 0 }}>
                            NFTs to Sell
                        </Typography>
                    </div>
                    <div style={{ height: '90%', marginTop: 20}}>
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
                                    {nfts && selected && nfts.filter(x => selected.indexOf(x.id2) > -1).map(nft => {
                                        if (!nft.metadata!.image!) {
                                            return;
                                        }
                                        return (
                                            <Grid item xs={12} sm={6} md={5}>
                                                <div className="card__body">
                                                    <div className="card__image" style={{ backgroundImage: `url(${nft.metadata!.image})`}}>
                                                        {/*<img src={nft.metadata!.image} alt="" style={{ width: '100%'}} />*/}
                                                    </div>
                                                    <div className="card__info">
                                                        <p>{nft.title}</p>
                                                        <Button onClick={() =>  setSelected(without(selected, nft.id2) as any)}>
                                                            Remove from Order
                                                        </Button>
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
                <div style={{ marginTop: 30, height: '20%', boxShadow: '0 0.1px 0.3px rgb(0 0 0 / 10%), 0 1px 2px rgb(0 0 0 / 20%)', background: '#fff'}}>
                    <Typography variant="h5" gutterBottom component="div" sx={{ p: 2, pb: 0 }}  style={{ borderBottom: '1px solid #ebebed'}}>
                        Submit Order
                    </Typography>
                    <Button variant="outlined" onClick={async () => makeOrder()}>Submit Order</Button>
                </div>
            </div>
        </div>
    )
}

export default Create;