//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Wallet.sol";

contract DEX is Wallet{
    uint nextOrderId = 0;
    enum Side{
        BUY,SELL
    }

    struct Order{
        uint id;
        address trader;
        Side side;
        bytes32 ticker;
        uint amount;
        uint price;
        uint filled;
    }

    mapping(bytes32=>mapping(uint=>Order[])) public orderBook;

    function getOrderBook(bytes32 ticker, Side side) view public returns(Order[] memory){
        return orderBook[ticker][uint(side)]; 
    }

    function createLimitOrder(Side side,bytes32 ticker,uint amount,uint price) public tokenExist(ticker){
        if(side==Side.BUY){
            require(balances[msg.sender][bytes32("ETH")]>=amount*price,"Not enough balance!"); 
        }
        else if (side==Side.SELL){
            require(balances[msg.sender][ticker]>=amount*price,"Not enough balance!");
        }

        Order[] storage orders = orderBook[ticker][uint(side)];
        //[Order1,Order2,Order3...]
        orders.push(Order(nextOrderId,msg.sender,side,ticker,amount,price,0));
        
        //Bubble sort
        uint i = orders.length>0?orders.length-1:0;

        if (side==Side.BUY){
            while(i>0){
                if(orders[i-1].price>orders[i].price){break;}
                Order memory orderToMove = orders[i-1];
                orders[i-1]=orders[i];
                orders[i] = orderToMove;
                i--; 
            }
        }
        else if (side==Side.SELL  ){
            while(i>0){
                if(orders[i-1].price<orders[i].price){break;}
                Order memory orderToMove = orders[i-1];
                orders[i-1]=orders[i];
                orders[i] = orderToMove;
                i--; 
            }
        }
        nextOrderId++;
    }

    function createMarketOrder(Side side, bytes32 ticker, uint _amount) public tokenExist(ticker) {
        if (side==Side.SELL){
            require(balances[msg.sender][ticker]>=_amount,"Not enough balance!");
        }
        
        Order[] storage orders = orderBook[ticker][uint(side)];
        uint totalFilled = 0;
        for (uint i=0;i<orders.length && totalFilled<_amount;i++){
            uint leftToFill = _amount-totalFilled;
            uint availableToFill = orders[i].amount-orders[i].filled; //avalable
            uint filled = (leftToFill>availableToFill)?availableToFill:leftToFill;//How much to fill
            orders[i].filled += filled; //Update order[i] filled
            totalFilled+=filled; //How much been filled
            // Execute the trade and shift balances between the buyer and seller
            uint price = filled*orders[i].price;
            if (side==Side.BUY){

                require(balances[msg.sender]["ETH"]>=price,"Not enough balance!");// must have enough ETH to execute trade 
                //transfer ETH from buyer to seller 
                balances[msg.sender]["ETH"]-=price;
                balances[orders[i].trader]["ETH"]+=price;
                // transfer token from seller to buyer
                balances[orders[i].trader][ticker]-=filled;
                balances[msg.sender][ticker]+=filled;
                
            }

            else if (side==Side.SELL){
                // transfer token from seller to buyer
                balances[msg.sender][ticker]-=filled;
                balances[orders[i].trader][ticker]+=filled;
                // transfer ETH from buyer to seller
                balances[orders[i].trader]["ETH"]-=price;
                balances[msg.sender]["ETH"]+=price;
                
            }
        
        }
        // loop through the orderbook and remove the 100% filled orders
        // filled orders settle at the top of the orderbook
        while (orders.length > 0 && orders[0].filled == orders[0].amount) {
            // remove the top element in the orders array by overwriting it with the next element in the array
            for (uint i = 0; i < orders.length - 1; i++) {
                orders[i] = orders[i + 1];
            }
            orders.pop();
        }
        
    }
    
}
