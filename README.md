# SUPERLUMEN
A powerful, open-source, free [Lumen](https://www.stellar.org/lumens/) wallet for [Stellar Core](https://www.stellar.org/) blockchain networks.

**!! This wallet is not yet functional. It is currently under active development. Beta ETA Jan 2018.**

You can support our efforts by sending XLM to:
GBOBXLZCZWCP4A3FAWX7244JFFEDTVR75L4AK45Z5ZOCQV3NHNSYWQX2
Thanks! We really appreciate it!

Preview Screenshot:
![Preview](https://i.imgur.com/M4n4pcc.png)
---

## Building
You can build Superlumen on the following operating systems:
- Debian Linux: Stretch

In general, you should be able to build on other OS's with no or little modification.

### Linux (Debian)
On Debian systems you may need to install additional packaging tools if you want to generate a distribution.

Running ```sudo apt install build-essential rpm bsdtar icnsutils imagemagick``` should ensure you have the right tools.

#### Generating Mac/Windows Icons
To regenerate the Mac and Windows icon files from the icon PNGs you should run the npm script ```icons```.

Example: ```npm run icons```

For the Mac icon generation the script requires the png2icns program from the debian icnsutils package. 
You can install the package by running: ```sudo apt install icnsutils```.

For Windows icon generation imagemagick is required.
You can install the package by running: ```sudo apt install imagemagick```.
