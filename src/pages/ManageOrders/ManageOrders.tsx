import React, { useState, useEffect } from "react";
import { createAlchemyWeb3, Nft, NftId } from "@alch/alchemy-web3";
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from "../../store";
import { Button, Grid, Input, TextField, Typography } from "@mui/material";
import { Seaport } from "@bthn/seaport-js";
import { ethers } from 'ethers';
import { union, xorWith, isEqual, isArray, without } from 'lodash';
import moment from 'moment';
import { WalletState } from "@web3-onboard/core";
import { postOrder, getAllOrders, deleteOrders, deleteAllOrders, getOrdersByAddress } from '../../utils/databaseApi';
import { OrderWithNonce } from "@bthn/seaport-js/lib/types";
import { CollectionData } from "../AdvancedCreateOffer/AdvancedCreateOffer";

// Using HTTPS
const web3 = createAlchemyWeb3(
  "https://eth-rinkeby.alchemyapi.io/v2/demo",
);

export type OrderData = {
    nfts: Nft[],
    actions: OrderWithNonce;
    collection?: CollectionData;
};

export type OrdersResponse = {
    id: number;
    offerer: string;
    data: OrderData;
};

const Create = () => {
    const [orders, setOrders] = useState<OrdersResponse[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const [ethValue, setEthValue] = useState<string>('0.01');
    const wallets = useSelector((state: RootState) => state.drawer.onboard);
    useEffect(() => {
        async function fetchData(address: string) {
            //const resp = await getOrdersByAddress(address);
            const resp = await getAllOrders();
            if (resp && isArray(resp)) {
                setOrders(resp as any);
            }
        }
       if (wallets) {
            const wallet = wallets[0];
            fetchData(wallet.accounts[0].address);
        }
    }, [wallets]);

    const deleteSelectedOrders = async (order: OrdersResponse[]) => {
        if (wallets && wallets[0].accounts[0] && order) {
            const actions = await deleteOrders(order.map(x => x.id))
            console.log(actions);
            setSelected(xorWith(selected, order.map(x => x.id, isEqual)))
            setOrders([]);
        }
    };

    const cancelOrderNetwork = async () => {
        const order = orders.filter(x => selected.indexOf(x.id) > -1);
        if (wallets && wallets[0].accounts[0] && order) {
            const seaport = new Seaport( new ethers.providers.Web3Provider((window as any).ethereum) as any, {});
            const actions = await seaport.cancelOrders(order.map(x => x.data.actions.parameters));
            await actions.transact();
            console.log(actions);
            deleteSelectedOrders(order);
        }
    };

    const makeSelected = (orderId: number) => {
        if (selected.indexOf(orderId) > -1) {
            setSelected(without(selected, orderId))
        } else {
            setSelected(union(selected, [orderId]))
        }
    };

    const cancelAllOrders = async () => {
        if (wallets && wallets[0].accounts[0]) {
            const seaport = new Seaport( new ethers.providers.Web3Provider((window as any).ethereum) as any, {});
            const bulk = await seaport.bulkCancelOrders(wallets[0].accounts[0].address);
            await bulk.transact();
            await deleteAllOrders(wallets[0].accounts[0].address)
        }
    };
    return (
        <div style={{ width: '100%', height: '100%', display: 'flex'}}>
            <div style={{ width: '45%', height: '100%' }}>
                <div style={{ height: '70%', boxShadow: '0 0.1px 0.3px rgb(0 0 0 / 10%), 0 1px 2px rgb(0 0 0 / 20%)', background: '#fff'}}>
                    <div style={{ borderBottom: '1px solid grey'}}>
                        <Typography variant="h5" gutterBottom component="div" sx={{ p: 2, pb: 0 }}>
                            My Orders
                        </Typography>
                    </div>
                        {orders && orders.map(order => {
                            const isSelected = selected.indexOf(order.id) > -1;
                            const styles = isSelected ? { background: 'grey', border: '1px solid grey'} : {};
                            return (
                                <div className="card__body" style={{display: 'flex', margin: 20, cursor: 'pointer', ...styles}} onClick={() => makeSelected(order.id)}>
                                    <div className="card__body" style={{ margin: 10, width: '100%'}}>
                                        <span>Offer</span>
                                        <div>
                                        {order.data.nfts && order.data.nfts.map(nft => {
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
                                    <div className="card__body" style={{ margin: 10, width: '100%'}}>
                                        <span>Want</span>
                                        <div className="card__image" style={{ backgroundImage: `url(https://www.drupal.org/files/styles/grid-3-2x/public/project-images/ETHEREUM-LOGO_PORTRAIT_Black_small.png?itok=E8Qrv5WR)`}} />
                                        <div className="card__info">
                                            <p>Price: {(Number(order.data.actions.parameters.consideration[0].startAmount) / 10**18).toFixed(2) } ETH</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
                <div style={{ height: '20%', marginTop: 30, boxShadow: '0 0.1px 0.3px rgb(0 0 0 / 10%), 0 1px 2px rgb(0 0 0 / 20%)', background: '#fff'}}>
                    <div style={{ borderBottom: '1px solid grey', marginBottom: 10}}>
                        <span>Nothing Here Yet</span>
                    </div>
                </div>
            </div>
            <div style={{ marginLeft: 100, width: '45%', height: '100%', background: '#fff' }}>
                {selected && selected.length > 0 && (
                    <>
                        <div style={{ borderBottom: '1px solid grey', marginBottom: 50}}>
                            <Typography variant="h5" gutterBottom component="div" sx={{ p: 2, pb: 0 }}>
                                Actions for Selected Order
                            </Typography>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column'}}>
                            <Button variant="outlined" onClick={async () => cancelOrderNetwork()}>Invalidate Selected Orders</Button>
                            <Button variant="outlined" onClick={async () => cancelAllOrders()}>Invalidate All Orders</Button>
                            <Button variant="outlined" onClick={async () => deleteSelectedOrders(orders.filter(x => selected.indexOf(x.id) > -1))}>Delete Selected Orders from Database</Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default Create;