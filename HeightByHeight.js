/* jshint undef: true, esnext: true */

function HeightByHeight (i2c, addr) {

    this.HEIGHTBYHEIGHT_DEFAULT_ADDRESS = 0x70;

    this.HT16K33_BLINK_CMD = 0x80;
    this.HT16K33_BLINK_DISPLAYON = 0x01;
    this.HT16K33_BLINK_OFF = 0;

    // Instantiate the variables
    this.i2c = i2c;
    this.addr = addr || this.HEIGHTBYHEIGHT_DEFAULT_ADDRESS;
    this.buffer = [0,0,0,0,0,0,0,0]; //* lines of 8 pixels. Initial state is 0 = Off

}

/**
  * This function is called when using the connect function.
 */
HeightByHeight.prototype.begin = function () {
    //Turn on oscillator (no idea what that mean... TODO)
    this.i2c.writeTo(this.addr, 0x21);
    //Blink off
    this.i2c.writeTo(this.addr, this.HT16K33_BLINK_CMD | this.HT16K33_BLINK_DISPLAYON | (0 << 1)); 
    //Set brightness to 15
    this.i2c.writeTo(this.addr, this.HT16K33_CMD_BRIGHTNESS | 15);
    //Display the current buffer = only 0s
    this.display();
};

/**
 * Transmit the content of the buffer to the LED matrix.
 */
HeightByHeight.prototype.display = function () {
    var transmission = [0x00]; // Start at address 0 and add progressively.
    for (var i=0; i < this.buffer.length; i++) {
        // We pass 16 bits in two parts. The second one is always 0 in our case. (Isn't it?)
        transmission.push(this.buffer[i]);
        transmission.push(0);
    }
    // Now, transmit all the content to the LED matrix
    this.i2c.writeTo(this.addr, transmission);
};

/**
 * Will set the internal buffer
 * @param {Array} buffer an Array of 8 integers - one per line of display.
 */
HeightByHeight.prototype.setBuffer = function (buffer) {
    this.buffer = buffer;
};

/**
 * Switch ON one particular LEDD 
 * @param {Array} buffer an Array of 8 integers - one per line of display.
 */
HeightByHeight.prototype.switchOn = function (line, col) {
    //this.buffer = buffer;
    // see here https://github.com/adafruit/Adafruit_Python_LED_Backpack/blob/master/Adafruit_LED_Backpack/Matrix8x8.py
    // there is a formula to set the correct bit.
};

HeightByHeight.prototype.d = function (val) {
    for (var i=0; i < this.buffer.length; i++) {
        this.buffer[i] = val;
    }
    this.display();
};

HeightByHeight.prototype.f = function (val) {
    this.buffer = [val,0,0,0,0,0,0,0];
    this.display();
};

/*
exports.connect = function ( i2c, i2cAddress ) {
    var matrix = new HeightByHeight( i2c, i2cAddress );
    matrix.begin();
    return matrix;
};
*/

I2C1.setup({sda: D4, scl: D5});
var matrix = new HeightByHeight(I2C1, 0x70);
matrix.begin();