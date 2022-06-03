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
import { OrdersResponse } from "../ManageOrders/ManageOrders";

// Using HTTPS
const web3 = createAlchemyWeb3(
  "https://eth-rinkeby.alchemyapi.io/v2/demo",
);

const FulfillOrder = () => {
    const [orders, setOrders] = useState<OrdersResponse[]>([]);
    const [selected, setSelected] = useState<number | undefined>(undefined);
    const [ethValue, setEthValue] = useState<string>('0.01');
    const wallets = useSelector((state: RootState) => state.drawer.onboard);
    useEffect(() => {
        async function fetchData(address: string) {
            const resp = await getAllOrdersByType('order');
            if (resp) {
                setOrders(resp);
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
            await actions.executeAllActions();
            await deleteOrders([order.id]);
            setOrders([]);
            console.log(actions);
        }
    };
    return (
        <div style={{ width: '100%', height: '100%', display: 'flex'}}>
        <div style={{ width: '45%', height: '100%' }}>
            <div style={{ height: '70%', boxShadow: '0 0.1px 0.3px rgb(0 0 0 / 10%), 0 1px 2px rgb(0 0 0 / 20%)', background: '#fff'}}>
                <div style={{ borderBottom: '1px solid grey'}}>
                    <Typography variant="h5" gutterBottom component="div" sx={{ p: 2, pb: 0 }}>
                        All Orders
                    </Typography>
                </div>
                    {orders && orders.map(order => {
                        const isSelected = selected == order.id;
                        const styles = isSelected ? { background: 'grey', border: '1px solid grey'} : {};
                        return (
                            <div className="card__body" style={{display: 'flex', margin: 20, cursor: 'pointer', ...styles}} onClick={() => setSelected(order.id)}>
                                <div className="card__body" style={{ margin: 10, width: '100%'}}>
                                    <span>Offer</span>
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
        </div>
        <div style={{ marginLeft: 100, width: '45%', height: '100%', background: '#fff' }}>
            {selected && selected && (
                <>
                    <div style={{ borderBottom: '1px solid grey', marginBottom: 50}}>
                        <Typography variant="h5" gutterBottom component="div" sx={{ p: 2, pb: 0 }}>
                            Actions for Selected Order
                        </Typography>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column'}}>
                        <Button variant="outlined" onClick={async () => fulfillOrder()}>Buy (Fulfill) Orders</Button>
                    </div>
                </>
            )}
        </div>
    </div>
    )
}

export default FulfillOrder;