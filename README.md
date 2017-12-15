
## Building
This software is buildable on Windows, Mac, and Linux. Specifically, building is only supported on:
- Debian Linux: Stretch
- Microsoft Windows 10
- MacOS

### Linux (Debian)
On Debian systems you may need to install additional packaging tools if you want to generate a distribution.

Running ```sudo apt install build-essential rpm bsdtar``` should ensure you have the right tools.

#### Generating Mac/Windows Icons
To regenerate the Mac and Windows icon files from the icon PNGs (```build/icons/*.png```) you should run the npm script ```icons```.

Example: ```npm run icons```

For the Mac icon generation the script requires the png2icns program from the debian icnsutils package. 
You can install the package by running: ```sudo apt install icnsutils```.

For Windows icon generation imagemagick is required.
You can install the package by running: ```sudo apt install imagemagick```.
