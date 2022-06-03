import React, { useState, useEffect } from "react";
import { createAlchemyWeb3, Nft, NftId } from "@alch/alchemy-web3";
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from "../../store";
import { Button, Grid, Input, TextField, Typography } from "@mui/material";
import { Seaport } from "@bthn/seaport-js";
import { BigNumber, ethers } from 'ethers';
import moment from 'moment';
import { WalletState } from "@web3-onboard/core";
import { postOrder, getAllOrders, deleteOrders, getAllOrdersByType } from '../../utils/databaseApi';
import { OrderWithNonce } from "@bthn/seaport-js/lib/types";
import { NftIds } from "../Create/Create";
import { union, without } from 'lodash';
import { CollectionData } from "../AdvancedCreateOffer/AdvancedCreateOffer";
import { OrdersResponse } from "../ManageOrders/ManageOrders";

// Using HTTPS
const web3 = createAlchemyWeb3(
  "https://eth-rinkeby.alchemyapi.io/v2/demo",
);

const FulfillCollectionOffer = () => {
    const [nfts, setNfts] = useState<NftIds[]>([]);
    const [orders, setOrders] = useState<OrdersResponse[]>([]);
    const [selected, setSelected] = useState<number | undefined>(undefined);
    const [nftSelected, setNftSelected] = useState<number[]>([]);
    const [ethValue, setEthValue] = useState<string>('0.01');
    const wallets = useSelector((state: RootState) => state.drawer.onboard);

    useEffect(() => {
        async function fetchData(address: string) {
            const resp = await getAllOrdersByType('collection');
            const resp3 = await getAllOrdersByType('trait');
            if (resp && resp3) {
                setOrders(resp.concat(resp3));
            } else if (resp) {
                setOrders(resp)
            } else if (resp3) {
                setOrders(resp3)
            }
            const resp2 = await web3.alchemy.getNfts({owner: address})
            if (resp2) {
                const allNfts: NftIds[] = resp2.ownedNfts.map((x,i) => ({ ...x, id2: i})) as any;
                setNfts(allNfts);
            }
        }
       if (wallets) {
            const wallet = wallets[0];
            fetchData(wallet.accounts[0].address);
        }
    }, [wallets]);

    const fulfillOrder = async () => {
        const order = orders.find(x => x.id === selected);
        const nftsSubmit = nfts.filter(x => nftSelected.indexOf(x.id2) > -1);
        if (wallets && wallets[0].accounts[0] && order && order.type === 'trait') {
            const tokens = (order.data as any).tokenIds.map((x: string) => '0x' + BigNumber.from(x).toHexString().slice(2).padStart(64, "0"));
            const criteria = nftsSubmit.map(x => ({
                identifier: x.id.tokenId,
                validIdentifiers: tokens
            }));
            const seaport = new Seaport( new ethers.providers.Web3Provider((window as any).ethereum) as any, {});
            const actions = await seaport.fulfillOrder({ order: order.data.actions, unitsToFill: nftsSubmit.length, considerationCriteria: criteria });
            await actions.executeAllActions();
            //await deleteOrders()
            //setOrders([]);
            console.log(actions);
        } else if (wallets && wallets[0].accounts[0] && order && order.type === 'collection') {
            const criteria = nftsSubmit.map(x => ({
                identifier: x.id.tokenId,
                validIdentifiers: []
            }));
            const seaport = new Seaport( new ethers.providers.Web3Provider((window as any).ethereum) as any, {});
            const actions = await seaport.fulfillOrder({ order: order.data.actions, unitsToFill: nftsSubmit.length, considerationCriteria: criteria });
            await actions.executeAllActions();
        }
    };

    const makeOrderSelected = (orderId: number) => {
        setSelected(selected != orderId ? orderId : undefined)
        setNftSelected([])
    };

    const makeSelected = (orderId: number) => {
        if (nftSelected.indexOf(orderId) > -1) {
            setNftSelected(without(nftSelected, orderId))
        } else {
            setNftSelected(union(nftSelected, [orderId]))
        }
    };
    return (
        <div style={{ width: '100%', height: '100%', display: 'flex'}}>
        <div style={{ width: '45%', height: '100%' }}>
            <div style={{ height: '70%', overflow: 'scroll', boxShadow: '0 0.1px 0.3px rgb(0 0 0 / 10%), 0 1px 2px rgb(0 0 0 / 20%)', background: '#fff'}}>
                <div style={{ borderBottom: '1px solid grey'}}>
                    <Typography variant="h5" gutterBottom component="div" sx={{ p: 2, pb: 0 }}>
                        All Criteria Level Offers
                    </Typography>
                </div>
                    {orders && orders.map(order => {
                        const isSelected = selected == order.id;
                        const styles = isSelected ? { background: 'grey', border: '1px solid grey'} : {};
                        return (
                            <div className="card__body" style={{display: 'flex', margin: 20, cursor: 'pointer', ...styles}} onClick={() => makeOrderSelected(order.id)}>
                                <div className="card__body" style={{ margin: 10, width: '100%'}}>
                                    <span>Offer</span>
                                    <div className="card__image" style={{ backgroundImage: `url(https://www.drupal.org/files/styles/grid-3-2x/public/project-images/ETHEREUM-LOGO_PORTRAIT_Black_small.png?itok=E8Qrv5WR)`}} />
                                    <div className="card__info">
                                        <p>Price: {(((Number(order.data.actions.parameters.offer[0].startAmount) / 10**18)) / 3).toFixed(2)} ETH per NFT</p>
                                    </div>
                                </div>
                                <div className="card__body" style={{ margin: 10, width: '100%'}}>
                                    <span>Want</span>
                                    <div>
                                        <div className="card__body" style={{ width: '100%'}}>
                                            <div className="card__image" style={{ backgroundImage: `url()`}} />
                                            <div className="card__info">
                                                <span>NFTs From Collection: </span>
                                                <p>{order.data.collection && order.data.collection.name}</p>
                                                <span>Order Type: {order.type}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
        <div style={{ width: '48%', height: '100%', marginLeft: '5%' }}>
                <div style={{ height: '70%', boxShadow: '0 0.1px 0.3px rgb(0 0 0 / 10%), 0 1px 2px rgb(0 0 0 / 20%)', background: '#fff'}}>
                    <div style={{ borderBottom: '1px solid #ebebed'}}>
                        <Typography variant="h5" gutterBottom component="div" sx={{ p: 2, pb: 0 }}>
                            NFTs Owned In Offer
                        </Typography>
                        <span>Seaport only supports 1 item at a time</span>
                    </div>
                    <div style={{ height: '85%', marginTop: 20, overflow: 'scroll'}}>
                            <Grid style={{ height: '100%', paddingLeft: '10%'}} container spacing={2}>    
                                {nfts && selected && nfts.map(nft => {
                                    const selectedOrder = orders.find(x => x.id === selected);
                                    if (!nft.metadata!.image! || !selectedOrder) {
                                        return;
                                    }
                                    const toCheck = selectedOrder.data.actions.parameters.consideration.map(x => ({ contract: x.token, tokenId: x.identifierOrCriteria }));
                                    let finder = toCheck.find(x => x.contract === nft.contract.address);
                                    if (selectedOrder.type == 'trait') {
                                        const nftsIds = (selectedOrder.data as any).tokenIds.map((x: string) => '0x' + BigNumber.from(x).toHexString().slice(2).padStart(64, "0"));
                                        finder = nftsIds.indexOf(nft.id.tokenId) > -1 ? { contract: nft.contract.address, tokenId: nft.id.tokenId} : undefined
                                    }
                                    if (!finder) {
                                        return;
                                    }
                                    const selectedStyles = nftSelected.indexOf(nft.id2) > -1 ? {background: 'grey'} : {};
                                    return (
                                        <Grid item xs={12} sm={6} md={5}>
                                            <div style={{ padding: 5, ...selectedStyles}}>
                                            <div className="card__body" onClick={() =>  makeSelected(nft.id2)}>
                                                <div className="card__image" style={{ backgroundImage: `url(${nft.metadata!.image})`}}>
                                                    {/*<img src={nft.metadata!.image} alt="" style={{ width: '100%'}} />*/}
                                                </div>
                                                <div className="card__info">
                                                    <p>{nft.title}</p>
                                                </div>
                                            </div>
                                            </div>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                    </div>
                </div>
                <div style={{ height: '20%', marginTop: 30, boxShadow: '0 0.1px 0.3px rgb(0 0 0 / 10%), 0 1px 2px rgb(0 0 0 / 20%)', background: '#fff'}}>
                    <Typography variant="h5" gutterBottom component="div" sx={{ p: 2, pb: 0 }}  style={{ borderBottom: '1px solid #ebebed'}}>
                        Fulfill Offer
                    </Typography>
                    <Button onClick={() => fulfillOrder()}>Fulfill Offer</Button>
                </div>
            </div>
    </div>
    )
}

export default FulfillCollectionOffer;