# SUPERLUMEN
A powerful, open-source, free [Lumen](https://www.stellar.org/lumens/) wallet, blockchain explorer, and exchange interface for [Stellar Core](https://www.stellar.org/) blockchain networks. Superlumen is more than just a basic wallet. Our goal is to provide a tool and interface that leverages the Stellar network features to their fullest. Here's just a few features to look forward to:

- Secure Wallet.
  - Optional recovery record forwhen you've lost your key-file or forgotten your password.
  - Multi-account support.
  - Keep memo records.
  - Set inflation pool.
- Send/Recieve
  - Send Lumens (XLM) or any Stellar asset.
  - Leverage Path Payments to pay with one asset, converted to another through the network as a series of offers.
  - Receive by crafting a secure message.
- Stellar Distributed Exchange
  - Watch &amp; subscribe to orderbooks between assets.
  - Create your own buy/sell orders.
- Transaction Explorer
  - Browse and view the details of any tx on the blockchain.
  - Easily review the transactions on your accounts.
- Asset Manager
  - Review and manage the assets owned by your accounts.

### !!This wallet is not yet functional.
### Currently under active development. **Beta ETA Jan 2018.**

Check out our [milestones](https://github.com/super-lumen/superlumen-gui/milestones) for a status of where we are.

#### Preview
Showing the first steps of creating a new wallet...  
![Preview](https://thumbs.gfycat.com/SecondaryThirdEland-size_restricted.gif)

> #### Support the free and open development of Superlumen
> We are not associated with IBM, the Stellar Org, or any other company. This project is maintained by ordinary people just like you. You can show your support by contributing code, content, bug reports, or by donating some lumens.  
> ❤ We really appreciate it!  
> 
> *Stellar Donation Address:*  
> GBOBXLZCZWCP4A3FAWX7244JFFEDTVR75L4AK45Z5ZOCQV3NHNSYWQX2  
> 

---

## Building
You can build Superlumen on the following operating systems:
- Debian Linux: Stretch

In general, you should be able to build on other OS's with no or little modification.

### Steps
Make sure you have the latest version of [node.js](https://nodejs.org/) installed, at the moment, we are using node v8.9.1.

1. Clone this repository and open a console in the directory.
2. Run ```npm install```
3. Run ```npm run start```
4. You did it! Superlumen should be up and running.

#### Creating Executables & Packages
This project is loosely supporting Windows, Mac, Linux, and FreeBSD. Our team is too small to test all OS's, so if you discover a problem, please report it in our project [issues](https://github.com/super-lumen/superlumen-gui/issues).

Creating the executables is done simply by running:   
```npm run dist```  

We leverage the [electron](https://electronjs.org/) to compile and power the app itself, and [electron-builder](https://github.com/electron-userland/electron-builder) to perform packaging.

#### Linux (Debian)
On Debian systems you may need to install additional packaging tools if you want to generate a distribution.

Running ```sudo apt install build-essential rpm bsdtar icnsutils imagemagick``` should ensure you have the right tools.

##### Generating Mac/Windows Icons
To regenerate the Mac and Windows icon files from the icon PNGs you should run the npm script ```icons```.

Example: ```npm run icons```

For the Mac icon generation the script requires the png2icns program from the debian icnsutils package. 
You can install the package by running: ```sudo apt install icnsutils```.

For Windows icon generation imagemagick is required.
You can install the package by running: ```sudo apt install imagemagick```.

