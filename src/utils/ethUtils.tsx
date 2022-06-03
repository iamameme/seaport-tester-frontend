import { BigNumber, ethers } from 'ethers';
import { bufferToHex, keccak256 } from "ethereumjs-util";
import MerkleTree from "merkletreejs";

export const hashIdentifier = (identifier: string) =>
  Buffer.from(
    BigNumber.from(identifier).toHexString().slice(2).padStart(64, "0"),
    "hex"
  );

export const getMerkleRoot = (ids: string[]) => {
  const leaves = (ids ?? []).map(hashIdentifier);
  const tree = new MerkleTree(leaves, keccak256, {
    sort: true,
  });
  const root = tree.getRoot().toString('hex');
  return root;
}











// delete all this
export const buildResolver = (
  orderIndex: any,
  side: any,
  index: any,
  identifier: any,
  criteriaProof: any
) => ({
  orderIndex,
  side,
  index,
  identifier,
  criteriaProof,
});

export const merkleTree = (tokenIds: number[]) => {
    const elements = tokenIds
      .map((tokenId) =>
        Buffer.from(tokenId.toString(16).slice(2).padStart(64, "0"), "hex")
      )
      .sort(Buffer.compare)
      .filter((el, idx, arr) => {
        return idx === 0 || !arr[idx - 1].equals(el);
      });
  
    const bufferElementPositionIndex = elements.reduce((memo: any, el, index) => {
      memo[bufferToHex(el)] = index as any;
      return memo;
    }, {});
  
    // Create layers
    const layers = getLayers(elements);
  
    const root = bufferToHex(layers[layers.length - 1][0]);
  
    const proofs = Object.fromEntries(
      elements.map((el) => [
        ethers.BigNumber.from("0x" + el.toString("hex")).toString(),
        getHexProof(el, bufferElementPositionIndex, layers),
      ])
    );
  
    const maxProofLength = Math.max(
      ...Object.values(proofs).map((i) => i.length)
    );
  
    return {
      root,
      proofs,
      maxProofLength,
    };
  };

  const getLayers = (elements: any) => {
    if (elements.length === 0) {
      throw new Error("empty tree");
    }
  
    const layers = [];
    layers.push(elements);
  
    // Get next layer until we reach the root
    while (layers[layers.length - 1].length > 1) {
      layers.push(getNextLayer(layers[layers.length - 1]));
    }
  
    return layers;
  };

  const getNextLayer = (elements: any) => {
    return elements.reduce((layer: any, el: any, idx: any, arr: any) => {
      if (idx % 2 === 0) {
        // Hash the current element with its pair element
        layer.push(combinedHash(el, arr[idx + 1]));
      }
  
      return layer;
    }, []);
  };

  const combinedHash = (first: any, second: any) => {
    if (!first) {
      return second;
    }
    if (!second) {
      return first;
    }
  
    return keccak256(Buffer.concat([first, second].sort(Buffer.compare)));
  };
  

  const getHexProof = (el: any, bufferElementPositionIndex: any, layers: any) => {
    let idx = bufferElementPositionIndex[bufferToHex(el)];
  
    if (typeof idx !== "number") {
      throw new Error("Element does not exist in Merkle tree");
    }
  
    const proofBuffer = layers.reduce((proof: any, layer: any) => {
      const pairIdx = idx % 2 === 0 ? idx + 1 : idx - 1;
      const pairElement = pairIdx < layer.length ? layer[pairIdx] : null;
  
      if (pairElement) {
        proof.push(pairElement);
      }
  
      idx = Math.floor(idx / 2);
  
      return proof;
    }, []);
  
    return proofBuffer.map((el: any) => "0x" + el.toString("hex"));
  };