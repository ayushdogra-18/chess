const socket= io();           // automatically request to backend (io.connection)

// socket.emit("hello");             // it on to app.js 27th line; 
// socket.on();

const chess=new Chess();

const boardElement=document.querySelector(".chessboard");


let draggedPiece=null;
let sourceSquare=null;  //konse square se vo piece uth rha hai
let playerRole=null;



const renderBoard=()=>{
const board=chess.board();
boardElement.innerHTML="";
//console.log(board);  //kon kon kha betha hai starting mai
//board ek array hai.........
board.forEach((row,rowindex)=>{      //puri row mili
//console.log(row);  ///all row
row.forEach((square,squareindex)=>{   //puri row ka ek square mila
  //  console.log(square);  //all element mill gye jo chess mai hota hai


    // for pattern making of square---till30th line
    const squareElement=document.createElement('div');   //square make
    squareElement.classList.add(
        "square",
        (rowindex + squareindex) % 2===0?"light":"dark"   
        
    );// square box ka color ......like first row and square is zero then it is light square and next is dasrk square  (alternate way as in chess board one light one dark)

    squareElement.dataset.row=rowindex;         //every square have value like (0,3 like matrix)
    squareElement.dataset.col=squareindex;     //every square have value like (0,3 like matrix)


    //enke upper element hai ya ni vo banana hai....
    if(square){
        const pieceElement=document.createElement('div');
        pieceElement.classList.add("piece",
            square.color==='w'?"white":"black");
            pieceElement.innerText=getPieceUnicode(square);
            pieceElement.draggable=playerRole===square.color  //give true or flase

            pieceElement.addEventListener('dragstart',(e)=>{
                if(pieceElement.draggable){   //piece is draggeable
                    draggedPiece=pieceElement;   //save in pieceElement
                    sourceSquare={row:rowindex,col:squareindex}   //element is dragged from which row and which column
                    e.dataTransfer.setData("text/plain","")   //it is mainy if problem in dragging in cross platform so it solve this.....it is nessecary
                };
            });
            pieceElement.addEventListener('dragend',(e)=>{
                draggedPiece=null;
                sourceSquare=null;
            })
            squareElement.appendChild(pieceElement); ///square mai element attach kr diya hai
    }
    squareElement.addEventListener('dragover',(e)=>{
        e.preventDefault();    //it prevent from the square in which it is empty square not an element (if player agar kisi khali square ko drag karega toh ni hoga)
    })
    squareElement.addEventListener('drop',(e)=>{
        e.preventDefault();   
        if(draggedPiece){
            const targetSource={
                //values aa gyi hai line 34-35 se
                row:parseInt(squareElement.dataset.row), //go to line 34-35 .....number it is made string so used parseInt()
                col:parseInt(squareElement.dataset.col)
            }
            handelMove(sourceSquare,targetSource);          //matlab ek quare se dusarse square tk move kr do
        }
    })
    boardElement.append(squareElement);
})
 
});
if(playerRole==='b'){
    boardElement.classList.add("flipped")
}else{
    boardElement.classList.remove("flipped");
}
};

const handelMove=(source,target)=>{
const move={
    from: `${String.fromCharCode(97+source.col)}${8-source.row}`,     //col and row name /////row ke number hote hai col ke letter hote hai
    to:`${String.fromCharCode(97+target.col)}${8-target.row}`,  
    promotion:'q'  //if the piyada reached to the last square then it convert in to  queen
}
socket.emit("move",move)
}

const getPieceUnicode=(piece)=>{           //for faces of elements  like hourse,king,queen
const unicodePieces={
    p: "♙",
    r: "♖" ,  
    n: '♞', 
    b: '♗',
    q: '♛',
    k: '♔', 
    P: '♟', 
    R: '♜', 
    N: '♞', 
    B: '♗',
    Q: '♛', 
    K: '♚'  

}
return unicodePieces[piece.type]|| "";
}


socket.on("playerRole",(role)=>{
  playerRole=role;
  renderBoard();
})

socket.on("spectatorRole",()=>{
    playerRole=null;
    renderBoard();
  })

  socket.on("boardState",(fen)=>{
   chess.load(fen);       //fen equation loaded it load new state
   renderBoard();
  })
  socket.on("move",(move)=>{
    chess.load(move);     
    renderBoard();
   })


   socket.on('checkmate', (winner) => {
    alert(`Checkmate! ${winner === 'white' ? 'White' : 'Black'} wins!`);
});
renderBoard();