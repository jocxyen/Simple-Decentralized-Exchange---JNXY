//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract JNXY is ERC20, ERC20Burnable {
    constructor() ERC20("Jnxy","JNXY") {
        _mint(msg.sender,100000000);
    }
}
