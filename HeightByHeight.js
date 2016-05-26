/* jshint undef: true, esnext: true */
/* global Uint8Array, I2C1, D4, D5 */

function HeightByHeight (i2c, addr) {

    this.HEIGHTBYHEIGHT_DEFAULT_ADDRESS = 0x70;

    this.HT16K33_BLINK_CMD = 0x80;
    this.HT16K33_BLINK_DISPLAYON = 0x01;
    this.HT16K33_CMD_BRIGHTNESS = 0xE0;

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
    var transmission = [0]; // Start at address 0 and add progressively.
    for (var i=0; i < this.buffer.length; i++) {
        // We pass 16 bits in two parts. But in our case the second one is always 0 (isn't it?)
        // Also, we need to right-rotate the buffer because of the hardware wiring...
        transmission.push(rotr(this.buffer[i], 1));
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
 * Switch ON one particular LED.
 * The numbering starts at (0,0).
 *
 * Internally does a bit by bit OR with a mask.
 * 
 * @param {number} line The line of the LED
 * @param {number} col The column of the LED
 */
HeightByHeight.prototype.switchOn = function (line, col) {
    // Check that we are inside the 8x8 matrix
    if (line >=0 && line <= 7 && col >=0 && col <= 7) {
        this.buffer[line] |= (1 << col);
    }
    this.display();
};


/**
 * Switch OFF one particular LED.
 * The numbering starts at (0,0).
 *
 * Internally does a bit by bit AND with a mask.
 * 
 * @param {number} line The line of the LED
 * @param {number} col The column of the LED
 */
HeightByHeight.prototype.switchOff = function (line, col) {
    // Check that we are inside the 8x8 matrix
    if (line >=0 && line <= 7 && col >=0 && col <= 7) {
        var mask = rotl(0b11111110, col);
        this.buffer[line] &= mask;
    }
    this.display();
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

/**
 * Utility function to do a right rotation of "shift" bits for 8 bits values.
 * example: rotr(0b10001001) -> 0b11000100
 * 
 * @param  val The 8 bits value to rotate
 * @param  shift The number of rotations
 * @return the right rotated result
 */
function rotr (val, shift) {
    return (val >> shift) | (val << (8-shift));
}

/**
 * Utility function to do a left rotation of "shift" bits for 8 bits values.
 * example: rotl(0b10001001) -> 0b00010011
 * 
 * @param  val The 8 bits value to rotate
 * @param  shift The number of rotations
 * @return the left rotated result
 */
function rotl (val, shift) {
    return (val << shift) | (val >> (8-shift));
}



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