import React from 'react';
import logo from './logo.svg';
import './App.css';
import Axios from 'axios';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ThemeProvider, useTheme, createTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

/*eslint no-unused-expressions: "off"*/
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "rarible-card": any;
      "nft-card": any;
    }
  }
}
const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});
class App extends React.Component {
  
  componentDidMount() {
    //document.getElementsByClassName('asset-action-buy')[0].get
  }
  render() {
    function onLoadIframe() {
      setTimeout( () => {
        //document.getElementsByClassName( 'Footer--row' )[ 0 ].style.display = "none";
      }, 1500 );
    };
    const ethAdd = "0xd7e1bc51cd3f30e21b17bab33d77078e3fb7cc26";
    return (
    <div className="App" style={{ }}>
          <header className="App-header">
          <div style={{
            width: '100%', borderBottom: '1px solid #e0e0e3', background: 'white',
                  flexDirection: 'column',
    display: 'flex',
            padding: 15, 
          }}>
            <img style={{
              width: 70,
              left: 20,
              position: 'absolute'}} src={require('./images/transparentlogo.png')} />
            <h2 style={{
              color: 'purple',
              fontFamily: 'Space Mono',
            }}>Demo NFT Marketplace Aggregator</h2>
          </div>
          <div style={{ width: '100%' }}>
            <div style={{ background: '#f4f5f7'}}>
              <Typography style={{ fontWeight: 500,
              padding: 10,
              fontSize: 24,
                color: 'black'
              }}>Opensea - ETH and Polygon NFTs</Typography>
              <Typography style={{ color: 'rgb(123, 128, 154)'}} variant="body2">This shows Opensea NFTs with links to Opensea</Typography>

            <div style={{ display: 'flex', overflowX: 'scroll',  }}>
                {['84457751043465328619057449989245392658276532746991168004376457849476957077505', '84457751043465328619057449989245392658276532746991168004376457817591119872001', '84457751043465328619057449989245392658276532746991168004376457847277933821953'].map(x => (<nft-card style={{margin: 40}} contractAddress="0x495f947276749ce646f68ac8c248420045cb7b5e" tokenId={x}> </nft-card>))}
              </div>
            </div>
            <div style={{ background: 'white' }}>
              <Typography style={{
                fontWeight: 500,
                padding: 10,
                fontSize: 24,
                color: 'black'
              }}>Rarible - ETH, Flow, and Tezos NFTs</Typography>
              <Typography style={{ color: 'rgb(123, 128, 154)' }} variant="body2">This shows Rarible NFTs with the ability to buy a Rarible NFT without leaving the site</Typography>

              <div style={{ display: 'flex', overflowX: 'scroll',  }}>

                {['0xbfb3e424acb4624167581e3a58dbf3ff81bc0eab:17988252055586131602068576116627035873235234406925022496179774906860079939606', '0x3ffdf4ca0c52c284f290ccd12a6a1985312e7d0e:17988252055586131602068576116627035873235234406925022496179774906860079939643', '0xbfb3e424acb4624167581e3a58dbf3ff81bc0eab:17988252055586131602068576116627035873235234406925022496179774906860079939634', '0xbfb3e424acb4624167581e3a58dbf3ff81bc0eab:17988252055586131602068576116627035873235234406925022496179774906860079939636'].map(x => (<React.Fragment><rarible-card
              itemId={x}
              showBuyNow="true"
              env="dev"
              style={{margin: 20}}
            /></React.Fragment>))}
                </div>
            </div>
            <div style={{ background: '#f4f5f7' }}>
              <Typography style={{
                fontWeight: 500,
                padding: 10,
                fontSize: 24,
                color: 'black'
              }}>Known Origin - Ethereum</Typography>
              <Typography style={{ color: 'rgb(123, 128, 154)' }} variant="body2">This shows Known Origin NFTs with links to Known Origin</Typography>

              <div style={{ display: 'flex', overflowX: 'scroll', }}>
                <KnownOriginCards ethAdd={ethAdd} />
              </div>
             </div>

            <div style={{ background: 'white' }}>
   
              <Typography style={{
                fontWeight: 500,
                padding: 10,
                fontSize: 24,
                color: 'black'
              }}>Mintable - ETH or Immutable X</Typography>
              <Typography style={{ color: 'rgb(123, 128, 154)' }} variant="body2">This shows Mintable NFTs with links to Mintable</Typography>

              <div style={{ display: 'flex', overflowX: 'scroll', }}>
                <MintCards />
              </div>
            </div>
            
            <div style={{ background: '#f4f5f7' }}>
  
              <Typography style={{
                fontWeight: 500,
                padding: 10,
                fontSize: 24,
                color: 'black'
              }}>Opensea Buy in Site Demo</Typography>
              <Typography style={{ color: 'rgb(123, 128, 154)' }} variant="body2">These are Opensea NFTs with a way to buy/sell without leaving the site</Typography>

              <div style={{ display: 'flex', overflowX: 'scroll', }}>
                <OpenSeaCards />
              </div>
            </div>

        </div>
      </header>
        </div>
  );
}
}

type OriginProps = {
  ethAdd: string;
}
type OriginState = {
  cards: OriginToken[]
}
type OriginToken = {
  "id": string,
  "lastSalePriceInEth": string,
  "lastTransferTimestamp": string
  metadata: OriginMetaData
}
type OriginMetaData = {
    "name": string
    "description": string
    "image": string
}
class KnownOriginCards extends React.Component<OriginProps, OriginState> {
  constructor (props: OriginProps) {
    super(props);
    this.state = {
      cards: []
    }
  }

  componentDidMount() {
    Axios.post("https://api.thegraph.com/subgraphs/name/knownorigin/known-origin", {
      query: `{\n  tokens(where: {currentOwner_in: [\"${this.props.ethAdd}\"]}) {\n    id\n    lastSalePriceInEth\n    lastTransferTimestamp\n    metadata {\n      name\n      description\n      image\n    }\n  }\n}\n`
    }).then(resp => {
      this.setState({
        cards: resp.data.data.tokens.splice(0,4),
      })
    })
  }

  render() {
    if (!this.state.cards || this.state.cards.length == 0) {
      return <div/>
    }
    return (
      <div className="realcontainer" style={{
        display: 'flex',
        width: '100%',
        overflowX: 'scroll',
        overflowY: 'hidden'}}>
        {this.state.cards.map(x => {
          return (
            <div className="container">
        <img className="picture" src={x.metadata.image} />
        <div className="details">
                <h4>{ x.metadata.name}</h4>
                <p style={{overflow: 'hidden', height: 200}}>{x.metadata.description.slice(0,200)}</p>
            <div className="content">
                <div className="price">
                    <div className="icone__ethereum"></div>
                    <p>{x.lastSalePriceInEth} ETH</p>
                </div>
                
            </div>
        </div>
    </div>
   
          );
        })}
      </div>
    );
  }
}

type MintProps = {
  //ethAdd: string;
}
type MintState = {
  cards?: MintToken[];
}
type MintToken = {
  name: string,
  image: string,
  description: string,
}

class MintCards extends React.Component<MintProps, MintState> {
  constructor (props: MintProps) {
    super(props);
    this.state = {
    }
  }

  componentDidMount() {
    const tokens = ['cX-JCCx2jhDTGoS', '0x892848074ddea461a15f337250da3ce55580ca85:9389', 'o2cn_zeQFgd2LMV']
    Axios.all(tokens.map(x => (Axios.get(`https://f4r75vsf8k.execute-api.us-east-1.amazonaws.com/prod/tokens/${x}?network=1`)))).then(resps => {
      this.setState({
        cards: [resps[0].data, resps[1].data, resps[2].data],
      })
    });
  }

  render() {
    if (!this.state.cards) {
      return <div />
    }
    return (
      <div className="realcontainer" style={{
        display: 'flex',
        width: '100%',
        overflow: 'hidden'
      }}>
        {this.state.cards.map(x => (
          <div className="container" >
            <img className="picture" src={x.image} />
            <div className="details">
              <h4>{x.name}</h4>
              <p style={{ overflow: 'hidden', height: 200 }}>{x.description}</p>
              <div className="content">
                <div className="price">
                  <div className="icone__ethereum"></div>
                </div>
              </div>
            </div>
          </div>
        ))}

      </div>
    );
  }
}


type OpenProps = {
}
type OpenState = {
  card?: OpenToken;
  open: boolean
}
type OpenToken = {
  name: string,
  "image_url": string,
  description: string,
}
const contractAddress = "0x495f947276749ce646f68ac8c248420045cb7b5e",
  tokenId = "84457751043465328619057449989245392658276532746991168004376457849476957077505";

class OpenSeaCards extends React.Component<OpenProps, OpenState> {
  constructor (props: OpenProps) {
    super(props);
    this.state = {
      //card: []
      open: false,
    }
  }

  componentDidMount() {
    Axios.get(`https://api.opensea.io/api/v1/asset/${contractAddress}/${tokenId}`).then(resp => {
      this.setState({
        card: resp.data,
      })
    })
  }

  render() {
    if (!this.state.card) {
      return <div />
    }
    return (
      <div className="realcontainer" style={{
        display: 'flex',
        width: '100%',
        overflow: 'hidden'
      }}>
            <div className="container" style={{ cursor: 'pointer'}} onClick={() => this.setState({ open: true})}>
              <img className="picture" src={this.state.card.image_url} />
              <div className="details">
            <h4>{this.state.card.name}</h4>
            <h4>CLICK ON THIS CARD</h4>
                <p style={{ overflow: 'hidden', height: 200 }}>{this.state.card.description}</p>
                <div className="content">
                  <div className="price">
                    <div className="icone__ethereum"></div>
                  </div>
                </div>
              </div>
            </div>
        <Dialog
          open={this.state.open}
          onClose={() => this.setState({ open: false })}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          fullWidth
          maxWidth='lg'
        >
          <DialogTitle >
            <h2>Demo Opensea In Site Purchasing</h2>
            <IconButton style={{
              position: 'absolute',
              top: 20,
              right: 20}} onClick={() => { this.setState({ open: false}) }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent style={{
            maxWidth: 'none',
            overflow: 'hidden'
          }} >
            <div style={{ width: '100%', height: '800px',  }} >
              <iframe
                width='100%'
                height='100%'
                src={`https://opensea.io/assets/${contractAddress}/${tokenId}?embed=true%22`}
              />
            </div>
          </DialogContent>
          </Dialog>
      </div>
    );
  }
}

export default App;
