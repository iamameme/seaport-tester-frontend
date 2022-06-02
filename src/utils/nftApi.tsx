const UBIQUITYKEY = 'bd1b8795z1zTtnO3LWo6qq26c4WL7xAlb7EJYwbXGjsu8At'

// I really shouldn't be using these apis as they aren't public but hey, saves me some time
export const getCollections = async (search?: string) => {
    let searchQuery = '';
    if (search) {
        searchQuery = `&search=${search}`;
    }
    const resp = await fetch(`https://api-testnets.nftrade.com/api/v1/contracts?limit=100${searchQuery}`)
    const data = await resp.json();
    console.log(data);
    return data;
}

export const getNftsByCollectionContract = async (contract: string) => {
    const resp = await fetch(`https://api-testnets.nftrade.com/api/v1/tokens?contracts[]=${contract}&chains[]=4&search=&sort=listed_desc&skip=0&limit=75`, {
    })
    const data = await resp.json();
    const newData = data.map((x: any) => ({
        metadata: { image: x.image },
        contract: x.contract,
        id: { tokenId: x. tokenID},
        title: x.name,
    }));
    console.log(newData);
    return newData; 
}

export const NETWORK = 'testnet';
/*
export const getCollections = async (search?: string) => {
    let searchQuery = '';
    if (search) {
        searchQuery = `&search=${search}`;
    }
    const protocol = 'ethereum';
    const resp = await fetch(`https://ubiquity.api.blockdaemon.com/v1/nft/${protocol}/${NETWORK}/collections?collection_name=${search}`, 
        {
            headers: {
                Authorization: `Bearer ${UBIQUITYKEY}`
            }
        })
    const data = await resp.json();
    console.log(data);
    return data;
}

export const getNftsByCollectionContract = async (search?: string) => {
    let searchQuery = '';
    if (search) {
        searchQuery = `&search=${search}`;
    }
    const protocol = 'ethereum';
    const resp = await fetch(`https://ubiquity.api.blockdaemon.com/v1/nft/${protocol}/${NETWORK}/assets?contract_address=${search}`)
    const data = await resp.json();
    console.log(data);
    return data;
}
*/


//https://api-testnets.nftrade.com/api/v1/tokens?contracts[]=0xca7c2a84c8a31f86a6d2fe6ac7fcac989801999e&chains[]=4&search=&sort=listed_desc&skip=0&limit=75
//https://api-testnets.nftrade.com/api/v1/tokens?contracts[]=0xca7c2a84c8a31f86a6d2fe6ac7fcac989801999e&chains[]=4&search=&sort=listed_desc&skip=0&limit=75
//https://api-testnets.nftrade.com/api/v1/tokens?contracts[]=3a670b98-04f2-4888-b1e8-bf0831673edc&chains[]=4&search=&sort=listed_desc&skip=0&limit=75

