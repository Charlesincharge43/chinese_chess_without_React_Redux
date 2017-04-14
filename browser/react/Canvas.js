
'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import { draw } from '../js/chess_board';
import { store } from './store';
import { socketConnectCreator, socketDisconnectCreator, addSocketListenerCreator, tempUpdStoreListener, tempUpdPlayersListener, socketEmitCreator, update_currPlayer_AC } from './socket';
import { UPDATE_CHESS_STORE, NEW_PLAYER, UPDATE_PLAYERS_STORE } from '../js/constants';

class Canvas extends React.Component {
  constructor(){
    super();
    this.state={
      team: null,
      name:'',
      canvas: {},
      playersState:[],
      socketID: null,
      currentTurn: null,
    };
    this.captureCanvasEl = this.captureCanvasEl.bind(this);
  }

    captureCanvasEl(canvasEl){//Note, this runs BEFORE componentDidMount!!! (during the first rendering!)
      this.setState(
        {canvas: canvasEl},
      )
    }

    componentDidMount () {
      // let socketListenerUpdStore = (chessState)=> {
      //   dispatch(updStorefromSvrThunkCreator(chessState));
      // }//couldn't get this to work.. because no access to dispatch... had to do it a hacky way (see tempUpdStoreListener)

      let connect = socketConnectCreator();
      store.dispatch(connect);//this must be dispatched so dispatch function is available in the socket.on callback function

      socketEmitCreator(NEW_PLAYER, prompt("Please enter your name!"), "Updating server store with new player name!")()

      let addSocketListener1= addSocketListenerCreator(UPDATE_CHESS_STORE, tempUpdStoreListener);//ASK HAL IF THERE IS A BETTER WAY TO DO THIS!!!
      addSocketListener1();//CHANGE THIS UP SO NO NEED TO HAVE tempUpdStoreListener.. an anon function will do  ..(update: not so sure anymore.. but try it out)

      let addSocketListener2= addSocketListenerCreator(UPDATE_PLAYERS_STORE, tempUpdPlayersListener);
      addSocketListener2();

      this.unsubscribe= store.subscribe(() => {
        console.log('local store changed... (re)drawing !!');
        draw(this.state.canvas);
        console.log('local store changed... setting state and re-rendering !!');

        let storeState= store.getState();
        let storePlayersState= storeState.playersState;
        let currSocketID= storeState.currentPlayerState.socketID;
        let team= storeState.currentPlayerState.team;
        let name= storeState.currentPlayerState.name;
        let currentTurn= storeState.chessState.currentTurn;

        this.setState({
          playersState: storePlayersState,
          socketID: currSocketID,
          team: team,
          name: name,
          currentTurn: currentTurn,
        })
      })

    }

    componentWillUnmount(){
      // clear listeners//STILL NEED TO CLEAR LISTNERS>. I DONT KNOW HOW

      let disconnect= socketDisconnectCreator();
      disconnect();

      this.unsubscribe();
    }

    render() {
      // console.log(this.state);
      return(
        <div>
          {(this.state.team === 'red') && <h1 style={{color: 'red'}} className='center'>You are the red player!</h1>}
          {(this.state.team === 'black') && <h1 style={{color: 'black'}} className='center'>You are the black player!</h1>}
          {(this.state.team === null) && <h1 style={{color: 'grey'}} className='center'>You are spectating!</h1>}
          <h2 className='center'>Current Turn: {this.state.currentTurn} </h2>
          <div className='inline-block'>
            <h1 style={{color: 'grey'}}> Players/Spectators</h1>
            {this.state.playersState.map(playerObj=>{
              if(playerObj.team==='red') return(<h4 style={{color: playerObj.team}}>Red Player: {playerObj.name}</h4>)
              else if(playerObj.team==='black') return(<h4 style={{color: playerObj.team}}>Black Player: {playerObj.name}</h4>)
              else return (<h4 style={{color: 'grey'}}>Spectating: {playerObj.name}</h4>)
            })}
          </div>
          <div className='inline-block'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>

          <div className='inline-block'>
            <canvas ref={this.captureCanvasEl} id="chess" width="800" height="800"></canvas>
          </div>
        </div>
      )

    }
}

export default Canvas;
