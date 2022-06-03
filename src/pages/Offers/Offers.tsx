import React, { useState, useEffect, useCallback } from "react";
import { createAlchemyWeb3, Nft, NftId } from "@alch/alchemy-web3";
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from "../../store";
import { Autocomplete, Button, Grid, Input, TextField, Typography } from "@mui/material";
import { Seaport } from "@bthn/seaport-js";
import { ethers } from 'ethers';
import moment from 'moment';
import { WalletState } from "@web3-onboard/core";
import { postOffer, postOrder } from '../../utils/databaseApi';
import InfiniteScroll from "react-infinite-scroll-component";
import {AutoSizer, List} from 'react-virtualized';
import { without, xorWith, union, debounce } from 'lodash';
import ConfigurableModal from "../../components/ConfigurableModal/ConfigurableModal";
import { getCollections, getNftsByCollectionContract } from "../../utils/nftApi";
import { buildResolver, merkleTree } from "../../utils/ethUtils";

// Using HTTPS
const web3 = createAlchemyWeb3(
  "https://eth-rinkeby.alchemyapi.io/v2/demo",
);

const createBasicOrderTest = async (address: string, nfts: NftIds[], amount: number, wallet: WalletState) => {
    //const provider = new ethers.providers.JsonRpcProvider((window as any).ethereum);
    const seaport = new Seaport( new ethers.providers.Web3Provider((window as any).ethereum) as any, {});

    const { root, proofs, maxProofLength } = merkleTree(nfts.map(x => Number(x.id.tokenId)));
    const criteriaResolvers = [
        buildResolver(0, 0, 0, Number(nfts[0].id.tokenId), proofs[nfts[0].id.tokenId]),
      ];
    const order = await seaport.createOrder({
        //conduitKey: '0', // Default value is 0
        endTime: moment().add(7, 'days').unix().toString(), // Recommended to send a end time, start time is current unix time
        offer: [{
            itemType: 1,
            identifier: '0',
            token: "0xc778417e063141139fce010982780140aa0cd5ab",
            amount: (amount * 10**18).toString(),
            endAmount: (amount * 10**18).toString(),
            //recipient: address
        }],
        consideration: nfts.map(x => ({
            itemType: 2,
            token: x.contract.address,
            identifier: x.id.tokenId.toString(),
            recipient: address
        })),
        // Is this even right
        /*consideration: [{
            itemType: 2,
            token: nfts[0].contract.address,
            identifier: root,
            amount: '1',
            endAmount: '1',
            recipient: address
        }],*/
    }, address);
    console.log(order);
    const executeActions = await order.executeAllActions();
    await postOffer({actions: executeActions, nfts,}); // Add criteria resolvers?
    //console.log(apiResp);
    console.log(executeActions);

    //const fullfilled = await seaport.fulfillOrder(order);
};

type NftIds = {
 id2: number;
} & Nft;

type CollectionData = {
    id: string,
    displayName: string,
    "slug": string,
    "address": string,
    "name": string,
    "chainId": string,
}

const Offers = () => {
    const [open, setOpen] = React.useState(false);
    const [nfts, setNfts] = useState<NftIds[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const [ethValue, setEthValue] = useState<string>('0.01');
    const wallets = useSelector((state: RootState) => state.drawer.onboard);

    // Collections and autocomplete
    const [collections, setCollections] = useState<CollectionData[]>([]);
    const [inputValue, setInputValue] = React.useState("");
    const [selectedCollection, setSelectedCollection] = useState<CollectionData | undefined>(undefined);

    const getOptionsDelayed = useCallback(
        debounce((text, callback) => {
            if (!selectedCollection) {
                setCollections([]);
                getCollections(text).then(callback);
            }
        }, 400),
        []
      );
    
    useEffect(() => {
        if (inputValue.length > 0) {
            getOptionsDelayed(inputValue, (filteredOptions: CollectionData[]) => {
                if (!selectedCollection) {
                    setCollections(filteredOptions);
                }
            });
        }
    }, [inputValue, getOptionsDelayed]);

    const [hasMoreValue, setHasMoreValue] = useState(true);
    const [scrollData, setScrollData] = useState<NftIds[]>([]);

    useEffect(() => {
        async function fetchData(address: string) {
            const resp = await getNftsByCollectionContract(address);
            if (resp) {
                console.log(resp);
                const allNfts: NftIds[] = resp.map((x: any,i: number) => ({ ...x, id2: i})) as any;
                setNfts(allNfts);
                setScrollData(allNfts);
            }
        }
        if (selectedCollection) {
            fetchData(selectedCollection.id);
        }
    }, [selectedCollection]);

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
                            NFTs to Make... Offer On
                        </Typography>
                        <Autocomplete
                            onChange={(event: any, newValue: CollectionData | null) => {
                                if (newValue) {
                                    setSelectedCollection(newValue);
                                }
                            }}
                            options={collections}
                            getOptionLabel={(option) => option.name}
                            filterOptions={(x) => x} // disable filtering on client
                            loading={collections.length === 0}
                            onInputChange={(e, newInputValue) => {
                                setInputValue(newInputValue)
                                if (newInputValue !== inputValue && selectedCollection) {
                                    setSelectedCollection(undefined)
                                }
                            }}
                            renderInput={(params) => <TextField {...params} label="Search by Collection" />}
                        />
                    </div>
                    <div style={{ height: '75%', marginTop: 20, overflow: 'scroll'}}>
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
                                                    <Button onClick={() =>  setSelected(union(selected, [nft.id2]))}>Add to Offer</Button>
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
                            NFTs to Buy
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
                                                            Remove from Offer
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
                            Submit Offer
                        </Typography>
                    <Button variant="outlined" onClick={async () => makeOrder()}>Submit Offer</Button>
                </div>
            </div>
        </div>
    )
}

export default Offers;