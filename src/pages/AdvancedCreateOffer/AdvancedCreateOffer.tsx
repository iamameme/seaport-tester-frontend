import React, { useState, useEffect, useCallback } from "react";
import { createAlchemyWeb3, Nft, NftId } from "@alch/alchemy-web3";
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from "../../store";
import { Autocomplete, Button, Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Grid, Input, TextField, Typography } from "@mui/material";
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

// Using HTTPS
const web3 = createAlchemyWeb3(
  "https://eth-rinkeby.alchemyapi.io/v2/demo",
);

const createBasicOrderTest = async (address: string, nfts: NftIds[], amount: number, wallet: WalletState) => {
    //const provider = new ethers.providers.JsonRpcProvider((window as any).ethereum);
    const seaport = new Seaport( new ethers.providers.Web3Provider((window as any).ethereum) as any, {});
    console.log(address)
    console.log((amount * 10**18).toString())
    console.log([{
        itemType: 2,
        token: 'tokenId',
        identifier: '0',
        amount: '1',
        endAmount: '1',
    },{
        itemType: 0,
        identifier: '0',
        token: "0x0000000000000000000000000000000000000000",
        amount: (amount * 10**18).toString(),
        endAmount: (amount * 10**18).toString(),
        recipient: address
    }],)
    const consideration = nfts.map(x => ({
        itemType: 2,
        token: x.contract.address,
        identifier: x.id.tokenId.toString(),
        amount: '1',
        endAmount: '1',
        recipient: address
    }));
    const order = await seaport.createOrder({
        //conduitKey: '0', // Default value is 0
        endTime: moment().add(7, 'days').unix().toString(), // Recommended to send a end time, start time is current unix time
        /*offer: [{
            itemType: 2,
            token: tokenId,
            identifier: '1',
            amount: '1',
            endAmount: '1',
        }],*/
        offer: [{
            itemType: 0,
            identifier: '0',
            token: "0x0000000000000000000000000000000000000000",
            amount: (amount * 10**18).toString(),
            endAmount: (amount * 10**18).toString(),
            //recipient: address
        }],
        consideration,
    }, address);
    console.log(order);
    const executeActions = await order.executeAllActions();
    await postOffer({actions: executeActions, nfts}, 'advancedoffer');
    //console.log(apiResp);
    console.log(executeActions);

    //const fullfilled = await seaport.fulfillOrder(order);
};

const createCollectionOfferTest = async (address: string, amount: number, collection: CollectionData, noBuying: string) => {
    //const provider = new ethers.providers.JsonRpcProvider((window as any).ethereum);
    const seaport = new Seaport( new ethers.providers.Web3Provider((window as any).ethereum) as any, {});
    const order = await seaport.createOrder({
        //conduitKey: '0', // Default value is 0
        endTime: moment().add(7, 'days').unix().toString(), // Recommended to send a end time, start time is current unix time
        /*offer: [{
            itemType: 2,
            token: tokenId,
            identifier: '1',
            amount: '1',
            endAmount: '1',
        }],*/
        offer: [{
            itemType: 0,
            identifier: '0',
            token: "0x0000000000000000000000000000000000000000",
            amount: (amount * 10**18).toString(),
            endAmount: (amount * 10**18).toString(),
            //recipient: address
        }],
        consideration: [{
            itemType: 2,
            token: collection.address,
            identifier: '0',
            amount: noBuying,
            endAmount: noBuying,
            recipient: address
        }],
        allowPartialFills: true,
    }, address);
    console.log(order);
    const executeActions = await order.executeAllActions();
    await postOffer({actions: executeActions, collection }, 'advancedoffer');
    //console.log(apiResp);
    console.log(executeActions);

    //const fullfilled = await seaport.fulfillOrder(order);
};

const createTraitOfferTest = async (address: string, amount: number, collection: CollectionData, noBuying: string) => {
    //const provider = new ethers.providers.JsonRpcProvider((window as any).ethereum);
    const seaport = new Seaport( new ethers.providers.Web3Provider((window as any).ethereum) as any, {});
    const order = await seaport.createOrder({
        //conduitKey: '0', // Default value is 0
        endTime: moment().add(7, 'days').unix().toString(), // Recommended to send a end time, start time is current unix time
        offer: [{
            itemType: 0,
            identifier: '0',
            token: "0x0000000000000000000000000000000000000000",
            amount: (amount * 10**18).toString(),
            endAmount: (amount * 10**18).toString(),
            //recipient: address
        }],
        consideration: [{
            itemType: 4,
            token: collection.address,
            identifier: '0',
            amount: noBuying,
            endAmount: noBuying,
            recipient: address
        }],
        allowPartialFills: true,
    }, address);
    console.log(order);
    const executeActions = await order.executeAllActions();
    await postOffer({actions: executeActions, collection }, 'advancedoffer');
    //console.log(apiResp);
    console.log(executeActions);

    //const fullfilled = await seaport.fulfillOrder(order);
};

type NftIds = {
 id2: number;
} & Nft;

export type CollectionData = {
    id: string,
    displayName: string,
    "slug": string,
    "address": string,
    "name": string,
    "chainId": string,
}

type TraitTemp = {
    value: string;
    trait_type: string;
}
/*0: {value: 'greenish', trait_type: 'color'}
1: {value: 'tilted', trait_type: 'mood'}*/

type AttributeTemp = {
    attributes: TraitTemp[],
}

export type MetadataResp = {
    metadata: AttributeTemp
};

const AdvancedCreateOffers = () => {
    const [open, setOpen] = React.useState(false);
    const [nfts, setNfts] = useState<NftIds[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const [ethValue, setEthValue] = useState<string>('0.01');
    const [noBuying, setNoBuying] = useState<string>('3');
    const wallets = useSelector((state: RootState) => state.drawer.onboard);

    const selectedNfts = nfts.filter(x => selected.indexOf(x.id2));

    // Collections and autocomplete
    const [collections, setCollections] = useState<CollectionData[]>([]);
    const [inputValue, setInputValue] = React.useState("");
    const [selectedCollection, setSelectedCollection] = useState<CollectionData | undefined>(undefined);

    // Traits
    const [traits, setTraits] = useState<boolean[]>([false, false]);
    const [traitNft, setTraitNft] = useState<MetadataResp | undefined>(undefined);

    useEffect(() => {
        async function fetchData(address: string, tokenId: string) {
            const resp = await web3.alchemy.getNftMetadata({contractAddress: address, tokenId })
            if (resp) {
                console.log(resp);
                setTraitNft(resp as any);
            }
        }
        if (selected.length > 0) {
            const item = nfts.find(x => x.id2 == selected[0]);
            if (item) {
                fetchData(item.contract.address, item.id.tokenId);
            }
        }
    }, [selected]);

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
    const makeCollectionOrder = async () => {
        if (wallets && wallets[0].accounts[0] && selectedCollection) {
            // create basic order with multiple
            await createCollectionOfferTest(wallets[0].accounts[0].address, Number(ethValue), selectedCollection, noBuying);
            setOpen(true);
            setSelected([]);
        }
    };
    const onCloseModal = () => {
        setOpen(false);
    }
    return (
        <div style={{ width: '98vw', height: '90vh', display: 'flex', padding: 20}}>
            <ConfigurableModal message={"You offer has been created! Your partial one."} title={"Success"} open={open} handleClose={() => onCloseModal()} />
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
                                                    <Button onClick={() =>  setSelected(union(selected, [nft.id2]))}>See Traits</Button>
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
                    <div style={{ borderBottom: '1px solid grey', marginBottom: 10}}>
                        <span>Parameters</span>
                    </div>
                    <TextField label="Price (ETH) Nice and Low" variant="outlined" defaultValue={'0.01'} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEthValue(event.target.value)}  />
                </div>
            </div>
            <div style={{ marginLeft: 100, width: '45%', height: '100%' }}>
                {selected.length === 0 && selectedCollection && (
                    <div style={{ height: '70%', boxShadow: '0 0.1px 0.3px rgb(0 0 0 / 10%), 0 1px 2px rgb(0 0 0 / 20%)', background: '#fff'}}>
                        <div style={{ borderBottom: '1px solid #ebebed'}}>
                            <Typography variant="h5" gutterBottom component="div" sx={{ p: 2, pb: 0 }}>
                                Collection-Level Offers
                            </Typography>
                            <div style={{ height: '90%', marginTop: 20}}>
                                <Button onClick={() => makeCollectionOrder()}>Make Collection Level Offer</Button>
                                <TextField label="# of NFTs Buying" defaultValue={'3'} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNoBuying(event.target.value)}  />
                                <span>Description: Make an offer buying any NFTs from selected collection for the price inputed at the bottom left because I havent moved that yet.</span>
                                <span>This is to test out Partial orders so, too bad, its set to partial. Maybe Ill add a button so you can set it to Full</span>
                                <span>OR MAYBE I WONT</span>
                            </div>
                        </div>
                    </div>
                )}
                {selected.length > 0 && (<div style={{ height: '70%', boxShadow: '0 0.1px 0.3px rgb(0 0 0 / 10%), 0 1px 2px rgb(0 0 0 / 20%)', background: '#fff'}}>
                    <div style={{ borderBottom: '1px solid #ebebed'}}>
                        <Typography variant="h5" gutterBottom component="div" sx={{ p: 2, pb: 0 }}>
                            Trait Level Offer
                        </Typography>
                    </div>
                    <div style={{ height: '90%', marginTop: 20}}>
                        <Button onClick={() => { setSelected([])}}>Clear the Broken Selected Items aka Go Back</Button>
                        <FormControl sx={{ m: 3 }} component="fieldset" variant="standard">
                            <FormLabel component="legend">Pick the Traits to Buy on Offer</FormLabel>
                            <FormGroup>
                                {traitNft && traitNft.metadata.attributes.map((x,i) => {
                                    const makeNewTraits = (index: number) => {
                                        const newTraits = traits.slice(0);
                                        newTraits[index] = !newTraits[index];
                                        return newTraits;
                                    };
                                    return (
                                        <div>
                                            <FormControlLabel
                                                control={
                                                <Checkbox checked={traits[i]} onChange={() => setTraits(makeNewTraits(i))} name="gilad" />
                                                }
                                                label={`${x.trait_type}: ${x.value}`}
                                            />
                                        </div>
                                    );
                                })}
                            </FormGroup>
                        </FormControl>
                        
                        {/*<AutoSizer>
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
                        </AutoSizer>*/}
                    </div>
                </div>
                )}
                <div style={{ marginTop: 30, height: '20%', boxShadow: '0 0.1px 0.3px rgb(0 0 0 / 10%), 0 1px 2px rgb(0 0 0 / 20%)', background: '#fff'}}>
                    <div style={{ borderBottom: '1px solid grey'}}>
                        <span>Submit that s...stuff</span>
                    </div>
                    <Button onClick={async () => makeOrder()}>SubmIT IT</Button>
                </div>
            </div>
        </div>
    )
}

export default AdvancedCreateOffers;