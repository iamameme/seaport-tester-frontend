import React, { useState, useEffect, useCallback } from "react";
import { createAlchemyWeb3, Nft, NftId } from "@alch/alchemy-web3";
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from "../../store";
import { Autocomplete, Button, Checkbox, List, FormControl, FormControlLabel, FormGroup, FormLabel, Grid, IconButton, Input, ListItem, ListItemButton, ListItemIcon, ListItemText, TextField, Typography } from "@mui/material";
import { Seaport } from "@bthn/seaport-js";
import { ethers, BigNumber } from 'ethers';
import moment from 'moment';
import { WalletState } from "@web3-onboard/core";
import { postOffer, postOrder } from '../../utils/databaseApi';
import InfiniteScroll from "react-infinite-scroll-component";
import {AutoSizer } from 'react-virtualized';
import { without, xorWith, union, debounce } from 'lodash';
import ConfigurableModal from "../../components/ConfigurableModal/ConfigurableModal";
import { getCollections, getNftsByCollectionContract } from "../../utils/nftApi";
import { getMerkleRoot } from "../../utils/ethUtils";

// Using HTTPS
const web3 = createAlchemyWeb3(
  "https://eth-rinkeby.alchemyapi.io/v2/demo",
);

const createCollectionOfferTest = async (address: string, amount: number, collection: CollectionData, noBuying: string) => {
    //const provider = new ethers.providers.JsonRpcProvider((window as any).ethereum);
    const seaport = new Seaport( new ethers.providers.Web3Provider((window as any).ethereum) as any, {});
    const order = await seaport.createOrder({
        //conduitKey: '0', // Default value is 0
        endTime: moment().add(7, 'days').unix().toString(), // Recommended to send a end time, start time is current unix time
        offer: [{
            itemType: 1,
            identifier: '0',
            token: "0xc778417e063141139fce010982780140aa0cd5ab",
            amount: (amount * 10**18 * Number(noBuying)).toString(),
            endAmount: (amount * 10**18 * Number(noBuying)).toString(),
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
    await postOffer({actions: executeActions, collection }, 'collection');
    console.log(executeActions);
};

const createTraitOfferTest = async (address: string, amount: number, collection: CollectionData, noBuying: string, tokenIds: string[]) => {
    const seaport = new Seaport( new ethers.providers.Web3Provider((window as any).ethereum) as any, {});
    // ['1','2','3']
    const root = '0x' + getMerkleRoot(tokenIds);
    const test = tokenIds.map(x => '0x' + BigNumber.from(x).toHexString().slice(2).padStart(64, "0"));
    const order = await seaport.createOrder({
        //conduitKey: '0', // Default value is 0
        endTime: moment().add(7, 'days').unix().toString(), // Recommended to send a end time, start time is current unix time
        offer: [{
            itemType: 1,
            identifier: '0',
            token: "0xc778417e063141139fce010982780140aa0cd5ab",
            amount: (amount * 10**18 * Number(noBuying)).toString(),
            endAmount: (amount * 10**18 * Number(noBuying)).toString(),
            //recipient: address
        }],
        // Can lie and make it look like it works if i get rid of amount, end amount, allowPartialFills, and set to test[1]
        // item is the in real life 
        consideration: [{
            itemType: 2,
            token: collection.address,
            identifiers: [test[1]], // test 
            //amount: noBuying,
            //endAmount: noBuying,
            recipient: address
        }],
        //allowPartialFills: true,
    }, address);
    console.log(order);
    const executeActions = await order.executeAllActions();
    await postOffer({actions: executeActions, collection, tokenIds }, 'trait');
    console.log(executeActions);
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

type TempData = {
    value: string;
    selected?: boolean;
}

type ValueTemp = {
    value: string[];
    selectedValue?: string;
}

type TraitTemp = {
    trait_type: TempData;
    value: TempData[];
}

type SelectedTrait = {
    trait_type: string;
    value: string[];
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
    const [traits, setTraits] = useState<TraitTemp[]>([]);
    const [traitNfts, setTraitNfts] = useState<NftIds[]>([]);
    const [selectedTrait, setSelectedTrait] = useState<string | undefined>(undefined);
    const [activeTraits, setActiveTraits] = useState<SelectedTrait[]>([]);

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
        async function fetchData2(address: string, allNfts: any[]) {
            //const resp = await web3.alchemy.getNftMetadata({contractAddress: address, tokenId })
            const promises = allNfts.map(x => web3.alchemy.getNftMetadata({contractAddress: address, tokenId: x.id.tokenId }))
            const data = await Promise.all(promises);
            if (data) {
                const allNfts2: NftIds[] = data.map((x: any,i: number) => ({ ...x, id2: i})) as any;
                setTraitNfts(allNfts2);
                let allTypes: string[] = [];
                const allTraits = data.reduce((arr: any[], nft) => {
                    allTypes = union(allTypes, nft.metadata!.attributes!.map(x => x.trait_type));
                    return union(arr, nft.metadata?.attributes);
                }, []);
                const finalTraits: TraitTemp[] = allTypes.map(x => ({ trait_type: { value: x, selected: false}, value: union(allTraits.filter(y => y.trait_type == x).map(x => x.value) as string[]).map(x => ({ value: x, selected: false}))}))
                //const allTraits.
                setTraits(finalTraits);
            }
        }
        async function fetchData(address: string) {
            const resp = await getNftsByCollectionContract(address);
            if (resp) {
                console.log(resp);
                const allNfts: NftIds[] = resp.map((x: any,i: number) => ({ ...x, id2: i})) as any;
                setNfts(allNfts);
                setScrollData(allNfts);
                
                    if (selectedCollection && allNfts) {
                        fetchData2(allNfts[0].contract.address, allNfts);
                    }
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
    const makeTraitOffer = async () => {
        const buyNfts = traitNfts.filter(x => x.metadata!.attributes!.filter(x => activeTraits.find(x => x.trait_type) && activeTraits.find(x => x.trait_type)!.value.indexOf(x.value) > -1).length == activeTraits.length);
        const buyNftsIds = buyNfts.map(x => x.id.tokenId);
        if (wallets && selectedCollection) {
            await createTraitOfferTest(wallets[0].accounts[0].address, Number(ethValue), selectedCollection, noBuying, buyNftsIds);
            setOpen(true);
            setSelected([]);
        }
    };

    const makeTraitsList = () => {
        const setKeySelected = (key: string) => {
            const newTraits = traits.map(x => ({ ...x, trait_type: { ...x.trait_type, selected: key === x.trait_type.value ? true : false}  }))
            setTraits(newTraits);
        };
        const makeActiveTraits = (value: string) => {
            const newTraits = activeTraits.slice();
            const foundIndex = activeTraits.findIndex(x => x.trait_type === selectedTrait);
            if (foundIndex > -1) {
                newTraits[foundIndex].value = union(newTraits[foundIndex].value, [value]);
                setActiveTraits(newTraits)
            } else {
                newTraits.push({ trait_type: selectedTrait!, value: [value]});
            }
            return newTraits;
        };


        //console.log(traitNfts.filter(x => x.metadata!.attributes!.filter(x => activeTraits.find(x => x.trait_type) && activeTraits.find(x => x.trait_type)!.value.indexOf(x.value) > -1).length == activeTraits.length));
        return (
            <div style={{display: 'flex'}}>
               <div style={{ flexGrow: 1}}> 
                   <span><b>Trait Types</b></span>
                <List sx={{  maxWidth: 360, bgcolor: 'background.paper' }}>
                        {traits.map((value: TraitTemp) => {
                            const labelId = `checkbox-list-label-${value}`;

                            return (
                            <ListItem
                                key={value.trait_type.value}
                                disablePadding
                            >
                                <ListItemButton role={undefined} onClick={() => setSelectedTrait(value.trait_type.value)} dense>
                                <ListItemText id={labelId} primary={`${value.trait_type.value}`} />
                                </ListItemButton>
                            </ListItem>
                            );
                        })}
                    </List>
               </div>
                <div  style={{ flexGrow: 1}}>
                    <span><b>Trait Values</b></span>
                    <List sx={{ width: '40%', maxWidth: 360, bgcolor: 'background.paper' }}>
                            {selectedTrait && 
                                traits.find(x => x.trait_type.value === selectedTrait)!.value.map((value) => {
                                    const labelId = `checkbox-list-label-${value}`;

                                    return (
                                    <ListItem
                                        key={value.value}
                                        disablePadding
                                    >
                                        <ListItemButton role={undefined} onClick={() => setActiveTraits(makeActiveTraits(value.value))} dense>
                                        <ListItemText id={labelId} primary={`${value.value}`} />
                                        </ListItemButton>
                                    </ListItem>
                                    );
                            })}
                        </List>
                </div>
            </div>
        )
    }

    const removeTrait = (trait: string ) => {
        setActiveTraits(activeTraits.filter(x => trait !== x.trait_type));
    };

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
                        <Typography variant="h5" gutterBottom component="div" sx={{ p: 2, pb: 0 }}  style={{ borderBottom: '1px solid #ebebed', fontWeight: 'bold'}}>
                            Set Price for Each NFT
                        </Typography>
                    <TextField label="Price (ETH) for Each" variant="outlined" defaultValue={'0.01'} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEthValue(event.target.value)}  />
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
                        <Button variant="outlined" onClick={() => { setSelected([])}}>Go Back</Button>
                        {makeTraitsList()}
                        <Typography variant="body1" gutterBottom component="div" sx={{ p: 2, pb: 0 }}>
                            Selected Traits
                        </Typography>
                        {activeTraits.map(x => (
                            <div style={{display: 'flex'}}>
                                <Typography variant="body2" gutterBottom component="div" sx={{ p: 2, pb: 0 }}>
                                    {x.trait_type}: [{x.value.join(', ')}]
                                </Typography>
                                <Checkbox onClick={() => removeTrait(x.trait_type)} />
                            </div>
                        ))}
                        {activeTraits.length === 0 && (<span>None</span>)}
                        <hr/>
                        <TextField label="# of NFTs Buying" defaultValue={'3'} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNoBuying(event.target.value)}  />
                        <Button  variant="outlined" onClick={() => makeTraitOffer()}>Make Trait Offer</Button>
                        
                    </div>
                </div>
                )}
            </div>
        </div>
    )
}

export default AdvancedCreateOffers;