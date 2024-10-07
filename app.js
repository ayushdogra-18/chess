const express = require('express');
const socket = require('socket.io');
const http = require('http');
const { Chess } = require('chess.js');
const path = require('path');
// const { log } = require('console');

const app = express();
const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();
let player = {}
let currentplayer = "w"


app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index", { title: "Chess Game" });
})

io.on("connection", (uniquesocket) => {          //decide  message kis kis ke apss pahuchega 
    console.log("Connected");

    // uniquesocket.on ("hello",()=>{                                          
    // io.emit("hello")

    // uniquesocket.on("disconnect",()=>{
    //     console.log("disconnected");
    // })
              ///IO.on sabko bheta hai response
              ///uniquesocket particular bande ko bheta hai (uniquesocket is a evenet name given by me not a predefined name)
    // })

    if (!player.white) {
        player.white = uniquesocket.id;
        uniquesocket.emit("playerRole","w");             //backend give response to frontend means (mai batana jo connect hua hai)    
    }else if(!player.black){
        player.black=uniquesocket.id;
        uniquesocket.emit("playerRole","b");
    }else{
        uniquesocket.emit("spectatorRole");
    }

        // FOR DESCONNECTION ------>
    uniquesocket.on("disconnect",()=>{
        if(uniquesocket.id===player.white){
            delete player.white;
        }
        if(uniquesocket.id===player.black){
            delete player.black;
        }
    });

    uniquesocket.on("move",(move)=>{
        try{
            //checking player is valid or not 
            if(chess.turn()==='w' && uniquesocket.id!=player.white){
                return;
            }
            if(chess.turn()==='b' && uniquesocket.id!=player.black){
                return;
            }

           const result= chess.move(move);     //move the element in chess game in backend  and if it is wrong move then it goes in result  and result if condition not work and it go to catch block and give error
           if(result){
            currentplayer=chess.turn();    //update the player after one turn of previous player
            io.emit("move",move);         //result move element in backend but it not move in frontend so by this the move event is shown in  frontend to all
            io.emit("boardState",chess.fen())        //chess board state (boardState is event)  

            //fen Notation(chess ki current state) ---->ye ek lambi notation hoti hai eske ander hota hai ki game ki konsi cheeze kha pur hai (position)
            }else{
                console.log("Invalid Move : ", move);
                uniquesocket.emit("Invalid Move : ", move);    //give message to particular player
            }
        }catch(err){
            console.log(err);
            console.log("Invalid Move : ", move);
            uniquesocket.emit("Invalid Move : ", move);    //give message to particular player
            
     }
    })

});




server.listen(3000, '0.0.0.0');

