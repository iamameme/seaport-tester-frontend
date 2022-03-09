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
      <ThemeProvider theme={theme}>
    <div className="App" style={{ padding: 50, background: "#282c34"}}>
          <header className="App-header">
            <h2>Demo NFT Marketplace Aggregator</h2>
        <div style={{ width: '100%'}}>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>Opensea - ETH and Polygon NFTs</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <nft-card contractAddress="0x495f947276749ce646f68ac8c248420045cb7b5e" tokenId="84457751043465328619057449989245392658276532746991168004376457849476957077505"> </nft-card>

          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <Typography>Rarible - ETH, Flow, and Tezos NFTs</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <rarible-card
              itemId="0xbfb3e424acb4624167581e3a58dbf3ff81bc0eab:17988252055586131602068576116627035873235234406925022496179774906860079939606"
              showBuyNow="true"
              env="dev"
            >
            </rarible-card>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel3a-content"
            id="panel3a-header"
          >
            <Typography>Known Origin - Ethereum</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <KnownOriginCards ethAdd={ethAdd} />
          </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel3a-content"
                  id="panel3a-header"
                >
                  <Typography>Mintable - ETH or Immutable X</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <MintCards />
                </AccordionDetails>
              </Accordion>
        <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel3a-content"
            id="panel3a-header"
          >
            <Typography>Opensea Buy in Site Demo</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <OpenSeaCards />
          </AccordionDetails>
        </Accordion>
        </div>
        
       
        {/*<iframe
          onLoad={ () => onLoadIframe() }
          width='100%'
          height='1000px'
        frameborder='0' src="https://opensea.io/assets/0x495f947276749ce646f68ac8c248420045cb7b5e/85879054167812751372043786273165907612585945114286779657838364578449698324481?embed=true%22" />*/}
      </header>
        </div>
        </ThemeProvider>
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
        cards: resp.data.data.tokens.splice(0,2),
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
        height: 800,
        overflow: 'hidden'}}>
        {this.state.cards.map(x => {
          return (
            <div className="container">
        <img className="picture" src={x.metadata.image} />
        <div className="details">
                <h4>{ x.metadata.name}</h4>
                <p style={{overflow: 'hidden', height: 200}}>{x.metadata.description}</p>
            <div className="content">
                <div className="price">
                    <div className="icone__ethereum"></div>
                    <p>{x.lastSalePriceInEth} ETH</p>
                </div>
                
            </div>
        </div>
        <div className="creater">
            <div className="avatar"></div>
            <p>Creation of <span>Jules Wyvern</span></p>
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
  card?: MintToken;
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
    Axios.get("https://f4r75vsf8k.execute-api.us-east-1.amazonaws.com/prod/tokens/0x892848074ddea461a15f337250da3ce55580ca85:9389?network=1").then(resp => {
      console.log(resp)
      this.setState({
        card: resp.data
      })
    })
  }

  render() {
    if (!this.state.card ) {
      return <div />
    }
    return (
      <div className="realcontainer" style={{
        display: 'flex',
        width: '100%',
        height: 800,
        overflow: 'hidden'
      }}>
        <div className="container" >
          <img className="picture" src={this.state.card.image} />
          <div className="details">
            <h4>{this.state.card.name}</h4>
            <p style={{ overflow: 'hidden', height: 200 }}>{this.state.card.description}</p>
            <div className="content">
              <div className="price">
                <div className="icone__ethereum"></div>
              </div>
            </div>
          </div>
          <div className="creater">
            <div className="avatar"></div>
            <p>Creation of <span>Jules Wyvern</span></p>
          </div>
        </div>

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
        height: 800,
        overflow: 'hidden'
      }}>
        <h4>Click on This</h4>
            <div className="container" style={{ cursor: 'pointer'}} onClick={() => this.setState({ open: true})}>
              <img className="picture" src={this.state.card.image_url} />
              <div className="details">
                <h4>{this.state.card.name}</h4>
                <p style={{ overflow: 'hidden', height: 200 }}>{this.state.card.description}</p>
                <div className="content">
                  <div className="price">
                    <div className="icone__ethereum"></div>
                  </div>
                </div>
              </div>
              <div className="creater">
                <div className="avatar"></div>
                <p>Creation of <span>Jules Wyvern</span></p>
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
