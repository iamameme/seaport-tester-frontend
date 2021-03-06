import React, { useState, useEffect } from "react";
import { createAlchemyWeb3, Nft, NftId } from "@alch/alchemy-web3";
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from "../../store";
import { Button, Grid, Input, TextField, Typography } from "@mui/material";
import { Seaport } from "@bthn/seaport-js";
import { ethers } from 'ethers';
import moment from 'moment';
import { WalletState } from "@web3-onboard/core";
import { postOrder, getAllOrders, deleteOrders, getAllOrdersByType } from '../../utils/databaseApi';
import { OrderWithNonce } from "@bthn/seaport-js/lib/types";
import { NftIds } from "../Create/Create";
import { union, without } from 'lodash';
import { OrdersResponse } from "../ManageOrders/ManageOrders";
import { buildResolver, merkleTree } from "../../utils/ethUtils";

// Using HTTPS
const web3 = createAlchemyWeb3(
  "https://eth-rinkeby.alchemyapi.io/v2/demo",
);

const FulfillOffer = () => {
    const [nfts, setNfts] = useState<NftIds[]>([]);
    const [orders, setOrders] = useState<OrdersResponse[]>([]);
    const [selected, setSelected] = useState<number | undefined>(undefined);
    const [nftSelected, setNftSelected] = useState<number[]>([]);
    const [ethValue, setEthValue] = useState<string>('0.01');
    const wallets = useSelector((state: RootState) => state.drawer.onboard);

    useEffect(() => {
        async function fetchData(address: string) {
            const resp = await getAllOrdersByType('offer');
            if (resp) {
                setOrders(resp.filter((x: any) => x.type == 'offer') as any);
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
        if (wallets && wallets[0].accounts[0] && order) {
            //await createBasicOrderTest(wallets[0].accounts[0].address, selected, Number(ethValue), wallets[0]);
            const seaport = new Seaport( new ethers.providers.Web3Provider((window as any).ethereum) as any, {});
            const actions = await seaport.fulfillOrder({ order: order.data.actions });
            console.log(actions);
            await actions.executeAllActions();
            await deleteOrders([order.id]);
            setOrders([]);
            console.log(actions);
        }
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
                        All Simple Offers (ETH for NFT(s))
                    </Typography>
                </div>
                    {orders && orders.map(order => {
                        const isSelected = selected == order.id;
                        const styles = isSelected ? { background: 'grey', border: '1px solid grey'} : {};
                        return (
                            <div className="card__body" style={{display: 'flex', margin: 20, cursor: 'pointer', ...styles}} onClick={() => setSelected(order.id)}>
                                <div className="card__body" style={{ margin: 10, width: '100%'}}>
                                    <span>Offer</span>
                                    <div className="card__image" style={{ backgroundImage: `url(https://www.drupal.org/files/styles/grid-3-2x/public/project-images/ETHEREUM-LOGO_PORTRAIT_Black_small.png?itok=E8Qrv5WR)`}} />
                                    <div className="card__info">
                                        <p>Price: {(Number(order.data.actions.parameters.offer[0].startAmount) / 10**18).toFixed(2) } ETH</p>
                                    </div>
                                </div>
                                <div className="card__body" style={{ margin: 10, width: '100%'}}>
                                    <span>Want</span>
                                    <div>
                                    {order.data.nfts.map(nft => {
                                        if (!nft.metadata!.image!) {
                                            return;
                                        }
                                        return (
                                            <div className="card__body" style={{ width: '50%'}}>
                                                <div className="card__image" style={{ backgroundImage: `url(${nft.metadata!.image})`}} />
                                                <div className="card__info">
                                                    <p>{nft.title}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
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
                    </div>
                    <div style={{ height: '85%', marginTop: 20, overflow: 'scroll'}}>
                            <Grid style={{ height: '100%', paddingLeft: '10%'}} container spacing={2}>    
                                {nfts && selected && nfts.map(nft => {
                                    const selectedOrder = orders.find(x => x.id === selected);
                                    if (!nft.metadata!.image! || !selectedOrder) {
                                        return;
                                    }
                                    const toCheck = selectedOrder.data.actions.parameters.consideration.map(x => ({ contract: x.token, tokenId: x.identifierOrCriteria }));
                                    const finder = toCheck.find(x => (x.tokenId === nft.id.tokenId || "0x000000000000000000000000000000000000000000000000000000000000000" + x.tokenId === nft.id.tokenId) && x.contract === nft.contract.address);
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

export default FulfillOffer;